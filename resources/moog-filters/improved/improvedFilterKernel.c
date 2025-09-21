#include <math.h>
#include <string.h>
#include <emscripten.h>

#define SAMPLE_RATE 44100.0
#define WEBEAUDIO_FRAME_SIZE 128

// Filter state variables
static double stage[4];
static double delay[4];
static double g;           // Cutoff coefficient
static double resonance;   // Resonance amount
static double VT;          // Thermal voltage for tanh approximation

// Cutoff control
static float cutoff = 1000.0f;
static float targetCutoff = 1000.0f;
static float cutoffSmoothing = 0.1f;

// Envelope control
static float envelopeCutoff = 1000.0f;
static float manualCutoff = 1000.0f;
static int envelopeActive = 0;
static int envelopePhase = 0;
static float currentTime = 0.0f;
static float envelopeStartTime = 0.0f;
static float envelopeStartCutoff = 1000.0f;
static float envelopeTargetCutoff = 1000.0f;
static float envelopeDuration = 0.1f;
static float envelopeDecayTime = 0.1f;
static float envelopeSustainLevel = 0.5f;

// DC blocking
static float dcBlockInput = 0.0f;
static float dcBlockOutput = 0.0f;
static const float dcBlockCoeff = 0.995f;

// Input/output buffers
static float inputBuffer[WEBEAUDIO_FRAME_SIZE];
static float outputBuffer[WEBEAUDIO_FRAME_SIZE];

// Improved Moog filter implementation
// Based on D'Angelo and Valimaki's model with better stability
void updateFilterCoefficients() {
    float fc = cutoff / SAMPLE_RATE;

    // Reasonable frequency limits for stability
fc = fmin(fc, 0.4); // Allow higher frequencies for musical range

    // Simplified Moog filter coefficient calculation
// Use a more direct approach that produces audible results
double w0 = 2.0 * M_PI * fc;

// Calculate g coefficient - ensure it's large enough to be audible
// This is a simplified version that should work better
g = w0 / (w0 + 1.0);

// Clamp g to ensure stability and audibility
g = fmax(0.1, fmin(g, 0.9)); // Minimum 0.1 to ensure some filtering effect

// Thermal voltage for tanh approximation
VT = 0.026; // 26mV at room temperature
}

EMSCRIPTEN_KEEPALIVE
int inputBufferPtr() {
    return (int)inputBuffer;
}

EMSCRIPTEN_KEEPALIVE
int outputBufferPtr() {
    return (int)outputBuffer;
}

EMSCRIPTEN_KEEPALIVE
void setCutoff(float c) {
    targetCutoff = c;
    manualCutoff = c;
    updateFilterCoefficients();
}

EMSCRIPTEN_KEEPALIVE
void setResonance(float r) {
    // Clamp resonance to prevent instability
    resonance = fmax(0.0, fmin(0.9, r));
}

EMSCRIPTEN_KEEPALIVE
void setEnvelopeActive(int active) {
    envelopeActive = active;
    if (active) {
        envelopePhase = 1;
        envelopeStartTime = currentTime;
        envelopeStartCutoff = envelopeCutoff;
        envelopeTargetCutoff = manualCutoff;
    } else {
        envelopePhase = 0;
    }
}

EMSCRIPTEN_KEEPALIVE
void setEnvelopeCutoff(float c) {
    envelopeCutoff = c;
    targetCutoff = c;
    updateFilterCoefficients();
}

EMSCRIPTEN_KEEPALIVE
void setEnvelopeAttack(float startCutoff, float peakCutoff, float attackTime) {
    envelopeStartCutoff = startCutoff;
    envelopeTargetCutoff = peakCutoff;
    envelopeDuration = attackTime;
    envelopePhase = 1;
    envelopeStartTime = currentTime;
}

EMSCRIPTEN_KEEPALIVE
void setEnvelopeRelease(float targetCutoff, float releaseTime) {
    envelopeStartCutoff = envelopeCutoff;
    envelopeTargetCutoff = targetCutoff;
    envelopeDuration = releaseTime;
    envelopePhase = 3;
    envelopeStartTime = currentTime;
}

EMSCRIPTEN_KEEPALIVE
void setEnvelopeDecayTime(float decayTime) {
    envelopeDecayTime = decayTime;
}

EMSCRIPTEN_KEEPALIVE
void setEnvelopeSustainLevel(float sustainLevel) {
    envelopeSustainLevel = sustainLevel;
}

EMSCRIPTEN_KEEPALIVE
void updateEnvelope(float time) {
    currentTime = time;

    if (envelopePhase == 0) return;

    float elapsed = currentTime - envelopeStartTime;
    float progress = elapsed / envelopeDuration;

    if (progress >= 1.0f) {
        if (envelopePhase == 1) {
            envelopeStartCutoff = envelopeTargetCutoff;
            float sustainCutoff = envelopeStartCutoff + (manualCutoff - envelopeStartCutoff) * (1.0f - envelopeSustainLevel);
            envelopeTargetCutoff = sustainCutoff;
            envelopeStartTime = currentTime;
            envelopeDuration = envelopeDecayTime;
            envelopePhase = 2;
        } else if (envelopePhase == 2) {
            envelopePhase = 3;
        } else if (envelopePhase == 3) {
            return;
        }
        progress = 1.0f;
    }

    envelopeCutoff = envelopeStartCutoff + (envelopeTargetCutoff - envelopeStartCutoff) * progress;
    targetCutoff = envelopeCutoff;
    updateFilterCoefficients();
}

EMSCRIPTEN_KEEPALIVE
void init() {
    // Initialize filter state
    memset(stage, 0, sizeof(stage));
    memset(delay, 0, sizeof(delay));

    setCutoff(1000.0f);
    setResonance(0.1f);
    manualCutoff = 1000.0f;
    envelopeCutoff = 1000.0f;
    envelopeActive = 0;
    envelopePhase = 0;
    currentTime = 0.0f;
    envelopeSustainLevel = 0.5f;

    cutoffSmoothing = 0.1f;

    updateFilterCoefficients();
}

// Smooth parameter interpolation to prevent popping
inline float smoothParameter(float current, float target, float smoothing) {
    return current + (target - current) * smoothing;
}

// Improved Moog ladder filter with better stability
EMSCRIPTEN_KEEPALIVE
void filter() {
    // Smooth parameter changes to prevent popping
    cutoff = smoothParameter(cutoff, targetCutoff, cutoffSmoothing);

    // Update coefficients if needed
    updateFilterCoefficients();

    // Process all samples
    for (int i = 0; i < WEBEAUDIO_FRAME_SIZE; i++) {
        // Apply DC blocking to prevent low-frequency artifacts
        float input = inputBuffer[i];
        float dcBlockedInput = input - dcBlockInput + dcBlockCoeff * dcBlockOutput;
        dcBlockInput = input;
        dcBlockOutput = dcBlockedInput;

        // Apply resonance feedback with reasonable limits
        float resonanceFeedback = 4.0 * resonance * stage[3];
        resonanceFeedback = fmax(-0.8, fmin(0.8, resonanceFeedback));
        float inputWithResonance = dcBlockedInput - resonanceFeedback;

        // Simplified Moog ladder stages - ensure audible output
        double inputStage = inputWithResonance;

        // First stage
        stage[0] = g * (inputStage - stage[0]) + stage[0];
        stage[0] = fmax(-5.0, fmin(5.0, stage[0]));
        delay[0] = inputStage;

        // Second stage
        stage[1] = g * (stage[0] - stage[1]) + stage[1];
        stage[1] = fmax(-5.0, fmin(5.0, stage[1]));
        delay[1] = stage[0];

        // Third stage
        stage[2] = g * (stage[1] - stage[2]) + stage[2];
        stage[2] = fmax(-5.0, fmin(5.0, stage[2]));
        delay[2] = stage[1];

        // Fourth stage
        stage[3] = g * (stage[2] - stage[3]) + stage[3];
        stage[3] = fmax(-5.0, fmin(5.0, stage[3]));
        delay[3] = stage[2];

        // Final output with clamping and stability check
        float output = (float)stage[3];
        output = fmax(-1.0, fmin(1.0, output));

        // Additional stability check
        if (isnan(output) || isinf(output)) {
            memset(stage, 0, sizeof(stage));
            memset(delay, 0, sizeof(delay));
            output = 0.0f;
        }

        outputBuffer[i] = output;
    }
}

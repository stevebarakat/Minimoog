/*
 *  Stilson Moog Ladder Filter Implementation
 *  Based on Tim Stilson's analysis of the Moog VCF with compromise poles at z = -0.3
 *  This implementation provides better decoupling of cutoff and resonance controls
 *  compared to the bilinear transform, while maintaining stability and musical quality.
 *
 *  compilation directive:
 *  emcc -O3 -s WASM=1 stilsonFilterKernel.c -o stilsonFilterKernel.wasm --no-entry
 */

#include <emscripten.h>
#include <math.h>
#include <string.h>

#define WEBEAUDIO_FRAME_SIZE 128

static float inputBuffer[WEBEAUDIO_FRAME_SIZE];
static float outputBuffer[WEBEAUDIO_FRAME_SIZE];

// Stilson filter state - compromise version with poles at z = -0.3
static double stage[4];
static double delay[4];

// Filter parameters
static double g;           // Cutoff coefficient
static double resonance;   // Resonance amount
static float cutoff = 1000.0f;
static float targetCutoff = 1000.0f;

// Smooth parameter interpolation to prevent popping
static float cutoffSmoothing = 0.1f;

// DC blocking filter to prevent low-frequency artifacts
static float dcBlockInput = 0.0f;
static float dcBlockOutput = 0.0f;
static const float dcBlockCoeff = 0.995f;

// Envelope state
static float manualCutoff = 1000.0f;
static float envelopeCutoff = 1000.0f;
static int envelopeActive = 0;

// Envelope timing
static float envelopeStartCutoff = 1000.0f;
static float envelopeTargetCutoff = 1000.0f;
static float envelopeStartTime = 0.0f;
static float envelopeDuration = 0.0f;
static float envelopeDecayTime = 0.5f;
static float envelopeSustainLevel = 0.5f;
static int envelopePhase = 0;
static float currentTime = 0.0f;

// Precomputed constants
static const float PI = 3.14159265359f;
static const float SAMPLE_RATE = 44100.0f;
static const float INV_SAMPLE_RATE = 1.0f / SAMPLE_RATE;

// Compromise filter coefficients (poles at z = -0.3)
static const double COMPROMISE_A = 0.3 / 1.3;
static const double COMPROMISE_B = 1.0 / 1.3;

// Forward declaration
void updateFilterCoefficients();

EMSCRIPTEN_KEEPALIVE
float* inputBufferPtr() {
    return inputBuffer;
}

EMSCRIPTEN_KEEPALIVE
float* outputBufferPtr() {
    return outputBuffer;
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
    resonance = fmax(0.0, fmin(0.95, r));
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

// Update filter coefficients based on current cutoff
// Uses the compromise filter design with poles at z = -0.3
void updateFilterCoefficients() {
    float fc = cutoff / SAMPLE_RATE;

    // Clamp fc to prevent filter instability at high frequencies
    // Keep it well below Nyquist (0.5) to maintain stability
    fc = fmin(fc, 0.42); // Allow more musical range

    // Calculate g coefficient for the compromise filter
    // This provides better decoupling of cutoff and resonance controls
    // Use a more stable polynomial approximation
    g = 0.9892 * fc - 0.4342 * fc * fc + 0.1381 * fc * fc * fc - 0.0202 * fc * fc * fc * fc;

    // Clamp g to ensure stability - but allow more musical range
    g = fmax(0.0, fmin(g, 0.92)); // Allow higher values for better sound

    // Only reduce g if it's dangerously close to 1.0
    if (g > 0.9) {
        g = 0.9;
    }
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
}

// Smooth parameter interpolation to prevent popping
inline float smoothParameter(float current, float target, float smoothing) {
    return current + (target - current) * smoothing;
}

// Stilson Moog ladder filter implementation with compromise poles
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

        // Apply resonance feedback with musical clamping
        float resonanceFeedback = 4.0 * resonance * stage[3];
        // Allow more resonance for musical character, but prevent extreme values
        resonanceFeedback = fmax(-1.2, fmin(1.2, resonanceFeedback));
        float inputWithResonance = dcBlockedInput - resonanceFeedback;

        // First stage - compromise filter with poles at z = -0.3
        stage[0] = g * (COMPROMISE_A * inputWithResonance + COMPROMISE_B * delay[0] - stage[0]) + stage[0];
        // Much more aggressive clamping to prevent explosion
        stage[0] = fmax(-5.0, fmin(5.0, stage[0]));
        delay[0] = inputWithResonance;

        // Second stage
        stage[1] = g * (COMPROMISE_A * stage[0] + COMPROMISE_B * delay[1] - stage[1]) + stage[1];
        stage[1] = fmax(-5.0, fmin(5.0, stage[1]));
        delay[1] = stage[0];

        // Third stage
        stage[2] = g * (COMPROMISE_A * stage[1] + COMPROMISE_B * delay[2] - stage[2]) + stage[2];
        stage[2] = fmax(-5.0, fmin(5.0, stage[2]));
        delay[2] = stage[1];

        // Fourth stage
        stage[3] = g * (COMPROMISE_A * stage[2] + COMPROMISE_B * delay[3] - stage[3]) + stage[3];
        stage[3] = fmax(-5.0, fmin(5.0, stage[3]));
        delay[3] = stage[2];

        // Final output with clamping
        float output = (float)stage[3];
        output = fmax(-1.0, fmin(1.0, output));

        // Stability check - if output is NaN or infinite, reset the filter
        if (isnan(output) || isinf(output)) {
            // Reset all stages and delays
            memset(stage, 0, sizeof(stage));
            memset(delay, 0, sizeof(delay));
            output = 0.0f;
        }

        outputBuffer[i] = output;
    }
}

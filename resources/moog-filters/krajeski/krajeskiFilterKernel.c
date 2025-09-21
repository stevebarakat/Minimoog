#include <emscripten.h>
#include <math.h>
#include <string.h>

#define SAMPLE_RATE 44100.0
#define WEBEAUDIO_FRAME_SIZE 128

// Filter state variables
static double stage[4];
static double cutoff = 1000.0;
static double resonance = 0.0;
static double sampleRate = SAMPLE_RATE;

// Input/output buffers
static float inputBuffer[WEBEAUDIO_FRAME_SIZE];
static float outputBuffer[WEBEAUDIO_FRAME_SIZE];

// Fast tanh approximation
static inline double fast_tanh(double x) {
    if (x > 3.0) return 1.0;
    if (x < -3.0) return -1.0;
    double x2 = x * x;
    return x * (27.0 + x2) / (27.0 + 9.0 * x2);
}

// Calculate filter coefficients
static inline void calculateCoefficients() {
    // Clamp parameters for stability
    if (cutoff > 20000.0) cutoff = 20000.0;
    if (cutoff < 20.0) cutoff = 20.0;
    if (resonance > 0.99) resonance = 0.99;
    if (resonance < 0.0) resonance = 0.0;
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
    cutoff = c;
    calculateCoefficients();
}

EMSCRIPTEN_KEEPALIVE
void setResonance(float r) {
    resonance = r;
    calculateCoefficients();
}

// Dummy functions for compatibility with existing interface
EMSCRIPTEN_KEEPALIVE
void setEnvelopeActive(int active) {}
EMSCRIPTEN_KEEPALIVE
void setEnvelopeCutoff(float c) {}
EMSCRIPTEN_KEEPALIVE
void setEnvelopeAttack(float startCutoff, float peakCutoff, float attackTime) {}
EMSCRIPTEN_KEEPALIVE
void setEnvelopeRelease(float targetCutoff, float releaseTime) {}
EMSCRIPTEN_KEEPALIVE
void setEnvelopeDecayTime(float decayTime) {}
EMSCRIPTEN_KEEPALIVE
void setEnvelopeSustainLevel(float sustainLevel) {}
EMSCRIPTEN_KEEPALIVE
void updateEnvelope(float time) {}

EMSCRIPTEN_KEEPALIVE
void init() {
    // Initialize filter state
    memset(stage, 0, sizeof(stage));

    // Set initial parameters
    setCutoff(1000.0f);
    setResonance(0.0f);
}

// Krajeski Moog filter implementation
// Based on Tim Stilson's MoogVCF with compromise poles
// Uses a simplified approach with optimized coefficients
EMSCRIPTEN_KEEPALIVE
void filter() {
    for (int i = 0; i < WEBEAUDIO_FRAME_SIZE; i++) {
        double input = inputBuffer[i];

        // Calculate frequency ratio
        double f = cutoff / sampleRate;
        if (f > 0.45) f = 0.45;  // Prevent instability

        // Calculate filter coefficients using compromise poles
        double g = f;
        if (g > 0.9) g = 0.9;  // Clamp for stability

        // Calculate resonance feedback
        double resonanceFeedback = 4.0 * resonance;
        if (resonanceFeedback > 3.5) resonanceFeedback = 3.5;

        // Process through the ladder stages
        double temp = input - resonanceFeedback * stage[3];

        // Apply tanh saturation to input
        temp = fast_tanh(temp);

        // Stage 1
        stage[0] = g * temp + (1.0 - g) * stage[0];
        stage[0] = fast_tanh(stage[0]);

        // Stage 2
        stage[1] = g * stage[0] + (1.0 - g) * stage[1];
        stage[1] = fast_tanh(stage[1]);

        // Stage 3
        stage[2] = g * stage[1] + (1.0 - g) * stage[2];
        stage[2] = fast_tanh(stage[2]);

        // Stage 4
        stage[3] = g * stage[2] + (1.0 - g) * stage[3];
        stage[3] = fast_tanh(stage[3]);

        // Clamp stage outputs to prevent instability
        for (int j = 0; j < 4; j++) {
            if (stage[j] > 5.0) stage[j] = 5.0;
            if (stage[j] < -5.0) stage[j] = -5.0;

            // Check for NaN or inf
            if (isnan(stage[j]) || isinf(stage[j])) {
                stage[j] = 0.0;
            }
        }

        // Output is the last stage
        double output = stage[3];

        // Clamp final output
        if (output > 1.0) output = 1.0;
        if (output < -1.0) output = -1.0;

        outputBuffer[i] = (float)output;
    }
}

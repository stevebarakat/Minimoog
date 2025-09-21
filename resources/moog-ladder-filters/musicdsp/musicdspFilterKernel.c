#include <emscripten.h>
#include <math.h>
#include <string.h>

#define SAMPLE_RATE 44100.0
#define WEBEAUDIO_FRAME_SIZE 128

// Filter state variables
static double in1, in2, in3, in4;
static double out1, out2, out3, out4;
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

    // Calculate frequency ratio
    double f = cutoff / sampleRate;
    if (f > 0.45) f = 0.45;  // Prevent instability

    // Calculate resonance
    double q = 1.0 - f;
    double p = f + 0.8 * f * q;
    double f1 = p + p - 1.0;
    double q1 = 1.0 - p;

    // Apply resonance
    double scale = 1.0 + resonance * (1.0 - q1);
    if (scale > 10.0) scale = 10.0;  // Prevent excessive gain
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
    in1 = in2 = in3 = in4 = 0.0;
    out1 = out2 = out3 = out4 = 0.0;

    // Set initial parameters
    setCutoff(1000.0f);
    setResonance(0.0f);
}

// MusicDSP Moog filter implementation
// Classic implementation from the MusicDSP community
// Based on the original Moog ladder filter topology
EMSCRIPTEN_KEEPALIVE
void filter() {
    for (int i = 0; i < WEBEAUDIO_FRAME_SIZE; i++) {
        double input = inputBuffer[i];

        // Calculate coefficients for this sample
        calculateCoefficients();

        // Calculate frequency ratio
        double f = cutoff / sampleRate;
        if (f > 0.45) f = 0.45;

        // Calculate resonance
        double q = 1.0 - f;
        double p = f + 0.8 * f * q;
        double f1 = p + p - 1.0;
        double q1 = 1.0 - p;

        // Apply resonance
        double scale = 1.0 + resonance * (1.0 - q1);
        if (scale > 10.0) scale = 10.0;

        // Process through the ladder stages
        double temp = input - scale * out4;

        // Stage 1
        out1 = temp * p + in1 * q1;
        in1 = temp;

        // Stage 2
        temp = out1;
        out2 = temp * p + in2 * q1;
        in2 = temp;

        // Stage 3
        temp = out2;
        out3 = temp * p + in3 * q1;
        in3 = temp;

        // Stage 4
        temp = out3;
        out4 = temp * p + in4 * q1;
        in4 = temp;

        // Clamp output to prevent instability
        if (out4 > 1.0) out4 = 1.0;
        if (out4 < -1.0) out4 = -1.0;

        // Check for NaN or inf
        if (isnan(out4) || isinf(out4)) {
            out4 = 0.0;
        }

        outputBuffer[i] = (float)out4;
    }
}

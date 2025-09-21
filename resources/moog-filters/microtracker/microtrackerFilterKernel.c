#include <emscripten.h>
#include <math.h>

#define SAMPLE_RATE 44100.0
#define WEBEAUDIO_FRAME_SIZE 128
#define MOOG_PI 3.14159265358979323846

// Filter state variables
static double p0, p1, p2, p3;
static double p32, p33, p34;  // Previous outputs for optimized coefficients
static double cutoff = 0.1;
static double resonance = 0.1;

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
    cutoff = c * 2.0 * MOOG_PI / SAMPLE_RATE;
    if (cutoff > 1.0) cutoff = 1.0;
}

EMSCRIPTEN_KEEPALIVE
void setResonance(float r) {
    resonance = r;
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
    p0 = p1 = p2 = p3 = p32 = p33 = p34 = 0.0;
    setCutoff(1000.0f);
    setResonance(0.10f);
}

// Microtracker Moog ladder filter implementation
// Based on Magnus Jonsson's optimized coefficients
EMSCRIPTEN_KEEPALIVE
void filter() {
    double k = resonance * 4.0;

    for (int i = 0; i < WEBEAUDIO_FRAME_SIZE; i++) {
        // Coefficients optimized using differential evolution
        // to make feedback gain 4.0 correspond closely to the
        // border of instability, for all values of omega.
        double out = p3 * 0.360891 + p32 * 0.417290 + p33 * 0.177896 + p34 * 0.0439725;

        p34 = p33;
        p33 = p32;
        p32 = p3;

        p0 += (fast_tanh(inputBuffer[i] - k * out) - fast_tanh(p0)) * cutoff;
        p1 += (fast_tanh(p0) - fast_tanh(p1)) * cutoff;
        p2 += (fast_tanh(p1) - fast_tanh(p2)) * cutoff;
        p3 += (fast_tanh(p2) - fast_tanh(p3)) * cutoff;

        outputBuffer[i] = (float)out;
    }
}

#include <emscripten.h>
#include <math.h>
#include <string.h>

#define SAMPLE_RATE 44100.0
#define WEBEAUDIO_FRAME_SIZE 128

// Filter state variables
static double stage[4];
static double stageZ1[4];
static double stageTanh[4];
static double output = 0.0;
static double input = 0.0;

// Filter coefficients
static double h, h0, g;
static double resonance = 0.1;
static double cutoff = 1000.0;
static double gainCompensation = 0.5;

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
    cutoff = c;

    // Calculate filter coefficients
    // Not being oversampled at the moment... * 2 when functional
    float fs2 = SAMPLE_RATE;
    float fc = cutoff / fs2;

        // Clamp frequency to prevent instability but allow more range
    if (fc > 0.48) fc = 0.48;
    if (fc < 0.01) fc = 0.01;  // Ensure minimum audibility

    // Calculate coefficients with more responsive range
    g = fc;
    // Use more musical coefficient mapping
    h = g / (1.0 + g);
    h0 = 1.0 / (1.0 + g);

    // Ensure minimum coefficient values for audibility
    if (h < 0.01) h = 0.01;
    if (h0 < 0.01) h0 = 0.01;
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
    memset(stage, 0, sizeof(stage));
    memset(stageZ1, 0, sizeof(stageZ1));
    memset(stageTanh, 0, sizeof(stageTanh));

    output = 0.0;
    input = 0.0;

    setCutoff(1000.0f);
    setResonance(0.10f);
}

// Simplified Moog ladder filter implementation
// Based on DAFX book 2nd edition, Valimaki et al.
// 5 nonlinear (tanh) functions: 4 first-order sections + feedback
EMSCRIPTEN_KEEPALIVE
void filter() {
    for (int i = 0; i < WEBEAUDIO_FRAME_SIZE; i++) {
        for (int stageIdx = 0; stageIdx < 4; ++stageIdx) {
            if (stageIdx) {
                input = stage[stageIdx-1];
                stageTanh[stageIdx-1] = fast_tanh(input);
                stage[stageIdx] = (h * stageZ1[stageIdx] + h0 * stageTanh[stageIdx-1]) +
                                 (1.0 - g) * (stageIdx != 3 ? stageTanh[stageIdx] : fast_tanh(stageZ1[stageIdx]));
            } else {
                input = inputBuffer[i] - ((4.0 * resonance) * (output - gainCompensation * inputBuffer[i]));
                stage[stageIdx] = (h * fast_tanh(input) + h0 * stageZ1[stageIdx]) +
                                 (1.0 - g) * stageTanh[stageIdx];
            }

            stageZ1[stageIdx] = stage[stageIdx];
        }

        output = stage[3];

        // Clamp output to prevent instability but allow more range
        if (output > 2.0) output = 2.0;
        if (output < -2.0) output = -2.0;

        outputBuffer[i] = (float)output;
    }
}

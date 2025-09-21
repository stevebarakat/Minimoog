#include <emscripten.h>
#include <math.h>

#define SAMPLE_RATE 44100.0
#define WEBEAUDIO_FRAME_SIZE 128

// Simple input/output buffers
static float inputBuffer[WEBEAUDIO_FRAME_SIZE];
static float outputBuffer[WEBEAUDIO_FRAME_SIZE];

// Simple filter state
static float cutoff = 1000.0f;
static float resonance = 0.1f;

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
}

EMSCRIPTEN_KEEPALIVE
void setResonance(float r) {
    resonance = r;
}

EMSCRIPTEN_KEEPALIVE
void init() {
    // Simple initialization
    cutoff = 1000.0f;
    resonance = 0.1f;
}

// Very simple filter - just pass through with some basic processing
EMSCRIPTEN_KEEPALIVE
void filter() {
    for (int i = 0; i < WEBEAUDIO_FRAME_SIZE; i++) {
        float input = inputBuffer[i];

        // Simple low-pass filter effect
        float output = input * 0.5f; // Just reduce volume to test

        // Ensure output is in valid range
        output = fmax(-1.0f, fmin(1.0f, output));

        outputBuffer[i] = output;
    }
}

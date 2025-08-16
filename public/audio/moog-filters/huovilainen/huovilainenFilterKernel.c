/*
 *  Huovilainen Moog Ladder Filter Implementation
 *  Based on the work by Antti Huovilainen (2004, 2010)
 *  Original implementation: Victor Lazzarini for CSound5
 *
 *  compilation directive:
 *  emcc -O3 -s WASM=1 huovilainenFilterKernel.c -o huovilainenFilterKernel.wasm --no-entry
 */

#include <emscripten.h>
#include <math.h>
#include <string.h>

#define WEBEAUDIO_FRAME_SIZE 128

static float inputBuffer[WEBEAUDIO_FRAME_SIZE];
static float outputBuffer[WEBEAUDIO_FRAME_SIZE];

// Huovilainen filter state
static double stage[4];
static double stageTanh[3];
static double delay[6];

// Filter parameters
static double thermal = 0.000025;
static double tune;
static double acr;
static double resQuad;
static float cutoff = 1000.0f;
static float resonance = 0.1f;

// Smooth parameter interpolation to prevent popping
static float targetCutoff = 1000.0f;
static float targetResonance = 0.1f;
static float cutoffSmoothing = 0.1f;
static float resonanceSmoothing = 0.1f;

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
    manualCutoff = c;
    if (!envelopeActive) {
        targetCutoff = c;
        updateFilterCoefficients();
    }
}

EMSCRIPTEN_KEEPALIVE
void setResonance(float r) {
    targetResonance = r;
    updateFilterCoefficients();
}

EMSCRIPTEN_KEEPALIVE
void setEnvelopeActive(int active) {
    envelopeActive = active;
    if (!active) {
        targetCutoff = manualCutoff;
        envelopePhase = 0;
        updateFilterCoefficients();
    }
}

EMSCRIPTEN_KEEPALIVE
void setEnvelopeCutoff(float c) {
    envelopeCutoff = c;
    if (envelopeActive) {
        targetCutoff = c;
        updateFilterCoefficients();
    }
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
void setEnvelopeAttack(float startCutoff, float peakCutoff, float attackTime) {
    envelopeStartCutoff = startCutoff;
    envelopeTargetCutoff = peakCutoff * 2.0f;
    envelopeStartTime = currentTime;
    envelopeDuration = attackTime;
    envelopePhase = 1;
    envelopeActive = 1;
}

EMSCRIPTEN_KEEPALIVE
void setEnvelopeRelease(float targetCutoff, float releaseTime) {
    envelopeStartCutoff = envelopeCutoff;
    envelopeTargetCutoff = targetCutoff;
    envelopeStartTime = currentTime;
    envelopeDuration = releaseTime;
    envelopePhase = 0;
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

// Update filter coefficients based on current cutoff and resonance
void updateFilterCoefficients() {
    double fc = cutoff / SAMPLE_RATE;

    // Clamp fc to prevent filter instability at high frequencies
    // Keep it well below Nyquist (0.5) to maintain stability
    fc = fmin(fc, 0.45);

    double f = fc * 0.5; // oversampled
    double fc2 = fc * fc;
    double fc3 = fc * fc * fc;

    double fcr = 1.8730 * fc3 + 0.4955 * fc2 - 0.6490 * fc + 0.9988;
    acr = -3.9364 * fc2 + 1.8409 * fc + 0.9968;

    tune = (1.0 - exp(-((2 * PI) * f * fcr))) / thermal;

    resQuad = 4.0 * resonance * acr;
}

EMSCRIPTEN_KEEPALIVE
void init() {
    // Initialize filter state
    memset(stage, 0, sizeof(stage));
    memset(delay, 0, sizeof(delay));
    memset(stageTanh, 0, sizeof(stageTanh));

    setCutoff(1000.0f);
    setResonance(0.1f);
    manualCutoff = 1000.0f;
    envelopeCutoff = 1000.0f;
    envelopeActive = 0;
    envelopePhase = 0;
    currentTime = 0.0f;
    envelopeSustainLevel = 0.5f;

    cutoffSmoothing = 0.1f;
    resonanceSmoothing = 0.1f;
}

// Smooth parameter interpolation to prevent popping
inline float smoothParameter(float current, float target, float smoothing) {
    return current + (target - current) * smoothing;
}

// Enhanced tanh with subtle Minimoog-style character and frequency-dependent enhancement
inline float enhanced_tanh(float x) {
    // Use standard tanh as base
    float basic_tanh = tanh(x);

    // Add subtle analog-style asymmetry for character
    float asymmetry = x > 0 ? 1.0f : 0.98f;

    // Add subtle harmonic enhancement that scales with input level
    float abs_x = fabs(x);
    float input_scale = abs_x / (1.0f + abs_x);

    // Frequency-dependent scaling to reduce artifacts at high frequencies
    // When input level is high (high frequencies), reduce enhancement
    float freq_scale = 1.0f / (1.0f + 2.0f * input_scale);

    // Reduced harmonic enhancement to prevent high-frequency artifacts
    float harmonic_boost = 1.0f + 0.015f * input_scale * freq_scale;

    // Add subtle even harmonic content with frequency scaling
    float even_harmonic = 0.008f * x * input_scale * freq_scale / (1.0f + abs_x);

    // Add subtle 3rd harmonic with frequency scaling
    float third_harmonic = 0.006f * x * input_scale * input_scale * freq_scale;

    // Add subtle intermodulation distortion with frequency scaling
    float intermod = 0.004f * x * input_scale * freq_scale;

    return asymmetry * basic_tanh * harmonic_boost + even_harmonic + third_harmonic + intermod;
}

// Huovilainen Moog ladder filter implementation
EMSCRIPTEN_KEEPALIVE
void filter() {
    // Smooth parameter changes to prevent popping
    cutoff = smoothParameter(cutoff, targetCutoff, cutoffSmoothing);
    resonance = smoothParameter(resonance, targetResonance, resonanceSmoothing);

    // Update coefficients if needed
    updateFilterCoefficients();

    // Process all samples
    for (int i = 0; i < WEBEAUDIO_FRAME_SIZE; i++) {
        // Apply DC blocking to prevent low-frequency artifacts
        float input = inputBuffer[i];
        float dcBlockedInput = input - dcBlockInput + dcBlockCoeff * dcBlockOutput;
        dcBlockInput = input;
        dcBlockOutput = dcBlockedInput;

        // Oversample by 2x for better quality
        for (int j = 0; j < 2; j++) {
            float input_sample = dcBlockedInput - resQuad * delay[5];

            // First stage with enhanced saturation for warmth
            delay[0] = stage[0] = delay[0] + tune * (enhanced_tanh(input_sample * thermal) - stageTanh[0]);

            // Second stage
            float stage1_input = stage[0];
            stage[1] = delay[1] + tune * ((stageTanh[0] = enhanced_tanh(stage1_input * thermal)) - stageTanh[1]);
            delay[1] = stage[1];

            // Third stage
            float stage2_input = stage[1];
            stage[2] = delay[2] + tune * ((stageTanh[1] = enhanced_tanh(stage2_input * thermal)) - stageTanh[2]);
            delay[2] = stage[2];

            // Fourth stage
            float stage3_input = stage[2];
            stage[3] = delay[3] + tune * ((stageTanh[2] = enhanced_tanh(stage3_input * thermal)) - enhanced_tanh(delay[3] * thermal));
            delay[3] = stage[3];

            // 0.5 sample delay for phase compensation
            delay[5] = (stage[3] + delay[4]) * 0.5;
            delay[4] = stage[3];
        }

        outputBuffer[i] = (float)delay[5];
    }
}

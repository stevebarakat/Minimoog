#include <emscripten.h>
#include <math.h>
#include <string.h>

#define SAMPLE_RATE 44100.0
#define WEBEAUDIO_FRAME_SIZE 128

// Virtual analog one-pole filter structure
typedef struct {
    double alpha;
    double beta;
    double gamma;
    double delta;
    double epsilon;
    double a0;
    double feedback;
    double z1;
} VAOnePole;

// Filter state
static VAOnePole LPF1, LPF2, LPF3, LPF4;
static double saturation = 1.0;
static double Q = 3.0;
static double K = 0.0;
static double cutoff = 1000.0;
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

// Get feedback output from one-pole filter
static inline double vaOnePoleGetFeedbackOutput(VAOnePole* filter) {
    return filter->beta * (filter->z1 + filter->feedback * filter->delta);
}

// Virtual analog one-pole filter tick function
static inline double vaOnePoleTick(VAOnePole* filter, double input) {
    double s = input * filter->gamma + filter->feedback +
               filter->epsilon * vaOnePoleGetFeedbackOutput(filter);
    double vn = (filter->a0 * s - filter->z1) * filter->alpha;
    double out = vn + filter->z1;
    filter->z1 = vn + out;
    return out;
}

// Reset one-pole filter
static inline void vaOnePoleReset(VAOnePole* filter) {
    filter->alpha = 1.0;
    filter->beta = 0.0;
    filter->gamma = 1.0;
    filter->delta = 0.0;
    filter->epsilon = 0.0;
    filter->a0 = 1.0;
    filter->feedback = 0.0;
    filter->z1 = 0.0;
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
    double w0 = 2.0 * M_PI * cutoff;
    double T = 1.0 / SAMPLE_RATE;

    // Clamp frequency to prevent instability
    if (cutoff > 20000.0) cutoff = 20000.0;
    if (cutoff < 20.0) cutoff = 20.0;

    // Calculate alpha for each stage
    double alpha = w0 * T;
    if (alpha > 0.95) alpha = 0.95;

    // Set coefficients for each one-pole filter
    LPF1.alpha = alpha;
    LPF2.alpha = alpha;
    LPF3.alpha = alpha;
    LPF4.alpha = alpha;

    // Calculate K for resonance
    K = Q * (4.0 - 3.0 * alpha) / (1.0 - alpha);
    if (K > 3.5) K = 3.5;
    if (K < 0.0) K = 0.0;
}

EMSCRIPTEN_KEEPALIVE
void setResonance(float r) {
    resonance = r;
    Q = 1.0 + 3.0 * resonance;
    if (Q > 10.0) Q = 10.0;

    // Recalculate K with new Q
    double w0 = 2.0 * M_PI * cutoff;
    double T = 1.0 / SAMPLE_RATE;
    double alpha = w0 * T;
    if (alpha > 0.95) alpha = 0.95;

    K = Q * (4.0 - 3.0 * alpha) / (1.0 - alpha);
    if (K > 3.5) K = 3.5;
    if (K < 0.0) K = 0.0;
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
    // Initialize all one-pole filters
    vaOnePoleReset(&LPF1);
    vaOnePoleReset(&LPF2);
    vaOnePoleReset(&LPF3);
    vaOnePoleReset(&LPF4);

    // Set initial parameters
    setCutoff(1000.0f);
    setResonance(0.1f);
}

// Oberheim Variation Moog filter implementation
// Based on Will Pirkle's virtual analog approach
// Uses 4 cascaded one-pole filters with feedback
EMSCRIPTEN_KEEPALIVE
void filter() {
    for (int i = 0; i < WEBEAUDIO_FRAME_SIZE; i++) {
        double input = inputBuffer[i];

        // Calculate sigma (feedback sum)
        double sigma = vaOnePoleGetFeedbackOutput(&LPF1) +
                      vaOnePoleGetFeedbackOutput(&LPF2) +
                      vaOnePoleGetFeedbackOutput(&LPF3) +
                      vaOnePoleGetFeedbackOutput(&LPF4);

        // Apply saturation and feedback
        input *= (1.0 + K);
        input -= K * sigma;

        // Apply saturation
        input = fast_tanh(input * saturation);

        // Process through cascade of one-pole filters
        double y1 = vaOnePoleTick(&LPF1, input);
        double y2 = vaOnePoleTick(&LPF2, y1);
        double y3 = vaOnePoleTick(&LPF3, y2);
        double y4 = vaOnePoleTick(&LPF4, y3);

        // Clamp output to prevent instability
        if (y4 > 1.0) y4 = 1.0;
        if (y4 < -1.0) y4 = -1.0;

        outputBuffer[i] = (float)y4;
    }
}

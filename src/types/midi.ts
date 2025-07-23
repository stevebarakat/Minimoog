// Comprehensive MIDI Types for Web MIDI API

// MIDI Message Types
export type MIDIMessageType =
  | "noteOff"
  | "noteOn"
  | "polyphonicKeyPressure"
  | "controlChange"
  | "programChange"
  | "channelPressure"
  | "pitchBend"
  | "systemExclusive"
  | "timeCode"
  | "songPosition"
  | "songSelect"
  | "tuneRequest"
  | "timingClock"
  | "start"
  | "continue"
  | "stop"
  | "activeSensing"
  | "reset";

// MIDI Status Bytes
export const MIDI_STATUS_BYTES = {
  NOTE_OFF: 0x80,
  NOTE_ON: 0x90,
  POLYPHONIC_KEY_PRESSURE: 0xa0,
  CONTROL_CHANGE: 0xb0,
  PROGRAM_CHANGE: 0xc0,
  CHANNEL_PRESSURE: 0xd0,
  PITCH_BEND: 0xe0,
  SYSTEM_EXCLUSIVE: 0xf0,
  TIME_CODE: 0xf1,
  SONG_POSITION: 0xf2,
  SONG_SELECT: 0xf3,
  TUNE_REQUEST: 0xf6,
  TIMING_CLOCK: 0xf8,
  START: 0xfa,
  CONTINUE: 0xfb,
  STOP: 0xfc,
  ACTIVE_SENSING: 0xfe,
  RESET: 0xff,
} as const;

// MIDI Control Change Numbers
export const MIDI_CONTROL_CHANGES = {
  MODULATION_WHEEL: 1,
  BREATH_CONTROLLER: 2,
  FOOT_CONTROLLER: 4,
  PORTAMENTO_TIME: 5,
  DATA_ENTRY_MSB: 6,
  CHANNEL_VOLUME: 7,
  BALANCE: 8,
  PAN: 10,
  EXPRESSION_CONTROLLER: 11,
  EFFECT_CONTROL_1: 12,
  EFFECT_CONTROL_2: 13,
  GENERAL_PURPOSE_CONTROLLER_1: 16,
  GENERAL_PURPOSE_CONTROLLER_2: 17,
  GENERAL_PURPOSE_CONTROLLER_3: 18,
  GENERAL_PURPOSE_CONTROLLER_4: 19,
  BANK_SELECT_MSB: 0,
  PORTAMENTO: 65,
  SUSTAIN: 64,
  PORTAMENTO_CONTROL: 84,
  SOSTENUTO: 66,
  SOFT_PEDAL: 67,
  LEGATO_FOOTSWITCH: 68,
  HOLD_2: 69,
  SOUND_CONTROLLER_1: 70,
  SOUND_CONTROLLER_2: 71,
  SOUND_CONTROLLER_3: 72,
  SOUND_CONTROLLER_4: 73,
  SOUND_CONTROLLER_5: 74,
  SOUND_CONTROLLER_6: 75,
  SOUND_CONTROLLER_7: 76,
  SOUND_CONTROLLER_8: 77,
  SOUND_CONTROLLER_9: 78,
  SOUND_CONTROLLER_10: 79,
  GENERAL_PURPOSE_CONTROLLER_5: 80,
  GENERAL_PURPOSE_CONTROLLER_6: 81,
  GENERAL_PURPOSE_CONTROLLER_7: 82,
  GENERAL_PURPOSE_CONTROLLER_8: 83,
  EFFECTS_1_DEPTH: 91,
  EFFECTS_2_DEPTH: 92,
  EFFECTS_3_DEPTH: 93,
  EFFECTS_4_DEPTH: 94,
  EFFECTS_5_DEPTH: 95,
  DATA_INCREMENT: 96,
  DATA_DECREMENT: 97,
  NON_REGISTERED_PARAMETER_NUMBER_LSB: 98,
  NON_REGISTERED_PARAMETER_NUMBER_MSB: 99,
  REGISTERED_PARAMETER_NUMBER_LSB: 100,
  REGISTERED_PARAMETER_NUMBER_MSB: 101,
  ALL_SOUND_OFF: 120,
  RESET_ALL_CONTROLLERS: 121,
  LOCAL_CONTROL: 122,
  ALL_NOTES_OFF: 123,
  OMNI_MODE_OFF: 124,
  OMNI_MODE_ON: 125,
  MONO_MODE_ON: 126,
  POLY_MODE_ON: 127,
} as const;

// MIDI Channel Types
export type MIDIChannel =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;
export type MIDIChannelNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15;

// MIDI Note Types
export type MIDINoteNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99
  | 100
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118
  | 119
  | 120
  | 121
  | 122
  | 123
  | 124
  | 125
  | 126
  | 127;

export type MIDIVelocity =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99
  | 100
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118
  | 119
  | 120
  | 121
  | 122
  | 123
  | 124
  | 125
  | 126
  | 127;

export type MIDIControlValue =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99
  | 100
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118
  | 119
  | 120
  | 121
  | 122
  | 123
  | 124
  | 125
  | 126
  | 127;

export type MIDIProgramNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99
  | 100
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118
  | 119
  | 120
  | 121
  | 122
  | 123
  | 124
  | 125
  | 126
  | 127;

// MIDI Note Names
export type MIDINoteName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B"
  | "c"
  | "c#"
  | "d"
  | "d#"
  | "e"
  | "f"
  | "f#"
  | "g"
  | "g#"
  | "a"
  | "a#"
  | "b";

// MIDI Message Interfaces
export interface MIDIMessage {
  type: MIDIMessageType;
  channel: MIDIChannelNumber;
  timestamp: number;
  data: Uint8Array;
}

export interface MIDINoteMessage extends MIDIMessage {
  type: "noteOn" | "noteOff";
  note: MIDINoteNumber;
  velocity: MIDIVelocity;
}

export interface MIDIControlChangeMessage extends MIDIMessage {
  type: "controlChange";
  controller: MIDIControlValue;
  value: MIDIControlValue;
}

export interface MIDIProgramChangeMessage extends MIDIMessage {
  type: "programChange";
  program: MIDIProgramNumber;
}

export interface MIDIPitchBendMessage extends MIDIMessage {
  type: "pitchBend";
  value: number; // 14-bit value (0-16383)
}

export interface MIDIChannelPressureMessage extends MIDIMessage {
  type: "channelPressure";
  pressure: MIDIControlValue;
}

export interface MIDIPolyphonicKeyPressureMessage extends MIDIMessage {
  type: "polyphonicKeyPressure";
  note: MIDINoteNumber;
  pressure: MIDIControlValue;
}

export interface MIDISystemMessage extends MIDIMessage {
  type: Exclude<
    MIDIMessageType,
    | "noteOn"
    | "noteOff"
    | "controlChange"
    | "programChange"
    | "pitchBend"
    | "channelPressure"
    | "polyphonicKeyPressure"
  >;
  channel: 0; // System messages don't have channels
}

// MIDI Event Types
export interface MIDIEvent {
  type: MIDIMessageType;
  timestamp: number;
  data: Uint8Array;
  source: MIDIInput;
}

export interface MIDINoteEvent extends MIDIEvent {
  type: "noteOn" | "noteOff";
  note: MIDINoteNumber;
  velocity: MIDIVelocity;
  channel: MIDIChannelNumber;
}

export interface MIDIControlEvent extends MIDIEvent {
  type: "controlChange";
  controller: MIDIControlValue;
  value: MIDIControlValue;
  channel: MIDIChannelNumber;
}

export interface MIDIPitchBendEvent extends MIDIEvent {
  type: "pitchBend";
  value: number;
  channel: MIDIChannelNumber;
}

// MIDI Port Types
export type MIDIPortType = "input" | "output";
export type MIDIPortConnectionState = "open" | "closed" | "pending";
export type MIDIPortDeviceState = "connected" | "disconnected";

export interface MIDIPort {
  id: string;
  manufacturer?: string;
  name?: string;
  type: MIDIPortType;
  version?: string;
  state: MIDIPortConnectionState;
  connection: MIDIPortDeviceState;
}

export interface MIDIInput extends MIDIPort {
  type: "input";
  onmidimessage: ((event: MIDIMessageEvent) => void) | null;
}

export interface MIDIOutput extends MIDIPort {
  type: "output";
  send: (data: Uint8Array, timestamp?: number) => void;
  clear: () => void;
}

// MIDI Access Types
export interface MIDIAccess {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
  onstatechange: ((event: MIDIConnectionEvent) => void) | null;
  sysexEnabled: boolean;
}

export interface MIDIConnectionEvent extends Event {
  port: MIDIPort;
}

export interface MIDIMessageEvent extends Event {
  data: Uint8Array;
}

// MIDI Options
export interface MIDIOptions {
  sysex?: boolean;
  software?: boolean;
}

// MIDI Note Mapping
export interface MIDINoteMapping {
  note: MIDINoteNumber;
  name: MIDINoteName;
  octave: number;
  frequency: number;
}

// MIDI Controller Mapping
export interface MIDIControllerMapping {
  controller: MIDIControlValue;
  name: string;
  description: string;
  range: [number, number];
  defaultValue: number;
}

// MIDI Program Mapping
export interface MIDIProgramMapping {
  program: MIDIProgramNumber;
  name: string;
  category: string;
  description: string;
}

// MIDI Channel Mapping
export interface MIDIChannelMapping {
  channel: MIDIChannelNumber;
  name: string;
  instrument: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

// MIDI Clock Types
export interface MIDIClock {
  ticks: number;
  beats: number;
  bars: number;
  tempo: number;
  timeSignature: [number, number];
}

export interface MIDITiming {
  ticks: number;
  seconds: number;
  beats: number;
  bars: number;
}

// MIDI Performance Types
export interface MIDIPerformance {
  latency: number;
  jitter: number;
  throughput: number;
  errors: number;
}

// MIDI Error Types
export interface MIDIError extends Error {
  name: "MIDIError";
  code: string;
  port?: MIDIPort;
}

// MIDI State Types
export interface MIDIState {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
  activeNotes: Set<MIDINoteNumber>;
  controllers: Map<MIDIControlValue, MIDIControlValue>;
  pitchBend: number;
  channelPressure: MIDIControlValue;
  program: MIDIProgramNumber;
  clock: MIDIClock;
  performance: MIDIPerformance;
}

// MIDI Handler Types
export interface MIDIMessageHandler {
  onNoteOn: (event: MIDINoteEvent) => void;
  onNoteOff: (event: MIDINoteEvent) => void;
  onControlChange: (event: MIDIControlEvent) => void;
  onProgramChange: (event: MIDIEvent) => void;
  onPitchBend: (event: MIDIPitchBendEvent) => void;
  onChannelPressure: (event: MIDIEvent) => void;
  onPolyphonicKeyPressure: (event: MIDIEvent) => void;
  onSystemMessage: (event: MIDISystemMessage) => void;
  onClock: (event: MIDIEvent) => void;
  onStart: (event: MIDIEvent) => void;
  onContinue: (event: MIDIEvent) => void;
  onStop: (event: MIDIEvent) => void;
  onActiveSensing: (event: MIDIEvent) => void;
  onReset: (event: MIDIEvent) => void;
}

// MIDI Connection Types
export interface MIDIConnection {
  input: MIDIInput;
  output: MIDIOutput;
  enabled: boolean;
  latency: number;
  filters: MIDIMessageFilter[];
}

export interface MIDIMessageFilter {
  type: MIDIMessageType;
  channel?: MIDIChannelNumber;
  note?: MIDINoteNumber;
  controller?: MIDIControlValue;
  enabled: boolean;
}

// MIDI Routing Types
export interface MIDIRoute {
  source: string;
  destination: string;
  channel: MIDIChannelNumber;
  enabled: boolean;
  transform?: MIDIMessageTransform;
}

export interface MIDIMessageTransform {
  type: "transpose" | "velocity" | "channel" | "custom";
  value: number;
  customTransform?: (message: MIDIMessage) => MIDIMessage;
}

// MIDI Recording Types
export interface MIDIRecording {
  events: MIDIEvent[];
  startTime: number;
  endTime: number;
  duration: number;
  tempo: number;
  timeSignature: [number, number];
}

export interface MIDITrack {
  name: string;
  channel: MIDIChannelNumber;
  events: MIDIEvent[];
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
}

// MIDI File Types
export interface MIDIFile {
  format: 0 | 1 | 2;
  tracks: MIDITrack[];
  tempo: number;
  timeSignature: [number, number];
  resolution: number;
}

// MIDI Utility Types
export interface MIDIUtils {
  noteToFrequency: (note: MIDINoteNumber) => number;
  frequencyToNote: (frequency: number) => MIDINoteNumber;
  noteToName: (note: MIDINoteNumber) => string;
  nameToNote: (name: string) => MIDINoteNumber;
  velocityToGain: (velocity: MIDIVelocity) => number;
  gainToVelocity: (gain: number) => MIDIVelocity;
  controlToValue: (
    control: MIDIControlValue,
    range: [number, number]
  ) => number;
  valueToControl: (value: number, range: [number, number]) => MIDIControlValue;
  pitchBendToValue: (bend: number) => number;
  valueToPitchBend: (value: number) => number;
  ticksToSeconds: (ticks: number, tempo: number, resolution: number) => number;
  secondsToTicks: (
    seconds: number,
    tempo: number,
    resolution: number
  ) => number;
  parseMessage: (data: Uint8Array) => MIDIMessage;
  createMessage: (
    type: MIDIMessageType,
    channel: MIDIChannelNumber,
    data: number[]
  ) => Uint8Array;
  validateMessage: (data: Uint8Array) => boolean;
}

// MIDI Configuration Types
export interface MIDIConfiguration {
  inputs: string[];
  outputs: string[];
  routing: MIDIRoute[];
  filters: MIDIMessageFilter[];
  clock: MIDIClock;
  performance: MIDIPerformance;
}

// MIDI Event Handler Types
export interface MIDIEventHandler {
  onConnect: (port: MIDIPort) => void;
  onDisconnect: (port: MIDIPort) => void;
  onMessage: (event: MIDIEvent) => void;
  onError: (error: MIDIError) => void;
  onStateChange: (state: MIDIState) => void;
}

// MIDI Manager Types
export interface MIDIManager {
  access: MIDIAccess | null;
  state: MIDIState;
  handlers: MIDIEventHandler[];
  configuration: MIDIConfiguration;

  initialize: (options?: MIDIOptions) => Promise<void>;
  connect: (portId: string) => Promise<void>;
  disconnect: (portId: string) => Promise<void>;
  send: (portId: string, message: MIDIMessage) => void;
  addHandler: (handler: MIDIEventHandler) => void;
  removeHandler: (handler: MIDIEventHandler) => void;
  updateConfiguration: (config: Partial<MIDIConfiguration>) => void;
  getState: () => MIDIState;
  reset: () => void;
}

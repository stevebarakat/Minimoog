// Centralized note types to avoid duplicates across the codebase

// Simple string-based note type for basic usage
export type NoteString = string;

// Detailed note object type for keyboard components
export type NoteObject = {
  note: string;
  isSharp: boolean;
  key: string;
};

// Union type for flexible note handling
export type Note = NoteString | NoteObject;

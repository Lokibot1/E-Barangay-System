import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress known React testing noise from console output.
// Real unexpected errors still surface because the filter is specific.
const SUPPRESSED_PATTERNS = [
  /not wrapped in act/,
  /cannot be a descendant of/,
  /validateDOMNesting/,
];

const originalError = console.error.bind(console);
console.error = (...args) => {
  if (SUPPRESSED_PATTERNS.some((p) => p.test(String(args[0])))) return;
  originalError(...args);
};

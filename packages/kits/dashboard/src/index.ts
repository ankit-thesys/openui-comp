"use client";

// The dashboard kit defines no React components of its own: its rendering
// vocabulary comes entirely from @openuidev/react-components. What it does own
// is `Stack`, the library's root layout primitive, which is declared here rather
// than in the shared core because only the dashboard library uses it.
export { Stack, StackSchema } from "./lib/openuiLibrary/Stack";

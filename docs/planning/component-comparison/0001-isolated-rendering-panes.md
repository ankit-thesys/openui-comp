# Isolate the two libraries while sharing one response

Use separate iframe documents for the legacy and migrated chat-library renderings, with one parent-owned conversation and response stream. Sharing a document would allow legacy CSS to affect the migrated rendering and invalidate the visual comparison; separate documents require an explicit message protocol and independent draft input state, but preserve that comparison boundary. Only submitted actions cross back into the shared conversation.

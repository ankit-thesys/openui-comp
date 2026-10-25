# Shared-response component comparison

Status: user confirmed implementation following the grill-with-docs interview.

## Agreed behavior

- A standalone example at examples/miscellaneous/component-comparison, developed in an isolated worktree.
- One shared prompt box and conversation. One AI request yields one response stream, with the complete content sent to both panes in the same order.
- Left pane uses the existing openuiChatLibrary. Right pane uses openuiChatLibrary from @openuidev/kits/react/chat/libs and migrated core components.
- Separate frames isolate legacy CSS and runtime state. Each pane displays its own rendering errors without breaking the other.
- Both render incrementally. Retain response chunks in memory for replay without a second AI request. Refresh clears session history.
- Form draft input remains independent. A submitted action from either pane continues the shared conversation once.
- Shared light/dark theme, equal pane widths, Stop, Replay, Clear conversation and shared response-text inspection.
- Reuse the existing server-side AI connection pattern. The requested testing host is dev.thesys.dev; credentials never enter browser code.

## Configuration still needed for live verification

The user will supply a temporary key. The exact development API base URL and enabled model have not been verified: repository examples only document the production endpoint. Keep these configurable and do not infer a development path from the production hostname. Implement and test the deterministic transport and UI without credentials first.

## Scope

This is a visual comparison playground, not an automatic visual-diff certification tool. AgentInterface and the assembled openuiLibrary remain outside this implementation. Existing migration performance evidence is unchanged; running both panes together is not a replacement for isolated performance measurements.

## Acceptance scenarios

1. One prompt causes one upstream request; both panes receive the same ordered response text and final status.
2. Stop aborts upstream work and prevents late chunks from changing either pane. Clear also invalidates old requests and clears history.
3. Replay uses retained chunks with no network generation and presents the same content in both panes.
4. An action from either pane generates exactly one shared next turn; replay and stale frame events cannot submit actions.
5. A rendering error affects only its own pane. Transport errors remain visible in the shared conversation.
6. Theme changes reach both isolated panes. Legacy CSS never enters the migrated frame.
7. API credentials stay server-side. Missing configuration produces a clear setup message, with no accidental fallback to another service.

## Verified source facts

Both libraries retain the same registry and root Card, component names, groups, examples and action contracts. Of 48 compared schemas, 47 were byte-identical; Icon changed import structure while retaining its schema. This read-only comparison supports the common response format but does not replace runnable tests.

The existing example uses generateSystemPrompt with library and promptOptions passed separately. The chat-library entry exports openuiChatLibrary and openuiChatPromptOptions. Use these instead of the assembled library.

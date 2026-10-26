# OpenUI

Shared terminology for OpenUI's component architecture and distribution model.
These definitions describe the agreed target; they do not imply implementation is complete.

## Language

**Existing React UI (`react-ui`)**:
The current OpenUI React UI offering that remains available while the new architecture is developed and evaluated.

**UI core (`react-ui-core`)**:
The shared foundation of reusable UI components and charts used across use-case kits. It excludes chat-specific interfaces such as AgentInterface and OpenUIChat.
_Avoid_: Kit-specific UI

**Chart components**:
The chart implementations and supporting visual elements included in react-ui-core and reused by kits. A separate react-visualization package is not part of the current extraction plan.

**Kit**:
A collection of components and OpenUI libraries for a specific use case. Chat and dashboard are initial use cases; additional kits can follow.

**Kit library (`libs/`)**:
A kit-owned OpenUI library and its component definitions, schemas, prompts, and examples. It defines how that kit exposes components to AI-driven UI generation.
_Avoid_: Shared component implementation

**Component source**:
Editable component implementation installed into a consuming application, including basic UI, chart implementations, and kit components.

**Source registry**:
The distribution catalog from which individual components or complete kits and their required source dependencies can be installed.

**Kit registration**:
Adding a component to a specific kit's OpenUI library so it is available for that kit's AI-driven UI generation. Merely installing a standalone React component is a separate action.

**Runtime dependency**:
An execution library consumed as an npm dependency rather than copied into the application as editable component source.

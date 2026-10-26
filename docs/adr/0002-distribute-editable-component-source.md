---
status: accepted
---

# Distribute editable component source through a registry

Support installing individual components and complete kits as editable source, including basic UI components, chart implementations, kit components, and kit-owned `libs/`. Runtimes remain npm dependencies. Multiple kits in one application reuse the same installed shared components.

Updates must be explicit and show a diff; they must not silently overwrite existing files. Installation into a specified kit registers the component in that kit's OpenUI library; standalone installation does not change existing kit libraries.

This provides application-level customization and use-case-specific AI libraries, at the cost of managing source updates and local divergence. Registry format, dependency resolution, conflict handling, and whether any UI npm distribution is also supported remain open. This source-copy decision does not imply vendoring third-party runtime libraries.

## Sequencing clarification

The registry remains an agreed future direction, but distribution design is deferred during the initial package extraction. The immediate requirement is to prepare the new packages for publication using the existing `react-ui` package conventions. This ADR does not require a registry or installer in the first milestone, and does not rule out npm UI packages.

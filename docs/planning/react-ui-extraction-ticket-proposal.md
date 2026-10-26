# Proposed extraction tickets — review before publication

These are draft vertical slices, not published implementation tickets. The styling decision remains open. A gate is only satisfied by passing evidence and the required human acceptance, not by merely closing a test run.

1. **Validate stock Goober through public consumer flows**
   - **Blocked by:** None; continues the existing open prototype investigation.
   - **Delivers:** Close React prop-forwarding, native/Radix state, theme/portal, installed-package and chat/dashboard performance/memory evidence gaps with TDD. Produce a user-reviewed go/no-go record; do not implement custom patches.

2. **Deliver the first themed core consumer slice**
   - **Blocked by:** Stock-Goober validation and explicit acceptance.
   - **Delivers:** Install a packed core package, import Button/Input/TextArea and agreed theme APIs from the root, customize them, and verify behavior, CSS parity and unused payload without old style inputs. Exact release metadata/TL approval gates packaging choices that depend on them.

3. **Deliver remaining core form controls**
   - **Blocked by:** First themed core consumer slice.
   - **Delivers:** Port the remaining approved input/control families with types and styles, exercising complete form interactions, keyboard and disabled behavior through a consumer app.

4. **Deliver layout and overlay components**
   - **Blocked by:** First themed core consumer slice.
   - **Delivers:** Port the approved layout/container families plus TooltipWrapper and loading support, with layout interactions, portal/theme behavior and public exports validated.

5. **Deliver text, media and source presentation**
   - **Blocked by:** First themed core consumer slice.
   - **Delivers:** Port approved text/presentation, image, citation and source families; verify rendering and public customization against the unchanged baseline.

6. **Deliver data views and composed cards**
   - **Blocked by:** Required layout and text/media slices for the actual dependency graph.
   - **Delivers:** Port approved data/list and composed-card families with their real dependencies, interactions, types, styles and consumer tests. Audit dependencies before assigning native blocking edges.

7. **Deliver the complete chart consumer slice**
   - **Blocked by:** First themed core consumer slice; add only dependencies demonstrated by the chart audit.
   - **Delivers:** Port all existing chart families and supporting visuals into core, retaining chart interactions, responsive behavior, themes and unused-payload guarantees.

8. **Resolve the separate chat-helper contract**
   - **Blocked by:** None; decision work only.
   - **Delivers:** Audit exact OpenUIChat/ToolCall/ToolResult helper inventory and dependencies; obtain the package-name/export decision. Do not port AgentInterface or modify old code. Any resulting helper implementation slice must be scoped after this audit.

9. **Deliver the chat kit and AI library consumer flow**
   - **Blocked by:** Required core slices; chat-helper contract and any helper implementation actually required.
   - **Delivers:** Deliver ModelSwitcher/follow-ups and the separate openuiChatLibrary entry. Demonstrate real partial/final parser output, forms/charts and relevant conversation behavior without wholesale openuiLibrary migration.

10. **Verify publish-ready beta artifacts and migration guidance**
   - **Blocked by:** All approved extraction slices and TL release/package decisions.
   - **Delivers:** Run integrated package/type/visual/framework/streaming checks, stock performance/memory validation, generated inventories and old/new separate-route checks. Produce results and migration guidance; no publication, old-package edits or deprecation.

Review questions: Is the granularity right? Are the blocking edges accurate? Should any family groups be split or merged? The helper audit may reveal additional concrete work; do not invent its implementation scope in advance.

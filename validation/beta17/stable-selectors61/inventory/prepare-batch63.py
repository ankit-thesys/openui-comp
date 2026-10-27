from pathlib import Path
import json
r=Path('/private/tmp/openui-selectors56-prep');d=json.loads((r/'inventory.json').read_text());families={x['family']:x for x in d['families'] if x['ticket']==63}
batches=[('A','Small roots and image behavior',['Separator','IconText','TextContentWrapper','Image','SourceFaviconImage']),('B','Tokens, variants and small parts',['Tag','IconTag','TextContent','InlineHeader','Callout','TextCallout','MetricIndicator']),('C','Owned rich text, with explicit vendor boundary',['CodeBlock','MarkDownRenderer','InlineMarkdownRenderer']),('D','Composed image/text and lists',['ImageBlock','ImageText','ImageTextLarge','TextBlock','ListItem','ListBlock']),('E','Containers and shared-base consumers',['Card','CardHeader','Buttons','TagBlock']),('F','Loaders and shape-specific skeletons',['DotMatrixLoader','Skeleton']),('G','Sources and composed cards',['Sources','SnippetCardBlock','ContextCardBlock','CompositeCardBlock','OverviewCardBlock','VisualCardBlock']),('H','Interactive layout and structured data',['Accordion','Tabs','Steps','SectionBlock','Carousel','EntityList','Table']),('I','Explicit initial complex deferral',['EditableTable'])]
checks={
'Separator':['Horizontal/vertical orientation and thickness/extent; target root decorative styles without changing semantics.'],
'IconText':['Icon/text alignment, spacing, wrapping and icon dimensions; customize only intentional owned parts.'],
'TextContentWrapper':['Wrapper width/spacing and child geometry; existing caller class/style forwarding.'],
'Image':['Fit/fill modes, dimensions, successful image and load-error branch; preserve existing error hook and accessible alt.'],
'SourceFaviconImage':['Successful img object-fit/display hook; empty URL, natural-size miss and load error render shared IconWrapper without the image hook; URL change restores image attempt.'],
'Tag':['Sizes, semantic variants, icon/text parts and wrapping; preserve current styles prop.'],
'IconTag':['Existing icon/text layout and variant/size maps, caller overrides and truncation.'],
'TextContent':['Preserve text-content and text-content-clear/card/sunk; decide intentional openui alias with61 pattern. Verify root typography/border plus all three variant padding/background/border rules; no skip due prefix filter.'],
'InlineHeader':['Heading, description/icon/side slots and responsive wrapping; customize supported parts, retain actual semantics.'],
'Callout':['Title/body/icon parts and all semantic variants; background/border/text geometry.'],
'TextCallout':['Existing text/variant surfaces and child layout, typography and spacing.'],
'MetricIndicator':['Value/label/trend or other actually exposed variant parts; typography alignment and wrapping; document actual existing API only.'],
'CodeBlock':['Wrapper positioning, copy-button placement/hover/copied-state and accessible copy callback; owned highlighter container margin/radius.', 'Vendor token-color inline themes are outside ordinary later-CSS guarantee. Disclose existing margin important; preserve dependency theme and runtime clipboard behavior.'],
'MarkDownRenderer':['Owned root, headings/link/code/table/list styles and intentional card/sunk variants; actual Markdown rendering and link behavior.', 'Preserve KaTeX/vendor token DOM and inline themes. Owned descendant rules remain eligible; document exact vendor boundary rather than whole-family defer.'],
'InlineMarkdownRenderer':['Inline root, markdown scope, p/direct-child display/margins and inherited typography; flow inside surrounding text and nested TextBlock.', 'Vendor token internals only deferred; retain owned all:unset and cascade semantics.'],
'ImageBlock':['Image/content wrapper dimensions, crop/fit and existing image error behavior; indirect Image regression.'],
'ImageText':['Image and text part spacing/wrapping and available placement/variant combinations; indirect Image/Markdown controls.'],
'ImageTextLarge':['Large layout/part sizing and text overflow; image load/error and narrow container.'],
'TextBlock':['Owned root/primary/secondary/tertiary parts, size/type/alignment/tone/variant combinations; wrapping/truncation and inline Markdown composition.'],
'ListItem':['Owned row/icon/title/description/action layout, supported variants and clickable/disabled states if present; preserve actual semantics/ref/callback.'],
'ListBlock':['List container/direction/gaps and repeated ListItem geometry; no unscoped host list reset.'],
'Card':['Surface/size variants, padding/radius/border and child geometry; caller base vs matching variant overrides.'],
'CardHeader':['Existing openui-header top/bottom/left/right/icon parts and conditional slot layout; no renamed hooks by assumption.'],
'Buttons':['Horizontal/vertical/wrap geometry with real Button/IconButton children; preserve61 controls. Shared-base stock stable handling must be accepted for this root before full conversion.'],
'TagBlock':['Wrapping/gaps with real Tag children; preserve styles plural. Accepted61 shared-base handling required; no independent edit to styles/base.ts.'],
'DotMatrixLoader':['Root grid/size and owned dot dimensions/color/radius; observe animation with normal runtime enabled.', 'Inline opacity and runtime size variables are exact customization limits; do not disable animation or defer ordinary root/dot cosmetics.'],
'Skeleton':['SkeletonBar and stack ordinary styles plus current theme/pulse behavior.', 'Review TableSkeleton/PieChartSkeleton shapes separately; list any specific deferred shape/rule. Private keyframe names alone do not justify deferral.'],
'Sources':['Provider empty/null vs populated strip, favicon/title/item layouts and actual source interaction; transitive portal usage remainsW2#64.'],
'SnippetCardBlock':['LHS/RHS/truncation/tooltip trigger slots, surfaces and narrow layouts; TooltipWrapper behavior unchanged until64 then revisit consumer.'],
'ContextCardBlock':['Root/tag/slot/chevron parts and interactive/static variants; click/keyboard and overflow.', 'Coordinate shared card layout file and Tag consumer; no behavior-hook rewrite.'],
'CompositeCardBlock':['Header/body/footer/wrapper and static/interactive rules, focus/click behavior and all shared layout consumers.'],
'OverviewCardBlock':['Owned content/items/slots and shared small-card grid/rows; container-query breakpoints.'],
'VisualCardBlock':['Background image variable and missing-image none fallback, content/overlay layout and interaction; retain per-instance fallback.'],
'Accordion':['Open/closed content/header/item surfaces, focus-within/data-state rules, keyboard and aria/callback/ref; nested controls preserve61 semantics.'],
'Tabs':['Root/list/trigger/content, active/inactive/disabled and keyboard focus; keep tab semantics and token fallbacks.'],
'Steps':['Step/item/connector/current/completed states actually exposed; label wrapping, spacing and semantics.'],
'SectionBlock':['Foldable section toggle vs nonfoldable layout, header/content parts, open/closed keyboard/callback behavior and narrow layout.'],
'Carousel':['Items/content/navigation, each surface variant, scrolling and disabled/end controls; preserve IconButton geometry and keyboard.'],
'EntityList':['Rows/icons/text/actions, size/tone variants and clickable states where present; narrow/truncated/empty cases and refs.'],
'Table':['Owned table/container/header/body/row/cell/alignment/scroll selectors, sticky/overflow behavior where present; do not restyle unrelated host tables.'],
'EditableTable':['Initial whole-family deferral: editable selection/keyboard and portal Select/DatePicker/Tooltip dependencies need a later coordinated slice.', 'Existing hooks remain recorded but not claimed effective/global converted. Regression-smoke unchanged editors after W1#64 dependencies convert; reconsider scope explicitly.']}
assert len(families)==41;flat=[x for _,_,xs in batches for x in xs];assert len(flat)==len(set(flat))==41 and set(flat)==set(families)
rows=[]
for key,title,names in batches:
 for name in names:
  f=families[name];rows.append({'batch':key,'batchTitle':title,'family':name,'owner':'W2','status':'proposed initial deferral' if key=='I' else 'gated source preparation; not converted','checks':checks[name],'observedHooks':sorted(f['observedHooks']),'observedStateSelectors':list(f['observedStateSelectors']),'files':f['files'],'dependencies':f['crossFamilyImports'],'partialAreas':f['complexException']})
(r/'batch63.json').write_text(json.dumps({'baseCommit':d['baseCommit'],'implementationGate':'accepted61 stock registration and shared-base contract + root-assigned branch/worktree/window','accepted':False,'families':rows},indent=2)+'\n')
with(r/'batch63.md').open('w') as out:
 out.write('''# #63 exact execution order and per-family checks

Source-only plan, bound to accepted #60 c1aaf994d5c0fbfb56b83685221eeea9b409e57c.
#61 is still being implemented/validated by Worker1. No implementation permission
or runtime acceptance follows from this plan. Root must release the accepted #61
source/archive, registration pattern, shared-base contract, and isolated worktree.

## Common acceptance for each converted area

Use existing built public-import comparison seam, preserving source modularity and
all token fallbacks. Record intentional roots/parts/variants/states and prove they
carry the actual owned rules. Later consumer base CSS must override without
important; state/variant rules use matching documented selectors. Compare default
appearance/geometry and behavior against accepted #60/#61, plain/TW3/TW4,
supported orders, provider-free light/explicit/nested themes, inherited and cleared
tokens, caller styles, host negative controls and initial/multiple mount orders.
Use existing optimized bundle/import/build/type checks. Preserve historical
failures, vendor/inline limits and exact converted/partial/deferred coverage.
These are criteria, not new tests or passes. No new tooling or production harness.

Work one vertical slice at a time. For each family: identify selectors, prepare
observable consumer cases, make minimal conversion through accepted #61 mechanism,
validate, then move on. A batch is an ordering aid, not a bulk regex operation.
Registration/tree-shaking metadata and hook index have one integration writer.
Worker2 owns only its folders plus explicitly assigned shared card-layout file;
styles/base.ts remains W1/root integration-owned. #64 work does not overlap #63.

''')
 for key,title,names in batches:
  out.write('## '+key+' — '+title+'\n\n')
  for name in names:
   out.write('**'+name+'** — '+' '.join(checks[name])+'\n\n')
 out.write('''## Dependencies and exact completion limits

- Batch C precedes TextBlock/composed text so ordinary owned Markdown rules are
  established before dependent conversion. Vendor inline/highlighter/KaTeX rules
  remain preserved and disclosed, not falsely counted as normal CSS overrides.
- Batch E's Buttons/TagBlock cannot be marked complete while still using generated
  shared owned box-sizing without an approved explicit exception. Wait for #61's
  base strategy; do not independently change shared root applicability or styles/base.ts.
- Batch G reserves only `_shared/cards/cardBlockLayout.styles.ts` and its actual
  card layout consumers to W2. Inspect its container queries and descendant rules;
  coordinate all consumers or declare an exact partial area, not all _shared.
- W1 #64 owns Select+Calendar+DatePicker+Modal, including Calendar's direct Select
  contentClass/viewportClass imports. W2 #64 owns TooltipWrapper+Citation+ImageGallery.
  Sources/snippets/Markdown use W2 portal dependencies: revisit their indirect
  consumer checks after #64, without concurrent edits to the same files.
- EditableTable's proposed initial deferral is specific, visible and not an approved
  waiver. Root can schedule a later coordinated slice after Select/DatePicker/Tooltip
  acceptance. Existing available hooks do not imply full conversion.
- Chart styles remain excluded. #61's Button/IconButton changes affect DefaultLegend,
  StackedLegend and overflow scroll controls; retain their bounded behavior/geometry
  checks and historical classifications. W2 does not modify these chart files.
- Reuse only frozen #60/#61 actual installed artifacts. #60 archive path-only vendor
  differences from #59 were independently assessed, not removed; do not build from
  a failed #58 dist or transfer #59 byte-binding claims to a different archive.

Completion report must enumerate actual converted rules/hooks and partial/deferred
areas per family. No '41 converted' claim from this inventory. Runtime windows are
exclusive and assigned by root; this preparation uses none.
''')
print('Prepared41families across9orderedbatches; exact per-family cases and exception boundaries.')

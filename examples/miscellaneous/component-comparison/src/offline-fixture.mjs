// Curated OpenUI source; shared unchanged by instant rendering and playback.
export const demoSource = `root = Card([header, intro, typeSection, chartSection, formSection, cardsSection, layoutsSection, followups])
header = CardHeader("Offline component atlas", "80 shared entries through valid parent compositions")
intro = TextContent("Explore both panes. Forms are independent; actions stay in the local activity log.")
typeSection = SectionBlock([SectionItem("type", "01 · Text, media and data", [markdown, callout, textCallout, code, image, imageBlock, gallery, separator, table, tags, entities, inlineHeader, list, editable, steps])], false)
markdown = MarkDownRenderer("**Markdown** with a local [reference](/assets/landscape.svg).", "sunk")
callout = Callout("info", "Callout", "Information without network access")
textCallout = TextCallout("success", "TextCallout", "All media are local")
code = CodeBlock("javascript", "const mode = 'offline';")
image = Image("Local landscape image", "/assets/landscape.svg")
imageBlock = ImageBlock("/assets/landscape.svg", "Local image block")
gallery = ImageGallery([{src: "/assets/landscape.svg", alt: "Local gallery one", details: "Local SVG"}, {src: "/assets/landscape.svg", alt: "Local gallery two"}])
separator = Separator("horizontal", true)
table = Table([Col("Team", ["Chat", "Dashboard"], "string"), Col("Checks", [12, 18], "number")])
tags = TagBlock(["Local", "Interactive", "Shared"], "md")
entities = EntityList([{left: "Mode", right: "Offline"}, {left: "Requests", right: "0", rightVariant: "number"}], "default", {left: "Measure", right: "Value"})
inlineHeader = InlineHeader("Lists and editing", "Local interactions")
list = ListBlock([ListItem("First item", "Numbered example", null, "Log selection", @ToAssistant("Selected first list item")), ListItem("Second item", "Another entry")], "number")
editable = EditableTable("inventory", [{type: "text", key: "name", header: "Name"}, {type: "number", key: "count", header: "Count"}], [{id: "row1", values: ["Local item", 3]}])
steps = Steps([StepsItem("Inspect", "Compare both implementations"), StepsItem("Interact", "Try forms and tabs")])
chartSection = SectionBlock([SectionItem("charts", "02 · Charts", [chartNote, bars, lines, areas, radar, horizontal, pie, radial, stacked, scatter])], false)
chartNote = TextContent("HorizontalBarChart retains inherited default-height / legend-fit limitations; this demo does not patch them.", "small")
labels = ["Jan", "Feb", "Mar"]
series = [Series("Current", [12, 18, 15]), Series("Previous", [9, 12, 11])]
bars = BarChart(labels, series, "grouped", "Month", "Checks", 220)
lines = LineChart(labels, series, "natural", "Month", "Checks", 220)
areas = AreaChart(labels, series, "linear", "Month", "Checks", 220)
radar = RadarChart(labels, series)
horizontal = HorizontalBarChart(labels, series, "grouped", "Checks", "Month")
pie = PieChart(labels, [12, 18, 15], "donut", "circular")
radial = RadialChart(labels, [12, 18, 15])
stacked = SingleStackedBarChart(labels, [12, 18, 15])
scatter = ScatterChart([ScatterSeries("Observations", [Point(1, 4, 2), Point(2, 7, 3), Point(3, 5, 2)])], "Input", "Output")
formSection = SectionBlock([SectionItem("forms", "03 · Inputs and actions", [form, actions, iconButton])], false)
form = Form("offline-form", Buttons([Button("Log form values", @ToAssistant("Submitted offline form"), "primary"), Button("Log secondary action", @ToAssistant("Secondary offline action"), "secondary")]), [fcInput, fcArea, fcSelect, fcDate, fcSlider, fcCheck, fcRadio, fcChips, fcOptions])
fcInput = FormControl("Your name", Input("name", "Offline name", "text"), "Each pane keeps its own draft")
fcArea = FormControl("Notes", TextArea("notes", "Offline notes", 3))
fcSelect = FormControl("Project", Select("project", [SelectItem("chat", "Chat"), SelectItem("dashboard", "Dashboard")], "Choose project"))
fcDate = FormControl("Date", DatePicker("date", "single"))
fcSlider = FormControl("Budget", Slider("budget", "discrete", 0, 100, 10, [30], "Budget"))
fcCheck = FormControl("Checks", CheckBoxGroup("checks", [CheckBoxItem("Styles", "Local styles", "styles", true), CheckBoxItem("Forms", "Form behavior", "forms", false)]))
fcRadio = FormControl("Priority", RadioGroup("priority", [RadioItem("Normal", "Routine", "normal"), RadioItem("High", "Important", "high")], "normal"))
fcChips = FormControl("Tags", Chips("tags", "multiple", [ChipItem("chat", "Chat", Icon("message-circle", "communication")), ChipItem("dashboard", "Dashboard", Icon("chart-bar", "data")), ChipItem("disabled", "Disabled", null, true)], {}, ["chat"]))
fcOptions = FormControl("Kit", OptionCards("kit", "single", [OptionCard("chat", "Chat kit", "Conversations", Icon("message-circle", "communication")), OptionCard("dashboard", "Dashboard kit", "Analytics", image)], {}, "chat"))
actions = Buttons([Button("Log primary", @ToAssistant("Primary action"), "primary"), Button("Log secondary", @ToAssistant("Secondary action"), "secondary"), Button("Log tertiary", @ToAssistant("Tertiary action"), "tertiary", "normal", "small")])
iconButton = IconButton("Log icon action", Icon("plus", "general"), @ToAssistant("Icon action"), "secondary", "medium", "circle")
cardsSection = SectionBlock([SectionItem("cards", "04 · Composed cards and helpers", [snippet, overview, context, composite, visual])], false)
snippet = SnippetCardBlock([SnippetCardItem("snippet1", IconText(Icon("check", "general"), "success", "m", "IconText title", "Subtitle"), Text("number", "24", "Checks", "text", "md")), SnippetCardItem("snippet2", ImageText("/assets/landscape.svg", "Snippet image", "ImageText title", "Subtitle", true, "horizontal", 40), BoldText("text", "Ready", "Local"))], "grid", true, @ToAssistant("Selected snippet"))
overview = OverviewCardBlock([OverviewCardItem("overview1", Text("text", "Overview one"), MetricIndicatorInline("24", "Checks", {direction: "up", value: 2})), OverviewCardItem("overview2", IconText(Icon("chart-bar", "data"), "info", "m", "Overview two"), MetricIndicatorInline("18", "Passed", {direction: "down", value: 1}))], "grid", true)
context = ContextCardBlock([ContextCardItem("context1", Tag("Context tag", Icon("check", "general"), "sm", "success"), "A contextual card", "gray"), ContextCardItem("context2", "Image context", "Local background", "gray", "/assets/landscape.svg", "Local context background")], "grid", true, @ToAssistant("Selected context"))
composite = CompositeCardBlock([CompositeCardItem("composite1", ImageTextLarge("/assets/landscape.svg", "Large card image", "ImageTextLarge", "Composite header", true), [Text("text", "Composite body"), MetricIndicatorInline("42", "Local metric"), TagBlock(["Ready"])], {price: MetricIndicatorWithStrikethrough("$20", "Current", "$25", {direction: "down", value: 5}), button: Button("Log composite", @ToAssistant("Composite action"), "secondary")}), CompositeCardItem("composite2", IconText(Icon("layers", "general"), "neutral", "m", "Another composite"), [BoldText("text", "Structured body"), EntityList([{left: "Status", right: "Ready"}], "small")], {price: BoldText("number", "$30"), button: Button("Log other composite", @ToAssistant("Other composite action"), "secondary")})], "grid", true)
visual = VisualCardBlock([VisualCardItem(BoldText("text", "Visual one", "Local image"), "visual1", "/assets/landscape.svg", Tag("Local", Icon("image", "general"), "sm", "info"), "Visual one landscape"), VisualCardItem(BoldText("text", "Visual two", "Same structure"), "visual2", "/assets/landscape.svg", Tag("Ready", null, "sm", "success"), "Visual two landscape")], "grid", true, @ToAssistant("Selected visual"))
layoutsSection = SectionBlock([SectionItem("layouts", "05 · Tabs, accordion and carousel", [tabs, carousel])], false)
tabs = Tabs([TabItem("overview", "Overview tab", [TextContent("Overview tab content")]), TabItem("details", "Details tab", [TextContent("Details tab content"), accordion])])
accordion = Accordion([AccordionItem("faq1", "How does offline work?", [TextContent("Accordion answer: local playback, no API calls.")]), AccordionItem("faq2", "Are drafts shared?", [TextContent("No. Drafts stay inside each iframe.")]), AccordionItem("faq3", "What about themes?", [TextContent("The selected theme reaches both providers.")])])
carousel = Carousel([[TextContent("Carousel slide one"), image], [TextContent("Carousel slide two"), imageBlock]], "card")
followups = FollowUpBlock([FollowUpItem("Log an offline follow-up"), FollowUpItem("Compare another local interaction")])`;

export const directExamples = [
  {
    name: "Label",
    source: 'root = Label("Direct Label example")',
    note: "Rendered through the unchanged registry.",
  },
  {
    name: "Slice",
    source: 'root = Slice("Local slice", 12)',
    note: "Data-only registry entry: returns null by design. Pie charts above consume label/value arrays, not Slice nodes.",
  },
  {
    name: "SwitchGroup",
    source:
      'root = SwitchGroup("offline-switches", [SwitchItem("Notifications", "Local toggle", "notifications", true), SwitchItem("Reports", "Independent toggle", "reports", false)], "card")',
    note: "Direct root composition; SwitchItem is rendered through this parent.",
  },
  {
    name: "SwitchItem",
    source:
      'root = SwitchItem("Standalone switch data", "Data-only entry", "standalone", false)',
    note: "Data-only registry entry: returns null alone. The SwitchGroup example above provides its visible control.",
  },
];
export const demoChunks = demoSource.match(/[\s\S]{1,180}/g);

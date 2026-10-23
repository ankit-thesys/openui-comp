// Actual production library DSL. Each repeated block exercises expanded controls,
// layout, table and three chart families; the parser and genui renderers stay real.
export function makeExpandedResponse(size=1){const count=Math.max(1,Math.min(20,Math.floor(size)||1));const children=['heading'],defs=['heading = CardHeader("Expanded runtime component investigation", "Controls, stateful layout and real D3 charts")'];for(let i=0;i<count;i++){const p='e'+i;children.push(p+'text',p+'form',p+'table',p+'bar',p+'line',p+'pie',p+'tabs',p+'accordion');defs.push(
`${p}text = TextContent("### Section ${i+1}\\nReal **markdown**, controls and charts with production OpenUI components.")`,
`${p}form = Form("expanded${i}", ${p}buttons, [${p}inputField, ${p}selectField, ${p}checksField, ${p}switchField, ${p}radioField])`,
`${p}buttons = Buttons([Button("Apply", null, "primary"), Button("Save", null, "secondary")])`,
`${p}inputField = FormControl("Account", Input("account${i}", "Account name", "text"), "Production input")`,
`${p}selectField = FormControl("Region", Select("region${i}", [SelectItem("eu", "Europe"), SelectItem("us", "America")], "Choose region"))`,
`${p}checksField = FormControl("Channels", CheckBoxGroup("channels${i}", [CheckBoxItem("Email", "Email updates", "email${i}", true), CheckBoxItem("SMS", "Text updates", "sms${i}", false)]))`,
`${p}switchField = FormControl("Automation", SwitchGroup("automation${i}", [SwitchItem("Enabled", "Scheduled automation", "enabled${i}", false)], "clear"))`,
`${p}radioField = FormControl("Plan", RadioGroup("plan${i}", [RadioItem("Starter", "Basic plan", "starter"), RadioItem("Pro", "Advanced plan", "pro")]))`,
`${p}table = Table([Col("Name", ["A", "B", "C"], "string"), Col("Revenue", [42, 55, 63], "number")])`,
`${p}bar = BarChart(["Jan", "Feb", "Mar"], [Series("Revenue", [42, 55, 63])], "grouped", "Month", "Revenue", 220)`,
`${p}line = LineChart(["Jan", "Feb", "Mar"], [Series("Revenue", [42, 55, 63])], "linear", "Month", "Revenue", 220)`,
`${p}pie = PieChart(["Europe", "America", "Asia"], [42, 55, 63], "donut", "circular")`,
`${p}tabs = Tabs([TabItem("summary", "Summary", [TextContent("Summary details")]), TabItem("details", "Details", [TextContent("Detailed analysis")])])`,
`${p}accordion = Accordion([AccordionItem("method", "Methodology", [TextContent("Production accordion content")])])`)}return 'root = Card(['+children.join(', ')+'])\n'+defs.join('\n')+'\n'}

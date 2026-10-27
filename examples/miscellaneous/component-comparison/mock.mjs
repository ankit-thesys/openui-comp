import { setTimeout as delay } from "node:timers/promises";
export async function* mockResponse({ messages, signal }) {
  const prompt = messages.at(-1).content;
  const program = `root = Card([intro, table, chart, form, followups])\nintro = TextContent(${JSON.stringify("**Same response, two libraries.** " + prompt)})\ntable = Table([Col("Month", ["Jan", "Feb", "Mar"]), Col("Sales", [10, 20, 30])])\nchart = BarChart(["Jan", "Feb", "Mar"], [Series("Sales", [10, 20, 30])], "grouped")\nform = Form("contact", buttons, [field])\nfield = FormControl("Name", Input("name", "Your name", "text", { required: true }))\nbuttons = Buttons([Button("Send details", @ToAssistant("Send details"), "primary")])\nfollowups = FollowUpBlock([FollowUpItem("Show the next quarter")])`;
  for (let offset = 0; offset < program.length; offset += 32) {
    await delay(35, undefined, { signal });
    yield program.slice(offset, offset + 32);
  }
}

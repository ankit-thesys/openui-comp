import { createHash } from 'node:crypto';
export function makeCell(workload, load) {
  if (!['chat', 'dashboard'].includes(workload) || !['paced', 'stress'].includes(load)) throw Error('Unknown cell');
  const size = load === 'paced' ? 2 : 6;
  const nodes = [], lines = [];
  for (let i = 0; i < size; i++) {
    nodes.push(`text${i}`, `table${i}`);
    lines.push(`text${i} = TextContent(${JSON.stringify(`${workload} section ${i}: **OpenUI streaming** ` + 'Deterministic replay content. '.repeat(30))})`);
    lines.push(`table${i} = Table([Col("Month", ["Jan", "Feb", "Mar"]), Col("Sales", [10, 20, 30])])`);
    if (workload === 'dashboard') {
      nodes.push(`chart${i}`);
      lines.push(`chart${i} = BarChart(["Jan", "Feb", "Mar"], [Series("Sales", [10, 20, 30])], "grouped")`);
    }
  }
  nodes.push('form', 'followups');
  lines.push('form = Form("contact", buttons, [field])');
  lines.push('field = FormControl("Name", Input("name", "Your name", "text", { required: true }))');
  lines.push('buttons = Buttons([Button("Send details", @ToAssistant("Send details"), "primary")])');
  lines.push('followups = FollowUpBlock([FollowUpItem("Show the next quarter")])');
  const payload = `root = Card([${nodes.join(', ')}])\n${lines.join('\n')}`;
  const bytes = Buffer.from(payload);
  const rate = load === 'paced' ? 40 : 0, chunk = load === 'paced' ? 512 : 64;
  const schedule = Array.from({length: Math.ceil(bytes.length / chunk)}, (_, i) => ({offset: i * chunk, bytes: Math.min(chunk, bytes.length - i * chunk), delay: rate}));
  const hash = x => createHash('sha256').update(x).digest('hex');
  return {workload, load, size, rate, chunk, payload, payloadSha256: hash(bytes), schedule, scheduleSha256: hash(JSON.stringify(schedule)), tables: size, bars: workload === 'dashboard' ? size * 3 : 0};
}

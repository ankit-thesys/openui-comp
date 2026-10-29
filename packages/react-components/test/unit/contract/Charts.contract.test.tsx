// Chart foundations: render public charts in Node and enforce the flat contract in both modes.
// Run after build: pnpm exec vitest run test/unit/contract/Charts.contract.test.tsx.
// Converted shared modules must leave test/flat-allowlist.json; chart-specific modules stay.
import { describeContract } from "./defineContract";

describeContract("Charts");

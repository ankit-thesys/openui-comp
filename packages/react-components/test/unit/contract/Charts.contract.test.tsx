// Chart foundations: render public charts in Node and enforce the flat contract in both modes.
// Run after build: pnpm exec vitest run test/unit/contract/Charts.contract.test.tsx.
import { describeContract } from "./defineContract";

describeContract("Charts");

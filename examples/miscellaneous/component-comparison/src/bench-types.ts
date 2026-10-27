export type Assertion = {
  id: string;
  kind: string;
  expected?: unknown;
  value?: string;
  [key: string]: unknown;
};
export type BenchCase = {
  id: string;
  name: string;
  source: string;
  version: string;
  coverage: string[];
  assertions: Assertion[];
  steps: Record<string, unknown>[];
  deliveries: string[];
  setup: {
    pendingQuery?: boolean;
    isStreaming?: boolean;
    sharedSession?: boolean;
    directHorizontal?: {
      height: number | string;
      fitLegendInHeight: boolean;
      parentHeight: number;
    };
    [key: string]: unknown;
  };
  saved?: boolean;
};
export type Layer = {
  status: string;
  differences?: unknown[];
  assertions?: unknown[];
  [key: string]: unknown;
};
export type CellResult = {
  cell: {
    id: string;
    caseId: string;
    environment: string;
    width: number;
    height: number;
    theme: string;
    delivery: string;
  };
  verdict: string;
  executed: boolean;
  layers: Record<string, Layer>;
  images?: string[];
  evidence?: string;
  reproduce?: string;
};
export type Checklist = {
  component: string;
  signature: string;
  direct: boolean;
  checks: {
    id: string;
    kind: string;
    applicable: boolean;
    reason?: string;
    cases: string[];
    assertions: string[];
    status?: string;
    evidence?: string[];
  }[];
};
export type Run = {
  id: string;
  mode: "quick" | "full";
  themePreset?: { id: string; label: string; definitionHash: string };
  status: string;
  createdAt?: string;
  cases: BenchCase[];
  results: CellResult[];
  coverage: Checklist[];
  provenance: unknown;
  summary: {
    expected: number;
    executed: number;
    verdict: string;
    counts: Record<string, number>;
  };
  uncoveredChecks?: string[];
};
export type Progress = {
  id: string;
  status: string;
  total?: number;
  completed?: number;
  running?: string;
  error?: string;
  summary?: Run["summary"];
};

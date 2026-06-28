import type { BenchmarkStatus } from "../content/types";

export interface StatusLabel {
  text: string;
  note: string;
}

const LABELS: Record<BenchmarkStatus, StatusLabel> = {
  playable: {
    text: "Playable",
    note: "The build runs offline in a current browser.",
  },
  partial: {
    text: "Partial",
    note: "The build runs but does not satisfy every requirement. See run notes.",
  },
  failed: {
    text: "Failed",
    note: "The build did not run. The attempt is published transparently.",
  },
};

export function statusLabel(status: BenchmarkStatus): StatusLabel {
  return LABELS[status];
}

import { Suspense } from "react";
import Samples from "../../../components/Samples";
export const dynamic = "force-dynamic";
async function LateSamples() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return (
    <section data-stream-late>
      <Samples />
    </section>
  );
}
export default function StreamingPage() {
  return (
    <Suspense fallback={<p data-stream-fallback>Waiting for late components…</p>}>
      <LateSamples />
    </Suspense>
  );
}

import { Suspense } from "react";
import { Await, useLoaderData } from "react-router";
import { Samples } from "../samples";

export function loader() {
  // Returning the promise without awaiting it streams the shell through React Router's
  // default Node entry.server (renderToPipeableStream / onShellReady).
  return {
    late: new Promise<string>((resolve) => {
      setTimeout(() => resolve("Deferred loader components"), 600);
    }),
  };
}

export default function Home() {
  const { late } = useLoaderData<typeof loader>();
  return (
    <Suspense fallback={<p data-compat-pending>Waiting for the deferred loader…</p>}>
      <Await resolve={late}>{(message) => <Samples message={message} />}</Await>
    </Suspense>
  );
}

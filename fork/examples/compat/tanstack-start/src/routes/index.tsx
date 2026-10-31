import { Await, createFileRoute } from "@tanstack/react-router";
import { Samples } from "../samples";

export const Route = createFileRoute("/")({
  loader: () => ({
    late: new Promise<string>((resolve) => {
      setTimeout(() => resolve("Deferred loader components"), 600);
    }),
  }),
  component: Home,
});

function Home() {
  const { late } = Route.useLoaderData();
  return (
    <Await promise={late} fallback={<p data-compat-pending>Waiting for the deferred loader…</p>}>
      {(message) => <Samples message={message} />}
    </Await>
  );
}

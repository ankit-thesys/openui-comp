import { Button, css, Tag } from "openui-under-test";
import { Suspense, useEffect } from "react";

// Module level, like every component style: registered at import, so it is in the server sheet.
const late = css`
  padding: 19px;
  border-top-style: solid;
  background-color: rgb(91, 103, 117);
  &:hover {
    outline-width: 3px;
  }
  @media (min-width: 1px) {
    border-top-width: 7px;
  }
`;

// A rule the server never saw: registered in the browser only, after hydration.
export const lateStyles = (response: string) => css`
  --streaming-response: ${response};
  outline-style: dotted;
`;

export function StreamingApp({
  response,
  wait,
  hydrated,
}: {
  response: string;
  wait?: () => void;
  hydrated?: () => void;
}) {
  useEffect(() => hydrated?.(), [hydrated]);
  function Late() {
    wait?.();
    return (
      <div className={`${late} streaming-late`} data-testid="late">
        <Tag text="Late component" />
      </div>
    );
  }
  return (
    <main>
      <Button data-testid="early">Early component</Button>
      <Suspense fallback={<div data-testid="fallback">Waiting</div>}>
        <Late />
      </Suspense>
    </main>
  );
}

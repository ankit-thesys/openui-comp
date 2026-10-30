import { Button, css, Tag } from "openui-under-test";
import { Suspense, useEffect } from "react";

// A fresh rule for each response, even when the server already cached Tag's styles.
export const lateStyles = (response: string) => css`
  --streaming-response: ${response};
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
    const name = lateStyles(response);
    return (
      <div className={`${name} streaming-late`} data-testid="late">
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

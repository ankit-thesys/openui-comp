import {
  CodeBlock,
  configureStyles,
  DotMatrixLoader,
  PieChartSkeleton,
  Skeleton,
  TableSkeleton,
  ThemeProvider,
} from "openui-under-test";
import { createRoot } from "react-dom/client";

const params = new URLSearchParams(location.search);
configureStyles({ layer: params.get("layer") ?? undefined });
const mount = () =>
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider mode={params.get("mode") === "dark" ? "dark" : "light"}>
      {!params.has("codeOnly") && (
        <>
          <Skeleton
            className="app-skeleton"
            count={2}
            height="20px"
            width="80px"
            borderRadius="12px"
          />
          <TableSkeleton rows={2} columns={2} />
          {(["pie", "donut"] as const).flatMap((variant) =>
            (["circular", "semiCircular"] as const).map((appearance) => (
              <PieChartSkeleton
                key={`${variant}-${appearance}`}
                variant={variant}
                appearance={appearance}
                size={120}
                legendItems={2}
              />
            )),
          )}
          <DotMatrixLoader className="app-loader" />
          <DotMatrixLoader variant="compact" size={40} />
        </>
      )}
      <CodeBlock language="javascript" codeString="const answer = 42;" className="app-code" />
      <CodeBlock
        language="text"
        codeString="Custom highlighter"
        className="app-code-custom"
        syntaxHighlighterClassName="app-highlighter"
      />
      <CodeBlock
        language="text"
        codeString="Empty highlighter class"
        className="app-code-empty"
        syntaxHighlighterClassName=""
      />
    </ThemeProvider>,
  );
if (params.has("lazy")) window.mountFixture = mount;
else mount();

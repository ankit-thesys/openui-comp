// Shared opt-ins only: the families' owned layout rules are still allowlisted (#91/#96/#101).
import {
  Buttons,
  FormControl,
  PieChartSkeleton,
  Skeleton,
  TableSkeleton,
  TagBlock,
  ThemeProvider,
} from "openui-under-test";
import { createRoot } from "react-dom/client";

const params = new URLSearchParams(location.search);
const mount = () =>
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider
      cssLayer={params.get("layer") ?? undefined}
      mode={params.get("mode") === "dark" ? "dark" : "light"}
    >
      <Buttons>
        <span data-testid="buttons-child">Action</span>
      </Buttons>
      <FormControl>
        <span data-testid="form-child">Field</span>
      </FormControl>
      <TagBlock>
        <span data-testid="tag-child">Tag</span>
      </TagBlock>
      <div data-testid="plain">Unrelated</div>
      <Skeleton count={2} />
      <TableSkeleton rows={1} columns={2} />
      {(["pie", "donut"] as const).flatMap((variant) =>
        (["circular", "semiCircular"] as const).map((appearance) => (
          <PieChartSkeleton
            key={`${variant}/${appearance}`}
            variant={variant}
            appearance={appearance}
            legendItems={1}
            size={80}
          />
        )),
      )}
    </ThemeProvider>,
  );

if (params.has("lazy")) window.mountFixture = mount;
else mount();

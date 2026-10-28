// IconButtons for the override spec: the defaults, every other prop value once, and asChild.
import { IconButton } from "openui-under-test";
import { createRoot } from "react-dom/client";

const Icon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

createRoot(document.getElementById("root")!).render(
  <>
    <IconButton data-testid="default" aria-label="Default" icon={<Icon />} />
    <IconButton
      data-testid="custom"
      aria-label="Custom"
      variant="secondary"
      size="small"
      shape="circle"
      tone="destructive"
      icon={<Icon />}
    />
    <IconButton data-testid="tertiary" aria-label="Tertiary" variant="tertiary" icon={<Icon />} />
    <IconButton data-testid="xxs" aria-label="2XS" size="2-extra-small" icon={<Icon />} />
    <IconButton data-testid="xs" aria-label="XS" size="extra-small" icon={<Icon />} />
    <IconButton data-testid="large" aria-label="Large" size="large" icon={<Icon />} />
    <IconButton
      asChild
      size="3-extra-small"
      icon={<Icon />}
      className="app-as-child"
      aria-label="As child"
    >
      <div role="button" tabIndex={0} data-testid="as-child" />
    </IconButton>
    <button type="button" data-testid="plain">
      Plain
    </button>
  </>,
);

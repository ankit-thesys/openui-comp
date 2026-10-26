export const sectionStyles = `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: var(--openui-space-xl, 24px);
  margin-top: var(--openui-space-m, 12px);
  & .openui-section-v2-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    gap: var(--openui-space-xl, 24px);
  }
  & .openui-section-v2-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: var(--openui-space-s, 8px);
    margin-bottom: var(--openui-space-2xs, 4px);
  }
  & .openui-section-v2-header-trigger {
    font: var(--openui-text-heading-sm, 600 18px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-heading-sm-letter-spacing, -0.01em);
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  }
  & .openui-section-v2-content {
    width: 100%;
    gap: var(--openui-space-xl, 24px);
    display: flex;
    flex-direction: column;
  }
`;

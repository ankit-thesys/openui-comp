import { css } from "@openuidev/react-components";
export const comparisonStyles = css`
  .openui-dashboard-rowchart {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .openui-dashboard-rowchart-rows {
    flex: 1 1 auto;
    display: grid;
    gap: 6px;
    align-content: space-between;
  }
  /* A ranked list that opens its card rises onto the card subtitle's line, so its sort toggle
     sits beside the title, but not when the card head has its own controls there. One selector
     per container: goober splits :is() lists at their commas. */
  .openui-dashboard-card-body > .openui-dashboard-rank-panel:first-child,
  .openui-dashboard-state-content > .openui-dashboard-rank-panel:first-child {
    margin-top: -32px;
  }
  .openui-dashboard-card:has(.openui-dashboard-card-controls)
    .openui-dashboard-card-body
    > .openui-dashboard-rank-panel:first-child,
  .openui-dashboard-card:has(.openui-dashboard-card-controls)
    .openui-dashboard-state-content
    > .openui-dashboard-rank-panel:first-child {
    margin-top: 0;
  }
`;

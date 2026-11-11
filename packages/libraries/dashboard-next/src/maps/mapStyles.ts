import { css } from "@openuidev/react-components";

export const mapStyles = css`
  .openui-dashboard-geo {
    display: flex;
    flex-direction: column;
  }
  .openui-dashboard-geo > .openui-dashboard-geo-legend {
    padding: var(--openui-dashboard-space-sm) 0;
    align-items: center;
  }
  .openui-dashboard-geo-body {
    display: flex;
    flex-wrap: wrap;
    gap: var(--openui-dashboard-space-lg);
    align-items: stretch;
  }
  .openui-dashboard-geo-map {
    position: relative;
    flex: 2 1 340px;
    min-width: 0;
    /* The column stretches to the list beside it; the map centres in it. */
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .openui-dashboard-card-body > .openui-dashboard-geo {
    flex: 1 1 auto;
  }
  .openui-dashboard-geo > .openui-dashboard-geo-body {
    flex: 1 1 auto;
  }
  /* His .card:has(.card-controls :is(button, input, select)) .geo-side { margin-top: 0 }: the
     list rises onto the subtitle's line unless the card head holds a control there. goober
     breaks a selector with anything after a ")", so the card sets a variable the list reads. */
  .openui-dashboard-card:has(.openui-dashboard-card-controls button),
  .openui-dashboard-card:has(.openui-dashboard-card-controls input),
  .openui-dashboard-card:has(.openui-dashboard-card-controls select) {
    --openui-dashboard-geo-rise: 0px;
  }
  .openui-dashboard-card .openui-dashboard-geo-side {
    margin-top: var(--openui-dashboard-geo-rise, -32px);
  }
  /* Narrow: the list sits under the map, never risen (his @container rule, restated at this
     selector's weight). */
  @container openui-dashboard (max-width: 720px) {
    .openui-dashboard-card .openui-dashboard-geo-side {
      margin-top: 0;
    }
  }
`;

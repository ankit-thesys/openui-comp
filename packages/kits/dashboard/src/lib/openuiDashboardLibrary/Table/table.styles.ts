import { css } from "goober";

/**
 * The only live rule from the old `table.scss`.
 *
 * The rest of that stylesheet targeted `c1-table*` class names that genui-sdk's
 * hand-rolled table emitted. This kit renders react-components' `ScrollableTable`
 * instead, which emits none of them, so those rules matched nothing and are not
 * carried over.
 */
export const tableWrapperClass = css`
  & .openui-table-cell .openui-tag {
    width: fit-content;
  }
`;

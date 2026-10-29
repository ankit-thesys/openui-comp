"use client";

/**
 * Table and Col for the dashboard library.
 *
 * genui-sdk's version pulled these out of react-ui's legacy `openuiLibrary`
 * registry by string lookup, which made them `DefinedComponent | undefined`
 * and tied the dashboard to the old library. These are the real definitions,
 * built on `@openuidev/react-components` like the rest of the kit.
 */
export { Col as ColComponent, Table as TableComponent } from "../../../shared/table";

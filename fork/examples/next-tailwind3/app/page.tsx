// Imported below the root layout, so Next places it after <ComponentStyles>: equal-weight app
// rules and Tailwind utilities win over component rules.
import "./globals.css";
import PageBody from "./page-body";

export default function Page() {
  return <PageBody />;
}

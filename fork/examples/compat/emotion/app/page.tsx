import Fixture from "./fixture";
// Page-owned CSS must follow the hoisted component sheet (ADR 0002's order trick).
import "./globals.css";
export const dynamic = "force-dynamic";

export default function Page() {
  return <Fixture />;
}

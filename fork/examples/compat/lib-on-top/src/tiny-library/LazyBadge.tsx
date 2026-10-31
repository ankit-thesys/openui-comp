import { priceBadge } from "./priceBadge.styles";
export default function LazyBadge() {
  return (
    <div data-price-badge className={priceBadge}>
      Library lazy badge
    </div>
  );
}

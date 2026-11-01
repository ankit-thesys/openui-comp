import * as badge from "./priceBadge.styles";
import * as card from "./priceCard.styles";
// Retain value references so bundlers cannot discard the collector's eager style imports.
const styles = [card, badge];
export { styles };

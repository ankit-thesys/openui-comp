import { IconWrapper, Tag as OpenUITag } from "@openuidev/react-components";
import type { SubComponentOf } from "@openuidev/react-lang";
import { z } from "zod/v4";
import type { TagSchema } from "./Tag";

type TagProps = z.infer<typeof TagSchema>;

/** Renders a `Tag` element ref (as used inside card blocks) at the small size. */
export function renderCardTag(tag: SubComponentOf<TagProps> | undefined, key?: string) {
  if (!tag) return null;
  const { text, variant, icon } = tag.props;

  return (
    <OpenUITag
      key={key}
      text={text}
      variant={variant ?? "neutral"}
      size="sm"
      icon={
        icon?.props?.name ? (
          <IconWrapper name={icon.props.name} category={icon.props.category} />
        ) : undefined
      }
    />
  );
}

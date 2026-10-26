import clsx from "clsx";
import { CSSProperties, forwardRef, ReactElement } from "react";
import { FollowUpItemProps } from "../FollowUpItem";
import { headerClass, rootClass } from "./followUpBlock.styles";

export interface FollowUpBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactElement<FollowUpItemProps> | ReactElement<FollowUpItemProps>[];
  className?: string;
  style?: CSSProperties;
}

const FollowUpBlock = forwardRef<HTMLDivElement, FollowUpBlockProps>((props, ref) => {
  const { children, className, style, ...rest } = props;
  return (
    <div
      ref={ref}
      className={clsx(rootClass, "openui-follow-up-block", className)}
      style={style}
      {...rest}
    >
      <div className={clsx(headerClass, "openui-follow-up-block__header")}>Related Queries</div>
      {children}
    </div>
  );
});

FollowUpBlock.displayName = "FollowUpBlock";

export { FollowUpBlock };

// components/base/buttons/button.tsx
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  ReactNode,
  Ref,
} from "react";
import { cx, sortCx } from "@/utils/cx";
import { directionalIconClass } from "@/utils/directional-icon";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "medium" | "small" | "xs";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export interface ButtonLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  children?: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
}

const styles = sortCx({
  base: [
    "inline-flex items-center justify-center gap-0.5 whitespace-nowrap overflow-hidden",
    "font-sans select-none cursor-pointer transition-colors duration-150",
    "button-press-motion",
    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#007aff]",
    "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed",
  ].join(" "),

  size: {
    medium: "h-9 rounded-[10px] p-2 text-body-medium",
    small:  "h-8 rounded-[8px] px-2 py-1.5 text-body-medium",
    xs:     "h-6 rounded-[6px] px-2 text-caption-1-semibold",
  },

  iconOnlySize: {
    medium: "",
    small:  "size-8 p-0",
    xs:     "size-6 p-0",
  },

  icon: {
    medium: "size-5 shrink-0",
    small:  "size-[18px] shrink-0",
    xs:     "size-3.5 shrink-0",
  },

  label: {
    medium: "inline-flex items-center justify-center px-1 shrink-0",
    small:  "inline-flex items-center justify-center px-0.5 shrink-0",
    xs:     "inline-flex items-center justify-center px-0.5 shrink-0",
  },

  variant: {
    primary: [
      "bg-[#007aff] text-white shadow-xs",
      "hover:bg-[#0062cc] active:bg-[#0051a8]",
      "disabled:bg-[#b2d5ff] disabled:text-white disabled:shadow-none",
      "aria-disabled:bg-[#b2d5ff] aria-disabled:text-white aria-disabled:shadow-none",
    ].join(" "),
    danger: [
      "bg-[#d92d20] text-white shadow-xs",
      "hover:bg-[#b42318] active:bg-[#912018]",
      "disabled:bg-[#fda29b] disabled:text-white disabled:shadow-none",
      "aria-disabled:bg-[#fda29b] aria-disabled:text-white aria-disabled:shadow-none",
    ].join(" "),
    secondary: [
      "bg-white text-[#344054]",
      "border border-[#d0d5dd] shadow-xs",
      "hover:bg-[#f9fafb] hover:text-[#1d2939] hover:border-[#d0d5dd]",
      "active:bg-[#f2f4f7]",
      "disabled:bg-[#f9fafb] disabled:border-[#eaecf0] disabled:text-[#98a2b3] disabled:shadow-none",
      "aria-disabled:bg-[#f9fafb] aria-disabled:border-[#eaecf0] aria-disabled:text-[#98a2b3] aria-disabled:shadow-none",
    ].join(" "),
    ghost: [
      "bg-transparent text-[#475467]",
      "hover:bg-[#f2f4f7] hover:text-[#101828] active:bg-[#eaecf0]",
      "disabled:bg-transparent disabled:text-[#98a2b3] disabled:shadow-none",
      "aria-disabled:bg-transparent aria-disabled:text-[#98a2b3] aria-disabled:shadow-none",
    ].join(" "),
  },
});

export function Button({
  variant = "primary",
  size = "medium",
  iconOnly = false,
  leadingIcon: Leading,
  trailingIcon: Trailing,
  children,
  className,
  type = "button",
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        styles.base,
        styles.size[size],
        styles.variant[variant],
        iconOnly && styles.iconOnlySize[size],
        className,
      )}
      {...props}
    >
      {Leading ? <Leading className={cx(styles.icon[size], directionalIconClass(Leading))} aria-hidden /> : null}
      {!iconOnly && children !== undefined && children !== null && (
        <span className={styles.label[size]}>{children}</span>
      )}
      {!iconOnly && Trailing ? (
        <Trailing className={cx(styles.icon[size], directionalIconClass(Trailing))} aria-hidden />
      ) : null}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "medium",
  iconOnly = false,
  leadingIcon: Leading,
  trailingIcon: Trailing,
  children,
  className,
  ref,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      ref={ref}
      className={cx(
        styles.base,
        styles.size[size],
        styles.variant[variant],
        iconOnly && styles.iconOnlySize[size],
        className,
      )}
      {...props}
    >
      {Leading ? <Leading className={cx(styles.icon[size], directionalIconClass(Leading))} aria-hidden /> : null}
      {!iconOnly && children !== undefined && children !== null && (
        <span className={styles.label[size]}>{children}</span>
      )}
      {!iconOnly && Trailing ? (
        <Trailing className={cx(styles.icon[size], directionalIconClass(Trailing))} aria-hidden />
      ) : null}
    </a>
  );
}

export const buttonStyles = styles;
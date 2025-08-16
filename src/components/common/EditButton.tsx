import * as React from "react";
import { Pencil } from "lucide-react";

// EditButton.tsx — drop this into your components folder
// Usage examples:
// <EditButton onClick={...} />
// <EditButton label="수정" />
// <EditButton variant="ghost" size="sm" />
// <EditButton iconOnly aria-label="소개 편집" />

export type EditButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 버튼 텍스트 (기본값: "편집") */
  label?: string;
  /** 스타일 버전 */
  variant?: "primary" | "secondary" | "ghost";
  /** 크기 */
  size?: "sm" | "md";
  /** 아이콘만 표시 (라벨 숨김) */
  iconOnly?: boolean;
};

const variantClasses: Record<
  NonNullable<EditButtonProps["variant"]>,
  string
> = {
  primary:
    "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
  ghost:
    "text-gray-700 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
};

const sizeClasses: Record<NonNullable<EditButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export default function EditButton({
  label = "편집",
  variant = "secondary",
  size = "md",
  iconOnly = false,
  className = "",
  children,
  ...props
}: EditButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium shadow-sm",
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 dark:focus-visible:ring-white/50 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    iconOnly ? (size === "sm" ? "w-9 px-0" : "w-10 px-0") : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type="button" {...props}>
      <Pencil className={iconOnly ? "h-4 w-4" : "h-4 w-4"} />
      {!iconOnly && (children ?? <span>{label}</span>)}
    </button>
  );
}

import type { MouseEvent, ReactNode } from "react";

type DocLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  /** Prevents parent <label> from toggling the checkbox when the link is clicked */
  inCheckboxLabel?: boolean;
};

export default function DocLink({
  href,
  className = "",
  children,
  inCheckboxLabel = false,
}: DocLinkProps) {
  const stopLabelToggle = inCheckboxLabel
    ? {
        onMouseDown: (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        onClick: (e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation(),
      }
    : {};

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...stopLabelToggle}
    >
      {children}
    </a>
  );
}

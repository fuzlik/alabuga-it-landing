import type { MouseEvent, ReactNode } from "react";
import { PRIVACY_POLICY_URL } from "../config/privacyPolicyUrl";

type PrivacyPolicyLinkProps = {
  nodeId: string;
  className?: string;
  children?: ReactNode;
  /** Prevents parent <label> from toggling the checkbox when the link is clicked */
  inCheckboxLabel?: boolean;
};

export default function PrivacyPolicyLink({
  nodeId,
  className = "",
  children = "Политика конфидициальности",
  inCheckboxLabel = false,
}: PrivacyPolicyLinkProps) {
  const stopLabelToggle = inCheckboxLabel
    ? {
        onMouseDown: (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        onClick: (e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation(),
      }
    : {};

  return (
    <a
      href={PRIVACY_POLICY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-node-id={nodeId}
      data-name="label"
      {...stopLabelToggle}
    >
      {children}
    </a>
  );
}

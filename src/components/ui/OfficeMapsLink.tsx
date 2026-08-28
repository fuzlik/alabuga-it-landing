import type { ReactNode } from "react";
import { OFFICE_MAPS_LABEL, OFFICE_MAPS_URL } from "../../lib/officeMapsUrl";

type OfficeMapsLinkProps = {
  nodeId: string;
  className?: string;
  children?: ReactNode;
};

export default function OfficeMapsLink({
  nodeId,
  className = "",
  children = OFFICE_MAPS_LABEL,
}: OfficeMapsLinkProps) {
  return (
    <a
      href={OFFICE_MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-node-id={nodeId}
    >
      {children}
    </a>
  );
}

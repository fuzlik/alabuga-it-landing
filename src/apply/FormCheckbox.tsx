import { useId, useState, type ReactNode } from "react";

const checkIcon = "/assets/icons/check.svg";

export type FormCheckboxProps = {
  label: ReactNode;
  nodeId?: string;
  boxNodeId?: string;
  labelNodeId?: string;
  className?: string;
  labelClassName?: string;
  defaultChecked?: boolean;
  error?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export default function FormCheckbox({
  label,
  nodeId,
  boxNodeId,
  labelNodeId,
  className = "",
  labelClassName = "",
  defaultChecked = false,
  error = false,
  onCheckedChange,
}: FormCheckboxProps) {
  const id = useId();
  const [checked, setChecked] = useState(defaultChecked);

  const toggle = (next: boolean) => {
    setChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <label
      htmlFor={id}
      className={["flex items-center gap-[12px] cursor-pointer select-none", className]
        .filter(Boolean)
        .join(" ")}
      data-node-id={nodeId}
      data-name="Checkbox"
      data-state={error ? "Error" : checked ? "Checked" : "Default"}
    >
      <span
        className={[
          "relative inline-flex size-[24px] shrink-0 items-center justify-center rounded-[6px] border transition-colors",
          error
            ? "border-[#e7000b] bg-[rgba(231,0,11,0.05)]"
            : checked
              ? "border-[#155dfc] bg-[#155dfc]"
              : "border-white/30 bg-white/8",
        ].join(" ")}
        data-node-id={boxNodeId}
        data-name="box"
      >
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => toggle(e.target.checked)}
        />
        {checked ? (
          <img
            alt=""
            className="absolute block inset-0 max-w-none size-full p-[2px]"
            src={checkIcon}
            draggable={false}
          />
        ) : null}
      </span>
      {typeof label === "string" ? (
        <span
          className={[
            "font-medium leading-6 tracking-[0.2px] text-white/90",
            labelClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          data-node-id={labelNodeId}
          data-name="label"
        >
          {label}
        </span>
      ) : (
        label
      )}
    </label>
  );
}

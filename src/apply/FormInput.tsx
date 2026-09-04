import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { applyPhoneInputChange, formatPhoneDigits, validatePhone } from "./validation";

export type FormInputHandle = {
  /** Run validation, show error if any. Returns true when valid. */
  validate: () => boolean;
  focus: () => void;
  getValue: () => string;
};

export type FormInputProps = {
  placeholder: string;
  name?: string;
  type?: string;
  /** Built-in phone mask + RU mobile validation */
  mode?: "text" | "phone";
  /** Figma node id on the outer pill */
  nodeId?: string;
  /** desktop uses p-[21px], mobile p-[16px] */
  padding?: "desktop" | "mobile";
  className?: string;
  defaultValue?: string;
  error?: boolean;
  onErrorChange?: (error: boolean) => void;
  /** Validate on blur / submit; return error message or null */
  validate?: (value: string) => string | null;
};

/**
 * Figma Input 370:661 states:
 * Default — bg white/8%, placeholder #c4c6cc
 * Selected — + white border, caret
 * Filed — value text white
 * Error — bg rgba(231,0,11,0.05), border #e7000b, value white
 */
const FormInput = forwardRef<FormInputHandle, FormInputProps>(
  function FormInput(
    {
      placeholder,
      name,
      type = "text",
      mode = "text",
      nodeId,
      padding = "desktop",
      className = "",
      defaultValue = "",
      error: errorProp,
      onErrorChange,
      validate: validateProp,
    },
    ref,
  ) {
    const id = useId();
    const [value, setValue] = useState(defaultValue);
    const [focused, setFocused] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const phoneDigitsRef = useRef("");

    const runValidate = validateProp ?? (mode === "phone" ? validatePhone : undefined);

    const isError = errorProp ?? Boolean(errorMessage);
    const state = isError
      ? "Error"
      : focused
        ? "Selected"
        : value
          ? "Filed"
          : "Default";

    const applyError = (msg: string | null) => {
      setErrorMessage(msg);
      onErrorChange?.(Boolean(msg));
      return msg === null;
    };

    useImperativeHandle(ref, () => ({
      validate: () => {
        if (!runValidate) return applyError(null);
        return applyError(runValidate(value));
      },
      focus: () => inputRef.current?.focus(),
      getValue: () => value,
    }));

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
      let next = e.target.value;

      if (mode === "phone") {
        const prev = phoneDigitsRef.current;
        const nextDigits = applyPhoneInputChange(prev, e.target.value);
        phoneDigitsRef.current = nextDigits;
        next = formatPhoneDigits(nextDigits);
      }

      setValue(next);
      if (errorMessage && runValidate) {
        applyError(runValidate(next));
      } else if (errorMessage && next.trim()) {
        applyError(null);
      }
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (mode !== "phone" || e.key !== "Backspace") return;

      const input = e.currentTarget;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      if (start !== end) return;

      const prev = phoneDigitsRef.current;
      if (!prev) return;

      const charBefore = value[start - 1];
      if (charBefore && /\D/.test(charBefore)) {
        e.preventDefault();
        const nextDigits = prev.slice(0, -1);
        phoneDigitsRef.current = nextDigits === "7" ? "" : nextDigits;
        const next = formatPhoneDigits(phoneDigitsRef.current);
        setValue(next);
        if (errorMessage && runValidate) {
          applyError(runValidate(next));
        }
      }
    };

    const onFocus = () => {
      setFocused(true);
    };

    const onBlur = (e: FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      let next = e.target.value;
      if (mode === "phone") {
        const digits = next.replace(/\D/g, "");
        if (!digits || digits === "7") {
          next = "";
          phoneDigitsRef.current = "";
          setValue("");
        }
      }
      if (!runValidate) return;
      applyError(runValidate(next));
    };

    return (
      <div
        className={["flex flex-col gap-[6px] w-full", className]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            "form-input-shell content-stretch flex items-center relative rounded-[333px] w-full",
            padding === "mobile" ? "p-[16px]" : "p-[21px]",
          ].join(" ")}
          data-node-id={nodeId}
          data-name="Input"
          data-state={state}
        >
          <input
            ref={inputRef}
            id={id}
            name={name}
            type={mode === "phone" ? "tel" : type}
            inputMode={mode === "phone" ? "tel" : undefined}
            autoComplete={mode === "phone" ? "tel" : name === "name" ? "name" : "url"}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-invalid={isError || undefined}
            aria-describedby={errorMessage ? `${id}-error` : undefined}
            className="form-input w-full min-w-0 bg-transparent border-0 outline-none text-[20px] leading-6 tracking-[0.2px] font-medium text-white caret-white"
          />
        </div>
        {errorMessage ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="px-[16px] text-[14px] leading-5 tracking-[0.2px] text-[#e7000b]"
          >
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  },
);

export default FormInput;

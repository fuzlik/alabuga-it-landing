import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { RESUME_MAX_FILES } from "../../shared/resume";
import { validateResumeFiles } from "./validation";

export type FormFileUploadHandle = {
  validate: () => boolean;
  focus: () => void;
  getFiles: () => File[];
};

export type FormFileUploadProps = {
  placeholder?: string;
  name?: string;
  nodeId?: string;
  padding?: "desktop" | "mobile";
  className?: string;
  accept?: string;
};

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function mergeFiles(existing: File[], incoming: FileList | File[]): File[] {
  const map = new Map<string, File>();
  for (const file of existing) map.set(fileKey(file), file);
  for (const file of Array.from(incoming)) map.set(fileKey(file), file);
  return Array.from(map.values()).slice(0, RESUME_MAX_FILES);
}

function formatFilesLabel(files: File[], placeholder: string): string {
  if (files.length === 0) return placeholder;
  if (files.length === 1) return files[0].name;

  const joined = files.map((file) => file.name).join(", ");
  if (joined.length <= 72) return joined;

  return `${files.length} файла: ${files[0].name}, …`;
}

const FormFileUpload = forwardRef<FormFileUploadHandle, FormFileUploadProps>(
  function FormFileUpload(
    {
      placeholder = "Прикрепите резюме",
      name = "resume",
      nodeId,
      padding = "desktop",
      className = "",
      accept = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const filesRef = useRef<File[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [focused, setFocused] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const applyError = (msg: string | null) => {
      setErrorMessage(msg);
      return msg === null;
    };

    const commitFiles = (next: File[]) => {
      filesRef.current = next;
      setFiles(next);
      applyError(validateResumeFiles(next));
    };

    const setSelectedFiles = (incoming: FileList | File[]) => {
      commitFiles(mergeFiles(filesRef.current, incoming));
    };

    const removeFile = (index: number) => {
      commitFiles(filesRef.current.filter((_, i) => i !== index));
    };

    const clearFiles = () => {
      commitFiles([]);
      if (inputRef.current) inputRef.current.value = "";
    };

    useImperativeHandle(ref, () => ({
      validate: () => applyError(validateResumeFiles(filesRef.current)),
      focus: () => inputRef.current?.focus(),
      getFiles: () => filesRef.current,
    }));

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
      const picked = e.target.files;
      if (!picked?.length) return;
      setSelectedFiles(picked);
      e.target.value = "";
    };

    const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(true);
    };

    const onDragLeave = (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
    };

    const onDrop = (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (!e.dataTransfer.files.length) return;
      setSelectedFiles(e.dataTransfer.files);
    };

    const state = errorMessage
      ? "Error"
      : dragOver
        ? "Dragging"
        : focused
          ? "Selected"
          : files.length > 0
            ? "Filed"
            : "Default";

    return (
      <div
        className={["flex flex-col gap-[6px] w-full", className].filter(Boolean).join(" ")}
      >
        <label
          className={[
            "form-input-shell form-file-upload relative block rounded-[333px] w-full cursor-pointer",
            padding === "mobile" ? "p-[16px]" : "p-[21px]",
          ].join(" ")}
          data-node-id={nodeId}
          data-name="Input"
          data-state={state}
          aria-invalid={errorMessage ? true : undefined}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            name={name}
            type="file"
            accept={accept}
            multiple
            tabIndex={0}
            aria-label={placeholder}
            className={[
              "form-file-upload-input",
              files.length > 0 ? "form-file-upload-input--has-file" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <span
            className={[
              "form-file-upload-label flex items-center justify-between gap-[12px] min-w-0 text-[20px] leading-6 tracking-[0.2px] font-medium",
              files.length > 0 ? "text-white" : "text-[#c4c6cc]",
            ].join(" ")}
          >
            <span className="min-w-0 truncate">
              {formatFilesLabel(files, placeholder)}
            </span>
            {files.length === 1 ? (
              <button
                type="button"
                className="form-file-upload-clear shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearFiles();
                }}
                aria-label={`Удалить ${files[0].name}`}
              >
                ×
              </button>
            ) : null}
          </span>
        </label>
        {files.length > 1 ? (
          <ul className="flex flex-col gap-[4px] px-[16px]">
            {files.map((file, index) => (
              <li
                key={fileKey(file)}
                className="flex items-center justify-between gap-[12px] text-[14px] leading-5 tracking-[0.2px] text-[#aaabb8]"
              >
                <span className="min-w-0 truncate">{file.name}</span>
                <button
                  type="button"
                  className="shrink-0 text-[#aaabb8] hover:text-white"
                  onClick={() => removeFile(index)}
                  aria-label={`Удалить ${file.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {errorMessage ? (
          <p
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

export default FormFileUpload;

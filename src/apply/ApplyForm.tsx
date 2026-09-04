import { useRef, useState } from "react";
import { submitApplication } from "./api";
import FormInput, { type FormInputHandle } from "./FormInput";
import FormFileUpload, { type FormFileUploadHandle } from "./FormFileUpload";
import FormCheckbox from "./FormCheckbox";
import PrivacyPolicyLink from "../ui/PrivacyPolicyLink";
import { validateName, validatePortfolio } from "./validation";

type ApplyFormProps = {
  padding: "desktop" | "mobile";
  fieldsNodeId: string;
  fieldsClassName: string;
  nameNodeId: string;
  phoneNodeId: string;
  portfolioNodeId: string;
  resumeNodeId?: string;
  checkboxNodeId: string;
  checkboxBoxNodeId: string;
  checkboxLabelNodeId: string;
  checkboxClassName?: string;
  checkboxLabelClassName?: string;
  submitClassName: string;
};

export default function ApplyForm({
  padding,
  fieldsNodeId,
  fieldsClassName,
  nameNodeId,
  phoneNodeId,
  portfolioNodeId,
  resumeNodeId,
  checkboxNodeId,
  checkboxBoxNodeId,
  checkboxLabelNodeId,
  checkboxClassName = "w-full",
  checkboxLabelClassName = "",
  submitClassName,
}: ApplyFormProps) {
  const nameRef = useRef<FormInputHandle>(null);
  const phoneRef = useRef<FormInputHandle>(null);
  const portfolioRef = useRef<FormInputHandle>(null);
  const resumeRef = useRef<FormFileUploadHandle>(null);
  const [privacyOk, setPrivacyOk] = useState(true);
  const [privacyError, setPrivacyError] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async () => {
    setSent(false);
    setSubmitError(null);

    const nameOk = nameRef.current?.validate() ?? false;
    const phoneOk = phoneRef.current?.validate() ?? false;
    const portfolioOk = portfolioRef.current?.validate() ?? false;
    const resumeOk = resumeRef.current?.validate() ?? false;
    const privacy = privacyOk;
    setPrivacyError(!privacy);

    if (!nameOk) {
      nameRef.current?.focus();
      return;
    }
    if (!phoneOk) {
      phoneRef.current?.focus();
      return;
    }
    if (!portfolioOk) {
      portfolioRef.current?.focus();
      return;
    }
    if (!resumeOk) {
      resumeRef.current?.focus();
      return;
    }
    if (!privacy) return;

    const resumes = resumeRef.current?.getFiles() ?? [];
    if (resumes.length === 0) return;

    setSubmitting(true);
    try {
      await submitApplication({
        name: nameRef.current?.getValue() ?? "",
        phone: phoneRef.current?.getValue() ?? "",
        portfolio: portfolioRef.current?.getValue() ?? "",
        resumes,
        source: padding === "mobile" ? "mobile" : "desktop",
      });
      setSent(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Не удалось отправить заявку");
    } finally {
      setSubmitting(false);
    }
  };

  const buttonLabel = submitting
    ? "Отправка..."
    : sent
      ? "Заявка отправлена"
      : "Подать заявку";

  return (
    <>
      <div
        className={fieldsClassName}
        data-node-id={fieldsNodeId}
        data-name="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full"
      >
        <FormInput
          ref={nameRef}
          nodeId={nameNodeId}
          name="name"
          padding={padding}
          placeholder="Введите ваше имя"
          className="shrink-0"
          validate={validateName}
        />
        <FormInput
          ref={phoneRef}
          nodeId={phoneNodeId}
          name="phone"
          mode="phone"
          padding={padding}
          placeholder="Введите номер телефона"
          className="shrink-0"
        />
        <FormInput
          ref={portfolioRef}
          nodeId={portfolioNodeId}
          name="portfolio"
          type="url"
          padding={padding}
          placeholder="Вставьте ссылку на портфолио"
          className="shrink-0"
          validate={validatePortfolio}
        />
        <FormFileUpload
          ref={resumeRef}
          nodeId={resumeNodeId}
          padding={padding}
          placeholder="Прикрепите резюме (PDF, DOC, DOCX, до 5 файлов)"
          className="shrink-0"
        />
        <div className="flex w-full flex-col gap-[6px]">
          <FormCheckbox
            nodeId={checkboxNodeId}
            boxNodeId={checkboxBoxNodeId}
            labelNodeId={checkboxLabelNodeId}
            className={checkboxClassName}
            labelClassName={checkboxLabelClassName}
            label={
              <PrivacyPolicyLink
                nodeId={checkboxLabelNodeId}
                inCheckboxLabel
                className={[
                  "font-medium leading-6 tracking-[0.2px] text-white/90 underline decoration-white/35 underline-offset-[3px] hover:decoration-white/80",
                  checkboxLabelClassName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                Политика конфиденциальности
              </PrivacyPolicyLink>
            }
            defaultChecked
            onCheckedChange={(checked) => {
              setPrivacyOk(checked);
              if (checked) setPrivacyError(false);
            }}
            error={privacyError}
          />
          {privacyError ? (
            <p
              role="alert"
              className="px-[16px] text-[14px] leading-5 tracking-[0.2px] text-[#e7000b]"
            >
              Нужно согласие с политикой конфиденциальности
            </p>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        className={submitClassName}
        onClick={onSubmit}
        disabled={submitting || sent}
        aria-busy={submitting}
      >
        {buttonLabel}
      </button>
      {submitError ? (
        <p
          role="alert"
          className="mt-[12px] text-[14px] leading-5 tracking-[0.2px] text-[#e7000b]"
        >
          {submitError}
        </p>
      ) : null}
    </>
  );
}

import { APPLY_FORM_URL } from "../config/applyFormUrl";

type ApplyFormProps = {
  padding: "desktop" | "mobile";
};

export default function ApplyForm({ padding }: ApplyFormProps) {
  const isMobile = padding === "mobile";

  return (
    <div
      className={
        isMobile
          ? "flex w-full flex-col items-start justify-between gap-[20px] bg-[#005dff] p-[14px]"
          : "flex w-full items-center justify-between gap-[40px] bg-[#005dff] px-[35px] py-[28px]"
      }
      data-name="card"
      data-apply-banner
    >
      <p
        className={
          isMobile
            ? "[word-break:break-word] font-bounded-bold text-[28px] leading-[1.25] text-white w-full"
            : "[word-break:break-word] font-bounded-bold text-[32px] leading-[1.25] text-white max-w-[920px]"
        }
      >
        Заполните данные и отправьте заявку на рассмотрение
      </p>
      <a
        href={APPLY_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={
          isMobile
            ? "inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-white/95 px-5 text-[20px] font-medium leading-6 tracking-[0.2px] text-[#155dfc] whitespace-nowrap"
            : "inline-flex h-12 shrink-0 items-center justify-center rounded-[14px] bg-white/95 px-5 text-[20px] font-medium leading-6 tracking-[0.2px] text-[#155dfc] whitespace-nowrap"
        }
      >
        Заполнить заявку
      </a>
    </div>
  );
}

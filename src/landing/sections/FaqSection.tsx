import { useState, type ReactNode } from "react";

const imgCard = "/assets/faq/card.png";
const imgCardAccent = "/assets/faq/card-accent.png";
const imgLucidPlus = "/assets/icons/plus.svg";

type FaqItem = {
  id: string;
  question: ReactNode;
  answer: string;
  accent?: boolean;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "travel",
    question: (
      <>
        <span className="leading-[1.25]">Вы </span>
        <span className="leading-[1.25] lowercase">оплачиваете дорогу до </span>
        <span className="leading-[1.25]">Елабуги</span>
        <span className="leading-[1.25] lowercase">?</span>
      </>
    ),
    answer:
      "Компенсация проезда не предусмотрена — кандидаты добираются до места проведения этапа самостоятельно. При этом для участников будет организован транспорт туда и обратно по маршрутам до Казани и Набережных Челнов.",
  },
  {
    id: "salary",
    question: (
      <>
        <span className="leading-[1.25]">Правда </span>
        <span className="leading-[1.25] lowercase">
          ли, что у вас такие высокие зарплаты?
        </span>
      </>
    ),
    answer:
      "Уровень дохода зависит от направления, опыта и роли. После успешного прохождения программы и предложения о работе условия обсуждаются индивидуально с учётом вашей квалификации.",
  },
  {
    id: "offer",
    question: (
      <>
        <span className="leading-[1.25]">Сколько </span>
        <span className="leading-[1.25] lowercase">
          ждать оффер после программы?
        </span>
      </>
    ),
    answer:
      "Итоговую оценку подводим в конце программы. Участники, успешно прошедшие все этапы, получают приглашение в команду в течение 7 дней после завершения.",
  },
  {
    id: "simulation",
    accent: true,
    question: (
      <>
        <span className="leading-[1.25]">Что</span>
        <span className="leading-[1.25] lowercase">
          {" "}
          такое Бизнес-симуляция?
        </span>
      </>
    ),
    answer:
      "Бизнес-симуляция — это практический формат работы над задачами, близкими к реальным проектам отдела Стратегического развития. Вы решаете кейсы, получаете обратную связь от лидов и показываете навыки в деле.",
  },
  {
    id: "documents",
    question: (
      <>
        <span className="leading-[1.25]">Нужно </span>
        <span className="leading-[1.25] lowercase">
          ли брать с собой документы?
        </span>
      </>
    ),
    answer:
      "На очный этап возьмите паспорт. Если понадобятся дополнительные документы, мы заранее перечислим их в письме с подтверждением участия.",
  },
];

type FaqSectionProps = {
  variant: "mobile" | "desktop";
};

export default function FaqSection({ variant }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const mobile = variant === "mobile";
  const qSize = mobile ? "text-[21px]" : "text-[28px]";

  return (
    <div
      className={
        mobile
          ? "content-stretch flex flex-col gap-[28px] items-start relative shrink-0 w-[375px]"
          : "content-stretch flex flex-col gap-[60px] items-start relative shrink-0 w-full"
      }
      data-node-id={mobile ? "417:972" : "417:639"}
      data-name="block"
    >
      <div
        className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full"
        data-node-id={mobile ? "417:973" : "417:640"}
        data-name="head"
      >
        <p
          className={
            mobile
              ? "[word-break:break-word] font-bounded-medium leading-[16px] not-italic relative shrink-0 text-[#f1f1f1] text-[21px] tracking-[-0.21px] uppercase w-[945px]"
              : "[word-break:break-word] font-bounded-medium leading-[60px] not-italic relative shrink-0 text-[#f1f1f1] text-[36px] tracking-[-0.36px] uppercase w-[945px]"
          }
          data-node-id={mobile ? "417:974" : "417:641"}
        >
          частые вопросы
        </p>
      </div>
      <div
        className={
          mobile
            ? "content-stretch flex flex-col gap-[8px] items-end relative shrink-0 w-full"
            : "content-stretch flex flex-col gap-[21px] items-end relative shrink-0 w-full"
        }
        data-node-id={mobile ? "417:975" : "417:642"}
      >
        {FAQ_ITEMS.map((item) => {
          const open = openId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
              className={
                mobile
                  ? `content-stretch flex flex-col items-stretch p-[21px] relative rounded-[12px] shrink-0 w-full text-left cursor-pointer overflow-hidden ${
                      open ? "gap-[12px]" : "min-h-[84px] gap-0 justify-center"
                    }`
                  : `content-stretch flex flex-col items-stretch p-[30px] relative rounded-[12px] shrink-0 w-full text-left cursor-pointer overflow-hidden ${
                      open ? "gap-[16px]" : "min-h-[96px] gap-0 justify-center"
                    }`
              }
              data-name="FaqCard"
            >
              <img
                alt=""
                className="absolute inset-0 z-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full"
                src={item.accent && mobile ? imgCardAccent : imgCard}
              />
              <div className="relative z-[1] flex w-full shrink-0 items-center justify-between gap-[12px]">
                <p
                  className={`[word-break:break-word] capitalize flex-[1_0_0] font-muller-medium leading-[1.25] min-w-px not-italic relative text-white ${qSize}`}
                >
                  {item.question}
                </p>
                <div
                  className={
                    mobile
                      ? "relative shrink-0 size-[24px] transition-transform duration-200"
                      : "relative shrink-0 size-[32px] transition-transform duration-200"
                  }
                  style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
                  data-name="Lucid/plus"
                >
                  <img
                    alt=""
                    className="absolute block inset-0 max-w-none size-full"
                    src={imgLucidPlus}
                  />
                </div>
              </div>
              {open ? (
                <p
                  className={
                    mobile
                      ? "relative z-[1] font-bounded-regular leading-[1.4] not-italic text-[#cfcfcf] text-[14px] pt-[4px]"
                      : "relative z-[1] font-bounded-regular leading-[1.4] not-italic text-[#cfcfcf] text-[18px] pt-[4px] text-left"
                  }
                >
                  {item.answer}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

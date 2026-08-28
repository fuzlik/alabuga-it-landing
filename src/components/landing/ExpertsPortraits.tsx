const EXPERTS = [
  {
    name: "Екатерина Толстикова",
    role: "Ведущий специалист",
    photo: "/assets/photos/ekaterina-tolstikova.png",
    flip: false,
  },
  {
    name: "Ярослав Патрикеев",
    role: "Специалист",
    photo: "/assets/photos/yaroslav-patrikeev.png",
    flip: true,
  },
] as const;

type ExpertsPortraitsProps = {
  variant?: "desktop" | "mobile";
};

export default function ExpertsPortraits({
  variant = "desktop",
}: ExpertsPortraitsProps) {
  const isMobile = variant === "mobile";

  return (
    <section
      className={
        isMobile
          ? "flex w-full flex-col gap-[32px] items-start relative shrink-0"
          : "flex w-full flex-col gap-[56px] items-start relative shrink-0"
      }
      data-node-id={isMobile ? "417:912" : "535:198"}
      data-name="block"
    >
      <p
        className={
          isMobile
            ? "[word-break:break-word] font-bounded-medium leading-[28px] not-italic relative shrink-0 text-[21px] tracking-[-0.21px] uppercase w-full"
            : "[word-break:break-word] font-bounded-medium leading-[60px] not-italic relative shrink-0 text-[#f1f1f1] text-[36px] tracking-[-0.36px] uppercase w-full"
        }
        data-node-id={isMobile ? "417:913" : "535:200"}
      >
        <span className={isMobile ? "leading-[28px] text-[#f1f1f1]" : "leading-[60px]"}>
          {`Познакомьтесь с командой, `}
        </span>
        <span
          className={
            isMobile
              ? "leading-[28px] text-[#aaabb8]"
              : "leading-[60px] text-[#aaabb8]"
          }
        >
          которая ведёт кадровую программу
        </span>
      </p>

      <div className="flex w-full flex-col" data-node-id={isMobile ? "417:916" : "535:201"}>
        {EXPERTS.map((expert, index) => (
          <article
            key={expert.name}
            className={`flex w-full items-center justify-between ${
              isMobile ? "gap-[16px] py-[24px]" : "gap-[80px] py-[48px]"
            } ${index === 0 ? "border-b border-solid border-[#23232f]" : ""} ${
              expert.flip ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`relative shrink-0 overflow-hidden rounded-full ${
                isMobile ? "size-[160px]" : "size-[440px]"
              }`}
            >
              <img
                alt={expert.name}
                src={expert.photo}
                className="size-full object-cover object-[center_18%]"
                draggable={false}
              />
            </div>
            <div
              className={`flex min-w-0 flex-1 flex-col ${
                isMobile ? "gap-[8px]" : "gap-[16px]"
              } ${expert.flip ? "items-end text-right" : "items-start text-left"}`}
            >
              <p
                className={
                  isMobile
                    ? "font-bounded-bold text-[18px] leading-[1.2] text-white"
                    : "font-bounded-bold text-[40px] leading-[1.15] text-white"
                }
              >
                {expert.name}
              </p>
              <p
                className={
                  isMobile
                    ? "font-bounded-regular text-[14px] leading-[1.3] text-[#aaabb8]"
                    : "font-bounded-regular text-[21px] leading-[1.3] text-[#aaabb8]"
                }
              >
                {expert.role}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

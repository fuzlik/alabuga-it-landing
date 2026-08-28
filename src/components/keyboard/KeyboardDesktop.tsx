import type { ReactNode } from "react";

const imgKbEsc = "/assets/keyboard/esc.svg";
const imgKbKeyD = "/assets/keyboard/key-d.svg";
const imgKbKeyE = "/assets/keyboard/key-e.svg";
const imgKbKeyF = "/assets/keyboard/key-f.svg";
const imgKbIconPen = "/assets/keyboard/icon-pen.svg";
const imgKbKeyG = "/assets/keyboard/key-g.svg";
const imgKbKeyH = "/assets/keyboard/key-h.svg";
const imgKbKeyTab = "/assets/keyboard/key-tab.svg";
const imgKbIconScroll = "/assets/keyboard/icon-scroll.svg";
const imgKbCtaBg = "/assets/keyboard/cta-bg.svg";
const imgKbIconArrow = "/assets/keyboard/icon-arrow.svg";
const imgKbCtaArrow = "/assets/keyboard/cta-arrow.svg";
const imgKbIconChart = "/assets/keyboard/icon-chart.svg";
const imgKbIconUserPlus = "/assets/keyboard/icon-user-plus.svg";
const imgKbKeyZh = "/assets/keyboard/key-zh.svg";
const imgKbKeyE2 = "/assets/keyboard/key-e2.svg";
const imgKbIconCalendar = "/assets/keyboard/icon-calendar.svg";
const imgKbKeyShift = "/assets/keyboard/key-shift.svg";
const imgKbKeyZ = "/assets/keyboard/key-z.svg";
const imgKbKeyX = "/assets/keyboard/key-x.svg";
const imgKbKeyC = "/assets/keyboard/key-c.svg";
const imgKbIconSquare = "/assets/keyboard/icon-square.svg";

function KeyGlass({
  children,
  className = "",
  nodeId,
}: {
  children: ReactNode;
  className?: string;
  nodeId?: string;
}) {
  return (
    <div
      className={`relative rounded-[16px] shrink-0 ${className}`}
      data-kb-key
      data-node-id={nodeId}
    >
      <div
        aria-hidden
        className="absolute bg-gradient-to-b from-[rgba(136,136,136,0.05)] inset-0 pointer-events-none rounded-[16px] to-[rgba(51,51,51,0.05)]"
      />
      {children}
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_1px_0px_rgba(255,255,255,0.25)]" />
    </div>
  );
}

function KeyImg({ src, w, h }: { src: string; w: number; h: number }) {
  return (
    <div className="relative shrink-0" style={{ width: w, height: h }}>
      <img alt="" className="absolute inset-0 max-w-none size-full" src={src} />
    </div>
  );
}

function KbRow({ children }: { children: ReactNode }) {
  return (
    <div className="content-stretch flex gap-[18px] items-center relative shrink-0 w-full">
      {children}
    </div>
  );
}

function RowFill() {
  return <div aria-hidden className="flex-1 min-w-[18px] shrink" />;
}

function FKey({ label, nodeId }: { label: string; nodeId: string }) {
  return (
    <div
      className="bg-gradient-to-b border border-[rgba(25,25,25,0)] border-solid content-stretch flex flex-col from-[1.442%] from-[rgba(51,51,51,0)] h-[62px] items-start pb-[18px] pl-[58px] pr-[21px] pt-[31px] relative rounded-[16px] shrink-0 to-[98.077%] to-[rgba(39,39,39,0.05)] w-[90px]"
      data-kb-key
      data-node-id={nodeId}
    >
      <p className="font-source-medium leading-none relative shrink-0 text-[#292929] text-[20px] text-center whitespace-nowrap">
        {label}
      </p>
    </div>
  );
}

function SolidKey({
  children,
  nodeId,
  className = "size-[116px] items-center justify-center px-[47px] py-[24px]",
}: {
  children: ReactNode;
  nodeId: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-b border border-[#1a1a1a] border-solid content-stretch flex from-[0.481%] from-[rgba(51,51,51,0.05)] relative rounded-[16px] shrink-0 to-[98.077%] to-[rgba(0,0,0,0.05)] ${className}`}
      data-kb-key
      data-node-id={nodeId}
    >
      {children}
    </div>
  );
}

function SolidLetterKey({ letter, nodeId }: { letter: string; nodeId: string }) {
  return (
    <SolidKey nodeId={nodeId}>
      <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-[21px]">
        <p className="font-source-medium leading-none relative shrink-0 text-[#292929] text-[28px] text-center w-full">
          {letter}
        </p>
      </div>
    </SolidKey>
  );
}

function TallKey({
  children,
  nodeId,
  className = "",
}: {
  children: ReactNode;
  nodeId: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-b border border-[rgba(35,35,35,0)] border-solid content-stretch flex from-[1.923%] from-[rgba(0,0,0,0.05)] h-[116px] items-center justify-center px-[47px] py-[24px] relative rounded-[16px] shrink-0 to-[99.519%] to-[rgba(51,51,51,0.05)] ${className}`}
      data-kb-key
      data-node-id={nodeId}
    >
      {children}
    </div>
  );
}

function DualLabelKey({
  top,
  bottom,
  nodeId,
}: {
  top: string;
  bottom: string;
  nodeId: string;
}) {
  return (
    <TallKey nodeId={nodeId}>
      <div className="content-stretch flex flex-col font-source-medium gap-[40px] items-center justify-center leading-none relative shrink-0 text-[#292929] text-[18px] text-center w-[21px]">
        <p className="relative shrink-0 w-full">{top}</p>
        <p className="relative shrink-0 w-full">{bottom}</p>
      </div>
    </TallKey>
  );
}

function LetterKey({ letter, nodeId }: { letter: string; nodeId: string }) {
  return (
    <TallKey nodeId={nodeId}>
      <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-[21px]">
        <p className="font-source-medium leading-none relative shrink-0 text-[#292929] text-[28px] text-center w-full">
          {letter}
        </p>
      </div>
    </TallKey>
  );
}

function BlankTallKey({
  nodeId,
  className = "w-[115px]",
}: {
  nodeId?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-b border border-[rgba(35,35,35,0)] border-solid from-[1.923%] from-[rgba(0,0,0,0.05)] h-[116px] rounded-[16px] shrink-0 to-[99.519%] to-[rgba(51,51,51,0.05)] ${className}`}
      data-node-id={nodeId}
    />
  );
}

function BlankFKey({
  nodeId,
  className = "w-[90px]",
}: {
  nodeId?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-b border border-[rgba(25,25,25,0)] border-solid from-[1.442%] from-[rgba(51,51,51,0)] h-[62px] rounded-[16px] shrink-0 to-[98.077%] to-[rgba(39,39,39,0.05)] ${className}`}
      data-node-id={nodeId}
    />
  );
}

const HOME_ROW_LETTERS = ["В", "А", "П", "Р", "О", "Л", "Д", "Ж", "Э"] as const;

function CtaKey() {
  return (
    <div
      className="content-stretch flex flex-col gap-[10px] h-[116px] items-start px-[23px] py-[14px] relative shrink-0 w-[292px] cursor-pointer"
      data-name="button"
      data-node-id="286:86"
    >
      <div className="absolute h-[116px] left-0 top-0 w-[292px]" data-name="Union">
        <img alt="" className="absolute inset-0 max-w-none size-full" src={imgKbCtaBg} />
      </div>
      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-none place-items-start relative shrink-0">
        <p
          className="col-1 font-source-medium leading-none ml-0 mt-0 relative row-1 text-[#d8ecff] text-[21px] w-[152px]"
          data-node-id="286:90"
        >
          Резюме. Обязательно
        </p>
        <p
          className="col-1 font-bounded-medium leading-none ml-0 mt-[60px] not-italic relative row-1 text-[21px] text-white whitespace-nowrap"
          data-node-id="286:91"
        >
          Подать заявку
        </p>
        <div className="col-1 flex items-center justify-center ml-[203px] mt-[57px] relative row-1 size-[28px]">
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="overflow-clip relative size-[28px]" data-name="Lucid/arrow-right">
              <img alt="" className="absolute inset-0 max-w-none size-full" src={imgKbIconArrow} />
            </div>
          </div>
        </div>
        <div className="col-1 h-[14px] ml-[216px] mt-[57px] relative row-1 w-[28px]">
          <img alt="" className="block max-w-none size-full" src={imgKbCtaArrow} />
        </div>
      </div>
    </div>
  );
}

export default function KeyboardDesktop() {
  return (
    <div
      className="h-[747px] relative shrink-0 w-full"
      data-node-id="417:1114"
      data-name="img"
    >
      <div
        className="content-stretch flex flex-col gap-[18px] items-start relative rounded-[12px] w-full"
        data-node-id="284:66"
        data-name="клавиатура"
        data-keyboard-interactive
      >
        {/* Row 1 — Esc + F-keys */}
        <KbRow>
          <div className="h-[62px] relative shrink-0 w-[167px]" data-kb-key data-node-id="284:68">
            <img alt="" className="absolute inset-0 max-w-none size-full" src={imgKbEsc} />
          </div>
          <BlankFKey nodeId="284:70" />
          <FKey label="F1" nodeId="284:71" />
          <FKey label="F2" nodeId="284:73" />
          <FKey label="F3" nodeId="284:75" />
          <FKey label="F4" nodeId="284:77" />
          <FKey label="F5" nodeId="284:79" />
          <FKey label="F6" nodeId="284:81" />
          <FKey label="F7" nodeId="284:83" />
          <FKey label="F8" nodeId="284:85" />
          <FKey label="F9" nodeId="284:87" />
          <div
            className="bg-gradient-to-b border border-[rgba(25,25,25,0)] border-solid content-stretch flex flex-col from-[1.442%] from-[rgba(51,51,51,0)] h-[62px] items-start pb-[18px] pl-[58px] pr-[21px] pt-[31px] relative rounded-[16px] shrink-0 to-[98.077%] to-[rgba(39,39,39,0.05)] w-[115px]"
            data-kb-key
            data-node-id="284:89"
          >
            <p className="font-source-medium leading-none relative shrink-0 text-[#292929] text-[20px] text-center whitespace-nowrap">
              F10
            </p>
          </div>
          <FKey label="F11" nodeId="284:90" />
          <FKey label="F12" nodeId="284:91-extra" />
          <RowFill />
          <BlankFKey className="w-[167px]" />
        </KbRow>

        {/* Row 2 — D/E/F + Задачи card */}
        <KbRow>
          <TallKey nodeId="284:92">
            <KeyImg src={imgKbKeyD} w={21} h={67} />
          </TallKey>
          <TallKey nodeId="284:95">
            <KeyImg src={imgKbKeyE} w={21} h={67} />
          </TallKey>
          <TallKey nodeId="284:98">
            <KeyImg src={imgKbKeyF} w={21} h={71} />
          </TallKey>

          <KeyGlass className="content-stretch flex flex-col items-start px-[16px] py-[20px] w-[245px]" nodeId="371:295">
            <div
              className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[219px]"
              data-node-id="371:296"
            >
              <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Lucid/pen">
                <img alt="" className="absolute inset-0 max-w-none size-full" src={imgKbIconPen} />
              </div>
              <p className="font-source-medium leading-none relative shrink-0 text-[18px] text-white w-full">
                <span>Задачи. </span>
                <span className="bg-clip-text bg-gradient-to-r from-[#d6d6d6] text-transparent to-[#616161]">
                  Приближенные к реальной работе
                </span>
              </p>
            </div>
          </KeyGlass>

          <TallKey nodeId="284:104">
            <KeyImg src={imgKbKeyG} w={21} h={71} />
          </TallKey>
          <TallKey nodeId="284:107">
            <KeyImg src={imgKbKeyH} w={21} h={71} />
          </TallKey>
          <DualLabelKey top="," bottom="6" nodeId="284:110" />
          <DualLabelKey top="." bottom="7" nodeId="284:114" />
          <DualLabelKey top="*" bottom="8" nodeId="284:118" />
          <DualLabelKey top="(" bottom="9" nodeId="284:118-extra" />
          <DualLabelKey top=")" bottom="0" nodeId="284:118-extra2" />
          <DualLabelKey top="_" bottom="-" nodeId="284:118-extra3" />
          <RowFill />
          <BlankTallKey className="w-[178px]" />
        </KbRow>

        {/* Row 3 — Tab + Приглашение + letters + CTA at right */}
        <KbRow>
          <div
            className="bg-[rgba(51,51,51,0.05)] border border-[#292929] border-solid content-stretch flex flex-col h-[115px] items-start pb-[15px] pt-[82px] px-[21px] relative rounded-[16px] shrink-0 w-[178px]"
            data-kb-key
            data-node-id="284:123"
          >
            <KeyImg src={imgKbKeyTab} w={27} h={19} />
          </div>

          <KeyGlass className="content-stretch flex flex-col h-[116px] items-start px-[20px] py-[16px]" nodeId="284:127">
            <div
              className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[171px]"
              data-node-id="284:128"
            >
              <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Lucid/scroll-text">
                <img alt="" className="absolute inset-0 max-w-none size-full" src={imgKbIconScroll} />
              </div>
              <p className="font-source-medium leading-none relative shrink-0 text-[18px] text-white w-full">
                <span>Приглашение. </span>
                <span className="bg-clip-text bg-gradient-to-r capitalize from-[#d6d6d6] text-transparent to-[#616161]">
                  на
                </span>
                <span className="bg-clip-text bg-gradient-to-r from-[#d6d6d6] text-transparent to-[#616161]">
                  {" "}
                  трудоустройство
                </span>
              </p>
            </div>
          </KeyGlass>

          <div className="flex flex-1 gap-[18px] items-center justify-between min-w-0">
            {HOME_ROW_LETTERS.map((letter, index) => (
              <LetterKey
                key={letter}
                letter={letter}
                nodeId={
                  index < 2
                    ? index === 0
                      ? "284:135"
                      : "371:324"
                    : `284:135-home-${index}`
                }
              />
            ))}
          </div>

          <CtaKey />
        </KbRow>

        {/* Row 4 — Развитие / X / ж / э / Ч / Длительность */}
        <KbRow>
          <KeyGlass className="content-stretch flex flex-col items-start px-[16px] py-[20px] w-[321px]" nodeId="284:149">
            <div
              className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[285px]"
              data-node-id="284:150"
            >
              <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Lucid/chart-spline">
                <img alt="" className="absolute inset-0 max-w-none size-full" src={imgKbIconChart} />
              </div>
              <p className="font-source-medium leading-none relative shrink-0 text-[18px] text-white w-full">
                <span>Развитие. </span>
                <span className="bg-clip-text bg-gradient-to-r capitalize from-[#d6d6d6] text-transparent to-[#616161]">
                  под
                </span>
                <span className="bg-clip-text bg-gradient-to-r from-[#d6d6d6] text-transparent to-[#616161]">
                  {" "}
                  руководством сильных лидов
                </span>
              </p>
            </div>
          </KeyGlass>

          <SolidKey nodeId="284:172">
            <KeyImg src={imgKbKeyX} w={21} h={89} />
          </SolidKey>

          <TallKey nodeId="284:157">
            <div className="h-[18px] relative shrink-0 w-[27px]" data-node-id="284:158" data-name="ж">
              <div className="absolute inset-[0_4.31%_0_4.29%]">
                <img alt="" className="block max-w-none size-full" src={imgKbKeyZh} />
              </div>
            </div>
          </TallKey>

          <TallKey nodeId="284:159">
            <div className="h-[19px] relative shrink-0 w-[18px]" data-node-id="284:160" data-name="э">
              <div className="absolute inset-[0_0_0_3.06%]">
                <img alt="" className="block max-w-none size-full" src={imgKbKeyE2} />
              </div>
            </div>
          </TallKey>

          <LetterKey letter="Ь" nodeId="284:148-extra" />

          <LetterKey letter="Ч" nodeId="284:148-extra3" />

          <KeyGlass className="border border-[#1a1a1a] border-solid content-stretch flex flex-col h-[116px] items-start px-[16px] py-[16px] w-[180px]" nodeId="285:330">
            <div
              className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[146px]"
              data-node-id="285:331"
            >
              <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Lucid/calendar-days">
                <img alt="" className="absolute inset-0 max-w-none size-full" src={imgKbIconCalendar} />
              </div>
              <p className="font-source-medium leading-none relative shrink-0 text-[18px] text-white w-full">
                <span>Длительность. </span>
                <span className="bg-clip-text bg-gradient-to-r from-[#d6d6d6] text-transparent to-[#616161]">
                  2 дня
                </span>
              </p>
            </div>
          </KeyGlass>

          <RowFill />
          <BlankTallKey className="w-[178px]" />
        </KbRow>

        {/* Row 5 — Shift / Z / Бесплатное / C + Формат + А / П */}
        <KbRow>
          <SolidKey nodeId="284:166" className="h-[116px] items-start px-[47px] py-[24px] w-[149px]">
            <KeyImg src={imgKbKeyShift} w={45} h={39} />
          </SolidKey>

          <SolidKey nodeId="284:169" className="h-[116px] items-start px-[47px] py-[24px] w-[117px]">
            <KeyImg src={imgKbKeyZ} w={21} h={91} />
          </SolidKey>

          <KeyGlass className="border border-[#1a1a1a] border-solid content-stretch flex flex-col h-[116px] items-start px-[16px] py-[16px] w-[250px]" nodeId="284:153">
            <div
              className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[216px]"
              data-node-id="284:154"
            >
              <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Lucid/user-round-plus">
                <img alt="" className="absolute inset-0 max-w-none size-full" src={imgKbIconUserPlus} />
              </div>
              <p className="font-source-medium leading-none relative shrink-0 text-[18px] text-white w-full">
                <span>Бесплатное. </span>
                <span className="bg-clip-text bg-gradient-to-r from-[#d6d6d6] text-transparent to-[#616161]">
                  Участие
                </span>
              </p>
            </div>
          </KeyGlass>

          <SolidKey nodeId="284:175">
            <KeyImg src={imgKbKeyC} w={21} h={73} />
          </SolidKey>

          <SolidLetterKey letter="А" nodeId="371:288" />

          <KeyGlass className="border border-[#1a1a1a] border-solid content-stretch flex flex-col h-[116px] items-start px-[20px] py-[16px] w-[139px]" nodeId="284:178">
            <div
              className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full"
              data-node-id="284:179"
            >
              <div className="overflow-clip relative shrink-0 size-[28px]" data-name="Lucid/square">
                <img alt="" className="absolute inset-0 max-w-none size-full" src={imgKbIconSquare} />
              </div>
              <div className="font-source-medium leading-none relative shrink-0 text-[18px] w-full">
                <p className="leading-none mb-0 text-white">Формат. </p>
                <p className="bg-clip-text bg-gradient-to-r from-[#d6d6d6] leading-none text-transparent to-[#616161]">
                  Онлайн
                </p>
              </div>
            </div>
          </KeyGlass>

          <SolidLetterKey letter="П" nodeId="371:291" />
          <RowFill />
          <BlankTallKey className="w-[292px]" />
        </KbRow>
      </div>
    </div>
  );
}

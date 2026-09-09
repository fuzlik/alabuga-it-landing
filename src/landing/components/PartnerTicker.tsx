import { PARTNERS } from "../content/partners";

type PartnerTickerProps = {
  variant: "desktop" | "mobile";
};

const TRACK = {
  desktop: "417:115",
  mobile: "417:704",
} as const;

const ITEM_IDS = {
  desktop: ["417:116", "417:117", "417:118", "417:119", "417:120", "417:123"],
  mobile: ["417:705", "417:706", "417:706-2", "417:706-3", "417:706-4", "417:707"],
} as const;

function itemClass(index: number, last: number, mobile: boolean) {
  if (index === 0) {
    return "bg-clip-text bg-gradient-to-r from-[rgba(153_153_153_/0)] relative shrink-0 text-[transparent] to-white";
  }
  if (mobile && index === last) {
    return "bg-clip-text bg-gradient-to-r from-white relative shrink-0 text-[transparent] to-[rgba(153_153_153_/0)]";
  }
  return "relative shrink-0 text-white";
}

export default function PartnerTicker({ variant }: PartnerTickerProps) {
  const mobile = variant === "mobile";
  const last = PARTNERS.length - 1;
  const ids = ITEM_IDS[variant];

  return (
    <div
      className={
        mobile
          ? "-translate-x-1/2 [word-break:break-word] absolute content-stretch flex font-bounded-bold gap-[21px] items-center leading-[1.25] left-1/2 not-italic text-[16px] top-[302px] uppercase w-[374px] whitespace-nowrap"
          : "-translate-x-1/2 [word-break:break-word] absolute content-stretch flex font-bounded-bold gap-[51px] items-center leading-[1.25] left-[calc(50%+0.5px)] not-italic text-[24px] top-[877px] uppercase whitespace-nowrap"
      }
      data-node-id={TRACK[variant]}
    >
      {PARTNERS.map((name, index) => (
        <p key={ids[index]} className={itemClass(index, last, mobile)} data-node-id={ids[index]}>
          {name}
        </p>
      ))}
    </div>
  );
}

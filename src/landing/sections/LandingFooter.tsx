import OfficeMapsLink from "../../ui/OfficeMapsLink";
import PrivacyPolicyLink from "../../ui/PrivacyPolicyLink";

type LandingFooterProps = {
  variant: 'desktop' | 'mobile'
}

export default function LandingFooter({ variant }: LandingFooterProps) {
  if (variant === 'mobile') {
    return (
      <footer
        className="landing-footer content-stretch flex w-full flex-col gap-[24px] pt-[40px] relative shrink-0"
        data-name="footer"
      >
        <OfficeMapsLink
          nodeId="417:1009"
          className="[word-break:break-word] font-bounded-medium leading-[1.25] not-italic relative shrink-0 text-[21px] text-white w-full whitespace-pre-wrap hover:underline"
        >{`AO  «ОЭЗ ППТ  «Алабуга»»`}</OfficeMapsLink>
        <div className="content-stretch flex w-full items-start justify-between gap-[24px]">
          <div
            className="[word-break:break-word] content-stretch flex flex-col font-bounded-regular gap-[12px] items-start leading-[1.25] not-italic text-[#aaabb8] text-[12px] relative shrink-0"
            data-node-id="417:1010"
          >
            <PrivacyPolicyLink
              nodeId="417:1012"
              className="[text-underline-position:from-font] decoration-from-font decoration-solid relative shrink-0 underline whitespace-nowrap text-inherit"
            />
            <OfficeMapsLink
              nodeId="417:1013"
              className="[text-underline-position:from-font] decoration-from-font decoration-solid relative shrink-0 underline w-[374px] text-inherit"
            />
          </div>
          <div
            className="[word-break:break-word] content-stretch flex flex-col font-bounded-regular gap-[12px] items-start justify-center leading-[1.25] not-italic text-[#aaabb8] text-[12px] w-[184px] relative shrink-0"
            data-node-id="417:1014"
          >
            <p className="relative shrink-0 w-full" data-node-id="417:1015">
              ИНН 1646019914
            </p>
            <p className="relative shrink-0 w-full" data-node-id="417:1016">
              ОГРН 1061674037259
            </p>
            <p className="relative shrink-0 w-full" data-node-id="417:1017">
              +7 939 745 50 43
            </p>
            <p className="relative shrink-0 w-full" data-node-id="417:1018">
              DSuslov@alabuga.ru
            </p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className="landing-footer -mt-[140px] content-stretch flex w-full flex-col gap-[40px] pt-[40px] pb-[60px] relative shrink-0"
      data-name="footer"
    >
      <div className="content-stretch flex w-full items-start justify-between gap-[40px]">
        <div className="content-stretch flex min-w-0 flex-col gap-[46px] items-start">
          <OfficeMapsLink
            nodeId="417:674"
            className="[word-break:break-word] font-bounded-medium leading-[1.25] not-italic relative shrink-0 text-[28px] text-white whitespace-pre-wrap hover:underline"
          >{`AO  «ОЭЗ ППТ  «Алабуга»»`}</OfficeMapsLink>
        </div>
        <div className="content-stretch flex shrink-0 flex-col gap-[12px] items-end text-right font-bounded-regular leading-[1.25] not-italic text-[#aaabb8] text-[21px]">
          <p className="relative shrink-0 whitespace-nowrap" data-node-id="417:679">
            ИНН 1646019914
          </p>
          <p className="relative shrink-0 whitespace-nowrap" data-node-id="417:680">
            ОГРН 1061674037259
          </p>
          <p className="relative shrink-0 whitespace-nowrap" data-node-id="417:681">
            +7 939 745 50 43
          </p>
          <p className="relative shrink-0 whitespace-nowrap" data-node-id="417:682">
            DSuslov@alabuga.ru
          </p>
        </div>
      </div>
    </footer>
  )
}

export const DESKTOP = { w: 1920, h: 8000 }
export const MOBILE = { w: 390, h: 7000 }
export const MOBILE_BREAKPOINT = 768

export type Viewport = {
  mobile: boolean
  designW: number
  designH: number
  scale: number
  viewW: number
}

export function measureViewport(): Viewport {
  const viewW = document.documentElement.clientWidth
  const mobile = viewW < MOBILE_BREAKPOINT
  const designW = mobile ? MOBILE.w : DESKTOP.w
  const designH = mobile ? MOBILE.h : DESKTOP.h
  return {
    mobile,
    designW,
    designH,
    scale: viewW / designW,
    viewW,
  }                                 
}
          
export function contentColumnSelector(mobile: boolean) {
  return mobile ? '[data-node-id="417:721"]' : '[data-node-id="417:138"]'
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import 'lenis/dist/lenis.css'
import Landing from './components/landing/Landing'
import LandingMobile from './components/landing/LandingMobile'
import FormScrollBackButton from './components/form/FormScrollBackButton'
import {
  getElementScrollTop,
  resolveScrollOrigin,
  setScrollOrigin,
} from './lib/formScrollBack'
import { initPageMotion, scrollPageTo } from './lib/pageMotion'

const DESKTOP = { w: 1920, h: 8000 }
const MOBILE = { w: 390, h: 7000 }
const MOBILE_BREAKPOINT = 768

const FORM_DESKTOP = '[data-node-id="417:658"]'
const FORM_MOBILE = '[data-node-id="417:991"]'
const HERO_CTA = '[data-node-id="417:113"], [data-node-id="417:711"]'
const LEAD_MAGNETS_DESKTOP = '[data-node-id="417:152"], [data-node-id="417:294"]'
const LEAD_MAGNETS_MOBILE = '[data-node-id="417:723"], [data-node-id="417:833"]'

type Viewport = {
  mobile: boolean
  designW: number
  designH: number
  scale: number
  viewW: number
}

function measure(): Viewport {
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

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function isApplyCta(el: Element) {
  const text = normalizeText(el.textContent || '')
  return (
    text.includes('подать заявку') ||
    text === 'подать заявку' ||
    (text.includes('подать') && text.includes('заявк'))
  )
}

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [vp, setVp] = useState<Viewport>(() =>
    typeof window !== 'undefined'
      ? measure()
      : {
          mobile: false,
          designW: DESKTOP.w,
          designH: DESKTOP.h,
          scale: 1,
          viewW: DESKTOP.w,
        },
  )
  const [contentH, setContentH] = useState(() =>
    typeof window !== 'undefined' ? measure().designH : DESKTOP.h,
  )

  useLayoutEffect(() => {
    const update = () => setVp(measure())
    update()
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  useLayoutEffect(() => {
    const root = canvasRef.current
    if (!root) return
    const fallback = vp.mobile ? MOBILE.h : DESKTOP.h
    const colSelector = vp.mobile
      ? '[data-node-id="417:721"]'
      : '[data-node-id="417:138"]'

    const sync = () => {
      const landing = root.firstElementChild as HTMLElement | null
      const col = root.querySelector(colSelector) as HTMLElement | null
      if (!landing || !col) {
        setContentH(fallback)
        return
      }

      let h = col.offsetTop + col.offsetHeight + 40

      landing.style.height = `${h}px`
      setContentH(h)
    }

    sync()

    const col = root.querySelector(colSelector)
    const ro = new ResizeObserver(sync)
    if (col) ro.observe(col)
    return () => {
      ro.disconnect()
      const landing = root.firstElementChild as HTMLElement | null
      if (landing) landing.style.height = ''
    }
  }, [vp.mobile])

  useEffect(() => {
    const root = canvasRef.current
    if (!root) return
    const stopMotion = initPageMotion(root)
    return () => stopMotion()
  }, [vp.mobile])

  useEffect(() => {
    const root = canvasRef.current
    if (!root) return

    const formSelector = vp.mobile ? FORM_MOBILE : FORM_DESKTOP

    const scrollToForm = (from?: HTMLElement) => {
      const form = root.querySelector(formSelector) as HTMLElement | null
      if (!form) return
      if (from) {
        setScrollOrigin(resolveScrollOrigin(from, root, vp.mobile))
      }
      const top = getElementScrollTop(form)
      scrollPageTo(top)
    }

    const targets = new Set<HTMLElement>()

    root.querySelectorAll('button').forEach((btn) => {
      if (isApplyCta(btn)) targets.add(btn)
    })

    root.querySelectorAll('[data-name="button"]').forEach((el) => {
      if (isApplyCta(el)) targets.add(el as HTMLElement)
    })

    root.querySelectorAll(HERO_CTA).forEach((el) => {
      targets.add(el as HTMLElement)
    })

    // Text nodes that are the CTA label (e.g. hero) — use closest clickable wrapper
    root.querySelectorAll('p, span, div').forEach((el) => {
      const raw = (el.textContent || '').replace(/\s+/g, ' ').trim()
      if (normalizeText(raw) !== 'подать заявку') return
      if (raw.length > 40) return
      const host =
        (el.closest('button') as HTMLElement | null) ||
        (el.closest('[data-name="button"]') as HTMLElement | null) ||
        (el.closest('[data-node-id="417:113"]') as HTMLElement | null) ||
        (el.closest('[data-node-id="417:711"]') as HTMLElement | null)
      if (host) targets.add(host)
    })

    // Don't scroll when clicking the submit button that already sits on the form
    const form = root.querySelector(formSelector)
    const cleanups: Array<() => void> = []

    targets.forEach((el) => {
      if (form && form.contains(el)) return
      el.style.cursor = 'pointer'
      const onClick = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        scrollToForm(el)
      }
      el.addEventListener('click', onClick)
      cleanups.push(() => el.removeEventListener('click', onClick))
    })

    const leadMagnetSelector = vp.mobile ? LEAD_MAGNETS_MOBILE : LEAD_MAGNETS_DESKTOP
    root.querySelectorAll(leadMagnetSelector).forEach((el) => {
      const banner = el as HTMLElement
      if (form && form.contains(banner)) return
      banner.style.cursor = 'pointer'
      const onBannerClick = (e: Event) => {
        const target = e.target as HTMLElement | null
        if (target?.closest('input, textarea, label, a[href], .form-file-upload')) return
        scrollToForm(banner)
      }
      banner.addEventListener('click', onBannerClick)
      cleanups.push(() => banner.removeEventListener('click', onBannerClick))
    })

    // Experts carousel arrows (desktop + mobile). Capture phase so scaled canvas clicks register.
    // Desktop: 480 card + 32 gap; mobile: 300 card + 12 gap
    const CARD_STEP = vp.mobile ? 312 : 512
    const onCarouselClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return
      const prev = el.closest('[data-experts-prev="true"]')
      const next = el.closest('[data-experts-next="true"]')
      if (!prev && !next) return
      const track = root.querySelector<HTMLElement>('[data-experts-carousel="true"]')
      if (!track) return
      e.preventDefault()
      e.stopPropagation()
      const max = Math.max(0, track.scrollWidth - track.clientWidth)
      if (max <= 0) return
      let target = track.scrollLeft + (prev ? -CARD_STEP : CARD_STEP)
      if (target < 0) target = max
      if (target > max) target = 0
      track.scrollTo({ left: target, behavior: 'smooth' })
    }
    root.addEventListener('click', onCarouselClick, true)
    cleanups.push(() => root.removeEventListener('click', onCarouselClick, true))

    return () => cleanups.forEach((fn) => fn())
  }, [vp.mobile])

  const designH = contentH
  const scaledH = designH * vp.scale

  return (
    <div
      className="page-shell"
      style={{
        width: vp.viewW,
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        className="page-scale-wrap"
        style={{
          width: vp.viewW,
          height: scaledH,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          ref={canvasRef}
          className="page-canvas"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: vp.designW,
            height: designH,
            overflow: 'hidden',
            transform: `scale(${vp.scale})`,
            transformOrigin: '0 0',
          }}
        >
          {vp.mobile ? <LandingMobile /> : <Landing />}
        </div>
        <FormScrollBackButton />
      </div>
    </div>
  )
}

export default App

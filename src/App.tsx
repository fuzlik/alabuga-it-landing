import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import 'lenis/dist/lenis.css'
import ScrollBackButton from './apply/ScrollBackButton'
import { bindLandingInteractions } from './landing/bindInteractions'
import {
  contentColumnSelector,
  DESKTOP,
  measureViewport,
  MOBILE,
  type Viewport,
} from './landing/canvas'
import LandingDesktop from './landing/LandingDesktop'
import LandingMobile from './landing/LandingMobile'
import { initPageMotion } from './landing/motion'

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [vp, setVp] = useState<Viewport>(() =>
    typeof window !== 'undefined'
      ? measureViewport()
      : {
          mobile: false,
          designW: DESKTOP.w,
          designH: DESKTOP.h,
          scale: 1,
          viewW: DESKTOP.w,
        },
  )
  const [contentH, setContentH] = useState(() =>
    typeof window !== 'undefined' ? measureViewport().designH : DESKTOP.h,
  )

  useLayoutEffect(() => {
    const update = () => setVp(measureViewport())
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
    const colSelector = contentColumnSelector(vp.mobile)

    const sync = () => {
      const landing = root.firstElementChild as HTMLElement | null
      const col = root.querySelector(colSelector) as HTMLElement | null
      if (!landing || !col) {
        setContentH(fallback)
        return
      }

      const h = col.offsetTop + col.offsetHeight + 40

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
    return bindLandingInteractions(root, vp.mobile)
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
          {vp.mobile ? <LandingMobile /> : <LandingDesktop />}
        </div>
        <ScrollBackButton />
      </div>
    </div>
  )
}

export default App

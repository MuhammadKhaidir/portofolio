import { createContext, useCallback, useContext, useId, useLayoutEffect, useRef, useEffect } from 'react'

import './ScrollExpand.css'
import idleCharGif from '../../assets/IdleChar.gif'
import walkForwardGif from '../../assets/RightWalkChar.gif'
import walkBackwardGif from '../../assets/LeftWalkChar.gif'

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1)
  return t * t * (3 - 2 * t)
}

// "bleed" diukur dalam kelipatan edgeBlur (stdDeviation), dan mulai
// dipompa masuk begitu easing progress (e) ngelewatin titik ini. 3x
// stdDeviation gaussian blur udah nutup ~99.8% alpha, jadi tepi box
// gak nyisain vignette tipis pas box "seharusnya" udah kebuka penuh.
const BLEED_RAMP_START = 0.82
const BLEED_MULTIPLIER = 3

// gif jalan-ditempat cuma aktif kalau box udah kebuka (hampir) penuh
const WALK_ACTIVE_P = 0.98
// delta raw-scroll (px) minimal biar dianggap "scroll beneran", bukan jitter
const MOVE_EPSILON = 0.6

// progress mentah (0..1) dari ScrollExpand terdekat, dibagikan lewat context
const ScrollExpandContext = createContext(null)

export const useScrollExpandProgress = () => useContext(ScrollExpandContext)

/**
 * Fade murni opacity, nempel ke progress scroll yang sama kayak ScrollExpand
 * di atasnya. Karena baca progress secara live (bukan flag "udah pernah
 * muncul"), animasinya ke-replay terus tiap scroll maju-mundur.
 */
export const Reveal = ({
  as: Tag = 'div',
  from = 0.6,
  to = 0.9,
  children,
  className = '',
  style,
  ...rest
}) => {
  const ref = useRef(null)
  const subscribe = useScrollExpandProgress()

  useEffect(() => {
    if (!subscribe || !ref.current) return undefined
    const el = ref.current
    return subscribe(p => {
      el.style.opacity = `${smoothstep(from, to, p)}`
    })
  }, [subscribe, from, to])

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ opacity: subscribe ? 0 : 1, willChange: 'opacity', ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

const ScrollExpand = ({
  background = '#000',
  title = '',
  scrollHint = '',
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  edgeBlur = 22,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  topOffset = 0,
  enabled = true,
  sideImage = idleCharGif,
  sideImageAlt = 'Khaidir',
  sideImageFrom = 0.45,
  sideImageTo = 0.85,
  walkForwardImage = walkForwardGif,
  walkBackwardImage = walkBackwardGif,
  idleTimeout = 160,
  contentHideFrom = 0,
  contentHideTo = 0.3,
  walkPhrases = [],
  walkPhrasesFrom = 0.35,
  children,
  className = '',
  style,
  ...rest
}) => {
  const rootRef = useRef(null)
  const trackRef = useRef(null)
  const stageRef = useRef(null)
  const frameRef = useRef(null)
  const titleRef = useRef(null)
  const overlayRef = useRef(null)
  const scrimRef = useRef(null)
  const hintRef = useRef(null)
  const sideImageRef = useRef(null)
  const sideImgElRef = useRef(null)
  const maskRectRef = useRef(null)
  const frameSizeRef = useRef({ w: 0, h: 0 })
  const walkPhraseRefs = useRef([])

  // state jalan-ditempat: gak pake React state biar gak ada re-render
  // tiap scroll — semuanya dimutasi langsung via ref & DOM, konsisten
  // sama pendekatan imperative yang dipake di seluruh komponen ini.
  const lastRawRef = useRef(0)
  const directionRef = useRef('forward')
  const currentGifKindRef = useRef('idle')
  const idleTimerRef = useRef(null)

  const uid = useId().replace(/:/g, '')
  const maskId = `se-mask-${uid}`
  const filterId = `se-blur-${uid}`

  const subscribersRef = useRef(new Set())
  const subscribe = useCallback(fn => {
    subscribersRef.current.add(fn)
    return () => subscribersRef.current.delete(fn)
  }, [])

  const propsRef = useRef({})
  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    edgeBlur,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    topOffset,
    enabled,
    sideImage,
    sideImageFrom,
    sideImageTo,
    walkForwardImage,
    walkBackwardImage,
    idleTimeout,
    contentHideFrom,
    contentHideTo,
    walkPhrases,
    walkPhrasesFrom
  }

  const applyProgress = useCallback(({ p, q }) => {
    const frame = frameRef.current
    if (!frame) return
    const c = propsRef.current
    const size = frameSizeRef.current

    const e = smoothstep(0, 1, p)

    const w = c.startWidth + (100 - c.startWidth) * e
    const h = c.startHeight + (100 - c.startHeight) * e
    const ixPct = Math.max(0, (100 - w) / 2)
    const iyPct = Math.max(0, (100 - h) / 2)
    const r = c.startRadius + (c.endRadius - c.startRadius) * e

    if (maskRectRef.current && size.w > 0 && size.h > 0) {
      const ixPx = (ixPct / 100) * size.w
      const iyPx = (iyPct / 100) * size.h

      // "bleed" cuma nyala di ujung animasi (e mendekati 1) — dorong rect
      // sampe melebihi batas frame beneran, biar area yang keblur sama
      // feGaussianBlur gak nyerempet ke dalam dan nyisain vignette pas
      // box "seharusnya" udah kebuka full tanpa sisa kotak sama sekali.
      const bleed = c.edgeBlur * BLEED_MULTIPLIER * smoothstep(BLEED_RAMP_START, 1, e)

      const x = ixPx - bleed
      const y = iyPx - bleed
      const rectW = Math.max(0, size.w - ixPx * 2) + bleed * 2
      const rectH = Math.max(0, size.h - iyPx * 2) + bleed * 2

      const rect = maskRectRef.current
      rect.setAttribute('x', x.toFixed(2))
      rect.setAttribute('y', y.toFixed(2))
      rect.setAttribute('width', rectW.toFixed(2))
      rect.setAttribute('height', rectH.toFixed(2))
      rect.setAttribute('rx', r.toFixed(2))
    }

    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim * e}`

    if (sideImageRef.current) {
      const inAmt = smoothstep(c.sideImageFrom, c.sideImageTo, p)
      sideImageRef.current.style.opacity = `${inAmt}`
      sideImageRef.current.style.transform = `translate3d(${(1 - inAmt) * -24}px, 0, 0)`
    }

    if (titleRef.current) {
      const out = smoothstep(0.4, 0.88, p)
      titleRef.current.style.opacity = `${1 - out}`
      titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.12, p)
      hintRef.current.style.opacity = `${1 - gone}`
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`
    }

    // konten lama (children lewat <Reveal>, dibungkus overlay) ngilang
    // pakai opacity begitu box udah kebuka dan user lanjut scroll (q).
    if (overlayRef.current) {
      const hideAmt = smoothstep(c.contentHideFrom, c.contentHideTo, q)
      overlayRef.current.style.opacity = `${1 - hideAmt}`
    }

    // tulisan baru yang muncul gantian sambil char jalan ditempat — gaya
    // fade in/out via opacity yang sama kayak di Hero, dibagi rata di
    // sisa rentang q (dari walkPhrasesFrom sampai 1). Fase terakhir
    // sengaja gak di-fade-out, biar dia "ikut tenggelam" kebawa scroll
    // pas sticky-nya lepas — sama kayak behavior di Hero.
    const phrases = c.walkPhrases
    const n = phrases.length
    if (n > 0) {
      const zoneStart = c.walkPhrasesFrom
      const zoneLen = Math.max(1e-6, 1 - zoneStart)
      for (let i = 0; i < n; i++) {
        const segStart = zoneStart + (i / n) * zoneLen
        const segEnd = zoneStart + ((i + 1) / n) * zoneLen
        const li = clamp((q - segStart) / Math.max(1e-6, segEnd - segStart), 0, 1)
        const isLast = i === n - 1

        const fadeIn = smoothstep(0, 0.25, li)
        const fadeOut = isLast ? 0 : smoothstep(0.75, 1, li)
        const opacity = clamp(fadeIn - fadeOut, 0, 1)

        const el = walkPhraseRefs.current[i]
        if (el) {
          el.style.opacity = `${opacity}`
          el.style.transform = `translate3d(0, ${(1 - opacity) * 14}px, 0)`
        }
      }
    }

    // overlay-nya sendiri udah gak di-fade di sini buat animasi fade-IN —
    // tiap elemen di dalamnya (lewat <Reveal>) yang atur opacity-nya
    // masing-masing. Fade-OUT-nya (pas udah kebuka) diatur di atas.
    subscribersRef.current.forEach(fn => fn(p))
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    const stage = stageRef.current
    const frame = frameRef.current
    if (!root || !track || !stage || !frame) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let current = { p: 0, q: 0 }
    let target = { p: 0, q: 0 }
    let stageH = 0
    let expandSpan = 1
    let holdSpanPx = 0
    let running = false

    const setGifKind = kind => {
      if (currentGifKindRef.current === kind) return
      currentGifKindRef.current = kind
      const img = sideImgElRef.current
      if (!img) return
      const c = propsRef.current
      img.src = kind === 'forward' ? c.walkForwardImage : kind === 'backward' ? c.walkBackwardImage : c.sideImage
    }

    const measure = () => {
      const c = propsRef.current
      const offset = c.useWindowScroll ? c.topOffset : 0
      stageH = c.useWindowScroll ? window.innerHeight - offset : root.clientHeight
      if (stageH <= 0) return
      stage.style.height = `${stageH}px`
      stage.style.top = `${offset}px`

      const dist = Math.max(0.01, c.scrollDistance)
      const hold = Math.max(0, c.holdDistance)
      track.style.height = `${stageH * (1 + dist + hold)}px`
      expandSpan = stageH * dist
      holdSpanPx = stageH * hold

      const w = root.clientWidth || stageH
      stage.style.setProperty('--se-title-size', `${clamp(w * 0.075, 20, 84)}px`)

      // ukuran real frame (px) buat konversi rect mask, karena mask
      // content-nya userSpaceOnUse (bukan persen)
      frameSizeRef.current = { w: frame.clientWidth || w, h: stageH }
    }

    const readRaw = () => {
      const c = propsRef.current
      if (!c.enabled) return expandSpan + holdSpanPx
      if (c.useWindowScroll) {
        const offset = c.topOffset || 0
        const top = track.getBoundingClientRect().top
        return offset - top
      }
      return root.scrollTop
    }

    const computeTargets = raw => {
      const p = expandSpan > 0 ? clamp(raw / expandSpan, 0, 1) : 1
      const q = holdSpanPx > 0 ? clamp((raw - expandSpan) / holdSpanPx, 0, 1) : (p >= 1 ? 1 : 0)
      return { p, q }
    }

    const tick = () => {
      const c = propsRef.current
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing))
      current.p += (target.p - current.p) * k
      current.q += (target.q - current.q) * k
      const doneP = Math.abs(target.p - current.p) < 0.0004
      const doneQ = Math.abs(target.q - current.q) < 0.0004
      if (doneP) current.p = target.p
      if (doneQ) current.q = target.q
      if (doneP && doneQ) running = false
      applyProgress(current)
      raf = running ? requestAnimationFrame(tick) : 0
    }

    const kick = () => {
      if (running) return
      running = true
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const raw = readRaw()
      const delta = raw - lastRawRef.current
      lastRawRef.current = raw

      const t = computeTargets(raw)
      target.p = t.p
      target.q = t.q

      // gif jalan-ditempat: cuma aktif begitu box udah kebuka (hampir)
      // penuh. Arah gif ngikut arah scroll beneran (raw delta), balik ke
      // idle otomatis kalau scroll berhenti selama `idleTimeout`.
      const openEnough = t.p >= WALK_ACTIVE_P
      if (openEnough && Math.abs(delta) > MOVE_EPSILON) {
        directionRef.current = delta > 0 ? 'forward' : 'backward'
        setGifKind(directionRef.current)
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        idleTimerRef.current = setTimeout(() => setGifKind('idle'), propsRef.current.idleTimeout)
      } else if (!openEnough && currentGifKindRef.current !== 'idle') {
        setGifKind('idle')
      }

      if (propsRef.current.smoothing <= 0 || reduceMotion) {
        current.p = target.p
        current.q = target.q
        applyProgress(current)
        return
      }
      kick()
    }

    const onResize = () => {
      measure()
      const raw = readRaw()
      const t = computeTargets(raw)
      target.p = t.p
      target.q = t.q
      current.p = t.p
      current.q = t.q
      applyProgress(current)
    }

    measure()
    lastRawRef.current = readRaw()
    const t0 = computeTargets(lastRawRef.current)
    target.p = t0.p
    target.q = t0.q
    current.p = t0.p
    current.q = t0.q
    applyProgress(current)

    const scroller = useWindowScroll ? window : root
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    const ro = new ResizeObserver(onResize)
    ro.observe(root)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [applyProgress, useWindowScroll])

  return (
    <ScrollExpandContext.Provider value={subscribe}>
      <div
        ref={rootRef}
        className={`scroll-expand ${useWindowScroll ? '' : 'scroll-expand--scroller'} ${className}`.trim()}
        style={style}
        {...rest}
      >
        <svg aria-hidden="true" focusable="false" className="scroll-expand__mask-defs">
          <defs>
            <filter id={filterId} x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={edgeBlur} />
            </filter>
            <mask
              id={maskId}
              maskUnits="objectBoundingBox"
              maskContentUnits="userSpaceOnUse"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <rect ref={maskRectRef} x="0" y="0" width="0" height="0" rx="0" fill="#fff" filter={`url(#${filterId})`} />
            </mask>
          </defs>
        </svg>

        <div ref={trackRef} className="scroll-expand__track">
          <div ref={stageRef} className="scroll-expand__stage">
            <div
              ref={frameRef}
              className="scroll-expand__frame"
              style={{
                WebkitMaskImage: `url(#${maskId})`,
                maskImage: `url(#${maskId})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat'
              }}
            >
              <div className="scroll-expand__media" style={{ background }} />
              <div ref={scrimRef} className="scroll-expand__scrim" />
              {sideImage ? (
                <div ref={sideImageRef} className="scroll-expand__side-image">
                  <img ref={sideImgElRef} src={sideImage} alt={sideImageAlt} />
                </div>
              ) : null}
              {children ? (
                <div ref={overlayRef} className="scroll-expand__overlay">
                  {children}
                </div>
              ) : null}
              {walkPhrases.map((phrase, i) => (
                <div
                  key={`walk-phrase-${i}`}
                  className="scroll-expand__walk-text"
                  ref={el => (walkPhraseRefs.current[i] = el)}
                >
                  {phrase.split('\n').map((line, li, arr) => (
                    <span key={li}>
                      {line}
                      {li < arr.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            {title ? (
              <div ref={titleRef} className="scroll-expand__title">
                {title}
              </div>
            ) : null}
            {scrollHint ? (
              <div ref={hintRef} className="scroll-expand__hint">
                {scrollHint}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ScrollExpandContext.Provider>
  )
}

export default ScrollExpand
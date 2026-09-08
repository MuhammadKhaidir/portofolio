import { useCallback, useEffect, useRef, useState } from 'react'
import './Hero.css'
import charBgImg from '../../assets/CharBg.png'
import charImg from '../../assets/Char.png'
import khImg from '../../assets/Kh.png'
import walkGif from '../../assets/RightWalkChar.gif'
import idleGif from '../../assets/IdleChar.gif'
import leftHeroImg from '../../assets/LeftHero.png'
import rightHeroImg from '../../assets/RightHero.png'
import rockImg from '../../assets/Rock.png'
import { AshenPress } from "@designcodeio/threeui";


const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1)
  return t * t * (3 - 2 * t)
}

const MASK_FEATHER_MAX = 80 // px — feather maksimum di layar lebar
const MASK_FEATHER_RATIO = 0.12 // di layar sempit, feather = 12% lebar viewport (biar gak kebesaran)

// WIPE_RATIO = porsi raw scroll (0..1) buat wipe vs zona teks.
// Zona teks sekarang dibagi rata ke TEXT_PHASES fase (bukan cuma 1 teks nempel).
// Angka ini ngikutin rasio 220vh wipe : (3 x 140vh teks) = 220 : 420 di CSS.
const WIPE_RATIO = 0.34375
const TEXT_PHASES = 3

// 3 pasang teks yang bergantian muncul di zona teks.
// Fase 1 & 2: fade-in -> hold -> fade-out (gantian normal).
// Fase TERAKHIR: fade-in -> hold doang, GAK di-fade-out — biar dia ikut
// "tenggelam" kebawa scroll bareng stage (bukan ngilang duluan via opacity).
const PHRASES = [
  { left: ['Check', 'Here!'], right: ['Hmm,', "Isn't this cool?"] },
  { left: ["Rome wasn't", 'built in a day.'], right: ['Neither was', 'this portfolio.'] },
  { left: ['Actions speak', 'louder than words.'], right: ["So let's", 'keep scrolling.'] }
]

function Hero() {
  const trackRef = useRef(null)
  const stageRef = useRef(null)
  const heroRef = useRef(null)
  const walkerRef = useRef(null)
  const labelLeftRefs = useRef([])
  const labelRightRefs = useRef([])
  const idleTimerRef = useRef(null)
  const rafRef = useRef(0)
  const progressRef = useRef({ current: 0, target: 0 })
  const featherRef = useRef(MASK_FEATHER_MAX)

  const [isMoving, setIsMoving] = useState(false)

  const paint = useCallback((raw) => {
    const pWipe = clamp(raw / WIPE_RATIO, 0, 1)
    const pText = clamp((raw - WIPE_RATIO) / (1 - WIPE_RATIO), 0, 1)
    const feather = featherRef.current

    if (heroRef.current) {
      const center = pWipe * 100
      const mask = `linear-gradient(to right,
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,0) calc(${center}% - ${feather}px),
        rgba(0,0,0,1) calc(${center}% + ${feather}px),
        rgba(0,0,0,1) 100%)`
      heroRef.current.style.maskImage = mask
      heroRef.current.style.webkitMaskImage = mask
    }

    if (walkerRef.current) {
      const fade = pWipe < 0.05 ? pWipe / 0.05 : pWipe > 0.95 ? (1 - pWipe) / 0.05 : 1
      walkerRef.current.style.left = `${pWipe * 100}%`
      walkerRef.current.style.opacity = `${clamp(fade, 0, 1)}`
    }

    for (let i = 0; i < TEXT_PHASES; i++) {
      const segStart = i / TEXT_PHASES
      const segEnd = (i + 1) / TEXT_PHASES
      const li = clamp((pText - segStart) / (segEnd - segStart), 0, 1)
      const isLast = i === TEXT_PHASES - 1

      const fadeIn = smoothstep(0, 0.25, li)
      // fase terakhir: fadeOut dimatiin (selalu 0) -> opacity gak pernah
      // dipaksa balik ke 0, jadi teksnya "ikut tenggelam" bareng scroll
      // pas sticky-nya lepas, bukan fade ke transparan duluan.
      const fadeOut = isLast ? 0 : smoothstep(0.75, 1, li)
      const opacity = clamp(fadeIn - fadeOut, 0, 1)
      const lift = 16 * (1 - opacity)

      const leftEl = labelLeftRefs.current[i]
      if (leftEl) {
        leftEl.style.opacity = `${opacity}`
        leftEl.style.transform = `translate3d(0, ${lift}px, 0)`
      }

      const rightEl = labelRightRefs.current[i]
      if (rightEl) {
        rightEl.style.opacity = `${opacity}`
        rightEl.style.transform = `translate3d(0, ${lift}px, 0)`
      }
    }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return

    let span = 1

    const measure = () => {
      const stageH = stage.clientHeight
      const trackH = track.clientHeight
      span = Math.max(1, trackH - stageH)
      featherRef.current = Math.min(MASK_FEATHER_MAX, window.innerWidth * MASK_FEATHER_RATIO)
    }

    const readProgress = () => {
      const top = track.getBoundingClientRect().top
      return clamp(-top / span, 0, 1)
    }

    const tick = () => {
      const s = progressRef.current
      s.current += (s.target - s.current) * 0.18
      if (Math.abs(s.target - s.current) < 0.0005) s.current = s.target
      paint(s.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      progressRef.current.target = readProgress()

      setIsMoving(true)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => setIsMoving(false), 180)
    }

    const onResize = () => {
      measure()
      progressRef.current.target = readProgress()
      progressRef.current.current = progressRef.current.target
      paint(progressRef.current.current)
    }

    measure()
    progressRef.current.target = readProgress()
    progressRef.current.current = progressRef.current.target
    paint(progressRef.current.current)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [paint])

  return (
    <div className="hero-reveal" ref={trackRef}>
      <div className="hero-reveal__stage" ref={stageRef}>
        <div className="hero-reveal__next" aria-hidden="true" />

        {PHRASES.flatMap((phrase, i) => ([
          <div
            key={`left-${i}`}
            className="hero-reveal__label hero-reveal__label--left"
            ref={el => (labelLeftRefs.current[i] = el)}
            aria-hidden="true"
          >
            {phrase.left[0]}
            <br />
            {phrase.left[1]}
          </div>,
          <div
            key={`right-${i}`}
            className="hero-reveal__label hero-reveal__label--right"
            ref={el => (labelRightRefs.current[i] = el)}
            aria-hidden="true"
          >
            {phrase.right[0]}
            <br />
            {phrase.right[1]}
          </div>
        ]))}

          <section id="home" className="hero">
            <div className="hero-mask" ref={heroRef}>
              <div className="hero-texture" aria-hidden="true" />

              <div className="hero-visual" aria-hidden="true">
                <img src={leftHeroImg} alt="" className="hero-bg-side hero-bg-side--left" />
                <img src={rightHeroImg} alt="" className="hero-bg-side hero-bg-side--right" />

                <img src={charBgImg} alt="" className="hero-visual-bg hero-visual-bg--blur" />
                <img src={charBgImg} alt="" className="hero-visual-bg hero-visual-bg--sharp" />
              </div>

              <div className="hero-content">
                <h1 className="hero-heading">
                  <span className="hero-heading-lead">Hello, I'm</span>
                  <img src={khImg} alt="Khaidir" className="hero-heading-img" />
                </h1>
              </div>

              <div className="hero-scroll-cue" aria-hidden="true">
                <span />
              </div>
            </div>

            <img src={rockImg} alt="" className="hero-rock" aria-hidden="true" />
            <img src={charImg} alt="" className="hero-char" aria-hidden="true" />
          </section>

        <img
          ref={walkerRef}
          src={isMoving ? walkGif : idleGif}
          alt=""
          className="hero-reveal__walker"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export default Hero
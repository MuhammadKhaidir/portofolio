import { useEffect, useRef, useState } from 'react'
import './Hero.css'

import corridorBg from '../../assets/Corridor.png'
import charWalkFront from '../../assets/CharFrontWalk.gif'
import charWalkBack from '../../assets/CharBackWalk.gif'
import charIdle from '../../assets/IdleFront.gif'

// tweak angka-angka ini sesuka hati
const STAGE_TOP_MIN = 12 // % posisi paling atas character
const STAGE_TOP_MAX = 85 // % posisi paling bawah character
const IDLE_DELAY = 200 // ms, jeda sebelum dianggap "berhenti scroll"
const STICKY_TOP_OFFSET = 80 // px, HARUS SAMA dengan `top` di .hero pada CSS (tinggi navbar)
const FADE_DISTANCE = 250 // px, seberapa jauh (sebelum & sesudah titik sambung) dip-to-black berlangsung

function Hero() {
  const [charState, setCharState] = useState('idle') // 'idle' | 'down' | 'up'
  const [charTop, setCharTop] = useState(STAGE_TOP_MIN)
  const [charVisible, setCharVisible] = useState(true)
  const [blackout, setBlackout] = useState(0) // 0-1, opacity transisi dip-to-black

  const wrapperRef = useRef(null)
  const heroRef = useRef(null)
  const idleTimeoutRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const tickingRef = useRef(false)

  useEffect(() => {
    lastScrollYRef.current = window.scrollY

    const updateCharacter = () => {
      const wrapperEl = wrapperRef.current
      const heroEl = heroRef.current
      if (!wrapperEl || !heroEl) return

      const wrapperRect = wrapperEl.getBoundingClientRect()
      const heroHeight = heroEl.offsetHeight

      // seberapa jauh "jalur scroll" buat animasi jalan si karakter
      const scrollableRange = wrapperRect.height - heroHeight
      // seberapa jauh udah discroll sejak hero mulai nempel (sticky)
      const scrolledIntoPin = STICKY_TOP_OFFSET - wrapperRect.top

      const rawProgress =
        scrollableRange > 0 ? scrolledIntoPin / scrollableRange : 0
      const progress = Math.min(1, Math.max(0, rawProgress))

      setCharTop(STAGE_TOP_MIN + progress * (STAGE_TOP_MAX - STAGE_TOP_MIN))
      // progress 1 = mentok bawah -> karakter ngilang, giliran About muncul
      setCharVisible(progress < 1)

      // overshoot = 0 persis di titik sambungan hero -> about.
      // negatif = masih di dalam hero, positif = udah masuk area About.
      const overshoot =
        scrollableRange > 0 ? scrolledIntoPin - scrollableRange : 0

      let overlayOpacity = 0
      if (overshoot > -FADE_DISTANCE && overshoot < FADE_DISTANCE) {
        overlayOpacity = 1 - Math.abs(overshoot) / FADE_DISTANCE
      }
      setBlackout(Math.min(1, Math.max(0, overlayOpacity)))

      const scrollY = window.scrollY
      if (scrollY > lastScrollYRef.current) {
        setCharState('down')
      } else if (scrollY < lastScrollYRef.current) {
        setCharState('up')
      }
      lastScrollYRef.current = scrollY

      clearTimeout(idleTimeoutRef.current)
      idleTimeoutRef.current = setTimeout(() => {
        setCharState('idle')
      }, IDLE_DELAY)

      tickingRef.current = false
    }

    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(updateCharacter)
        tickingRef.current = true
      }
    }

    updateCharacter()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateCharacter)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateCharacter)
      clearTimeout(idleTimeoutRef.current)
    }
  }, [])

  const charSprite =
    charState === 'down'
      ? charWalkFront
      : charState === 'up'
      ? charWalkBack
      : charIdle

  return (
    <section id="home" className="hero-scroll-wrapper" ref={wrapperRef}>
      <div
        className="hero"
        ref={heroRef}
        style={{ backgroundImage: `url(${corridorBg})` }}
      >
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <p className="hero-label">HELLO, I'M</p>

          <p className="hero-description">
            Informatics Management student &
            <br />
            aspiring Full-Stack Web Developer.
          </p>

          <div className="hero-buttons">
            <a href="#projects" className="hero-primary">
              View My Work
            </a>

            <a href="#contact" className="hero-secondary">
              Contact Me
            </a>
          </div>
        </div>

        <div className="hero-decoration">
          <img
            src={charSprite}
            alt="Walking character"
            className="hero-character"
            style={{ top: `${charTop}%`, opacity: charVisible ? 1 : 0 }}
          />
        </div>
      </div>

      <div className="scene-blackout" style={{ opacity: blackout }}></div>
    </section>
  )
}

export default Hero
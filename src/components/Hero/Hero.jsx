import { useCallback, useEffect, useRef, useState } from 'react'
import './Hero.css'
import charBgImg from '../../assets/CharBg.png'
import charImg from '../../assets/Char.png'
import khImg from '../../assets/Kh.png'
import walkGif from '../../assets/RightWalkChar.gif'
import idleGif from '../../assets/IdleChar.gif'

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

function Hero() {
  const trackRef = useRef(null)
  const stageRef = useRef(null)
  const heroRef = useRef(null)
  const walkerRef = useRef(null)
  const idleTimerRef = useRef(null)
  const rafRef = useRef(0)
  const progressRef = useRef({ current: 0, target: 0 })

  const [isMoving, setIsMoving] = useState(false)

  const paint = useCallback((p) => {
    if (heroRef.current) {
      heroRef.current.style.clipPath = `inset(0 0 0 ${p * 100}%)`
    }
    if (walkerRef.current) {
      const fade = p < 0.05 ? p / 0.05 : p > 0.95 ? (1 - p) / 0.05 : 1
      walkerRef.current.style.left = `${p * 100}%`
      walkerRef.current.style.opacity = `${clamp(fade, 0, 1)}`
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

        <section id="home" className="hero">
          <div className="hero-mask" ref={heroRef}>
            <div className="hero-texture" aria-hidden="true" />

            <div className="hero-visual" aria-hidden="true">
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
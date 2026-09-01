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

function Hero() {
  const [charState, setCharState] = useState('idle') // 'idle' | 'down' | 'up'
  const [charTop, setCharTop] = useState(STAGE_TOP_MIN)

  const idleTimeoutRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const tickingRef = useRef(false)

  useEffect(() => {
    lastScrollYRef.current = window.scrollY

    const updateCharacter = () => {
      const scrollY = window.scrollY
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0
      const clampedProgress = Math.min(1, Math.max(0, progress))

      setCharTop(
        STAGE_TOP_MIN + clampedProgress * (STAGE_TOP_MAX - STAGE_TOP_MIN)
      )

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

    return () => {
      window.removeEventListener('scroll', handleScroll)
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
    <section
      id="home"
      className="hero"
      style={{ backgroundImage: `url(${corridorBg})` }}
    >
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <p className="hero-label">HELLO, I'M</p>

        <h1>
          Muhammad
          <br />
          <span>Khaidir.</span>
        </h1>

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
          style={{ top: `${charTop}%` }}
        />
      </div>
    </section>
  )
}

export default Hero
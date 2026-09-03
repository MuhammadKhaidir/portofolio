import './Hero.css'
import charBgImg from '../../assets/CharBg.png'
import charImg from '../../assets/Char.png'

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-texture" aria-hidden="true" />

      <div className="hero-visual" aria-hidden="true">
        <img src={charBgImg} alt="" className="hero-visual-bg hero-visual-bg--blur" />
        <img src={charBgImg} alt="" className="hero-visual-bg hero-visual-bg--sharp" />
        <img src={charImg} alt="" className="hero-char" />
      </div>

      <div className="hero-content">
        <h1 className="hero-heading">
          <span className="hero-heading-lead">Hello, I'm</span>
          Informatics Management student &amp; aspiring Full-Stack Web
          Developer.
        </h1>

        <div className="hero-buttons">
          <a href="#projects" className="hero-btn hero-btn-primary">
            View My Work
          </a>
          <a href="#contact" className="hero-btn hero-btn-secondary">
            Contact Me
          </a>
        </div>
      </div>

      <div className="hero-scroll-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}

export default Hero
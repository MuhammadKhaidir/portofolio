import './Hero.css'
import charBgImg from '../../assets/CharBg.png'
import charImg from '../../assets/Char.png'
import khImg from '../../assets/Kh.png'

function Hero() {
  return (
    <section id="home" className="hero">
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

      <img src={charImg} alt="" className="hero-char" aria-hidden="true" />

      <div className="hero-scroll-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}

export default Hero
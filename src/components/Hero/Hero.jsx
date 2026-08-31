import './Hero.css'

function Hero() {
  return (
    <section id="home" className="hero">
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
        <div className="hero-circle"></div>
        <span>01</span>
      </div>
    </section>
  )
}

export default Hero
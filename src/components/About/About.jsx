import './About.css'
import ScrollExpand from './ScrollExpand'

function About() {
  return (
    <section id="about" className="about section">
      <div className="section-title">
        <span>01</span>
        <h2>About Me</h2>
      </div>

      <ScrollExpand
        className="about-scroll-expand"
        background="linear-gradient(135deg, #151515, #262626)"
        scrollHint="Scroll"
        useWindowScroll
        topOffset={80}
      >
        <div className="about-content">
          <h3>
            I build digital
            <br />
            experiences.
          </h3>

          <div className="about-text">
            <p>
              I'm a student of Informatics Management who enjoys building
              websites, applications, and interactive digital experiences.
            </p>

            <p>
              I'm currently focusing on web development, backend systems,
              and building projects to improve my technical skills.
            </p>
          </div>
        </div>
      </ScrollExpand>
    </section>
  )
}

export default About
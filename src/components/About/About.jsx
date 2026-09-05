import './About.css'
import ScrollExpand, { Reveal } from './ScrollExpand'

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
          <Reveal as="h3" from={0.58} to={0.78}>
            I build digital
            <br />
            experiences.
          </Reveal>

          <div className="about-text">
            <Reveal as="p" from={0.68} to={0.88}>
              I'm a student of Informatics Management who enjoys building
              websites, applications, and interactive digital experiences.
            </Reveal>

            <Reveal as="p" from={0.78} to={0.98}>
              I'm currently focusing on web development, backend systems,
              and building projects to improve my technical skills.
            </Reveal>
          </div>
        </div>
      </ScrollExpand>
    </section>
  )
}

export default About
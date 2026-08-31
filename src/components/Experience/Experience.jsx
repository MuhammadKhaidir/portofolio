import './Experience.css'

function Experience() {
  return (
    <section id="experience" className="experience section">
      <div className="section-title">
        <span>04</span>
        <h2>Experience</h2>
      </div>

      <div className="experience-item">
        <div className="experience-date">
          2026
        </div>

        <div>
          <h3>Kerja Praktik</h3>
          <p className="experience-company">
            DPMPTSP Kota Palembang
          </p>

          <p className="experience-description">
            Worked on information technology and web-related activities
            during internship.
          </p>
        </div>
      </div>

      <div className="experience-item">
        <div className="experience-date">
          2025 — Present
        </div>

        <div>
          <h3>Google Developer Groups on Campus</h3>
          <p className="experience-company">
            UNSRI
          </p>

          <p className="experience-description">
            Contributing to community activities, events, and technology
            learning programs.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Experience
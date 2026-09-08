import { useState } from 'react'
import './Skills.css'

function Skills() {
  const skills = [
    {
      number: '01',
      title: 'Frontend',
      tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js'],
    },
    {
      number: '02',
      title: 'Backend',
      tags: ['Java', 'Node.js', 'PHP', 'Laravel'],
    },
    {
      number: '03',
      title: 'Database',
      tags: ['SQL', 'MySQL', 'MariaDB'],
    },
    {
      number: '04',
      title: 'Tools',
      tags: ['Git', 'GitHub', 'VS Code', 'Figma'],
    },
  ]

  const [openBook, setOpenBook] = useState(null)

  const toggleBook = (number) => {
    setOpenBook((prev) => (prev === number ? null : number))
  }

  const handleKeyDown = (e, number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleBook(number)
    }
  }

  return (
    <section id="skills" className="skills section">
      <div className="section-title">
        <span>02</span>
        <h2>Skills</h2>
      </div>

      <div className="shelf">
        <div className="skills-grid">
          {skills.map((skill) => (
            <div
              key={skill.number}
              className={`skill-book${openBook === skill.number ? ' is-open' : ''}`}
              onClick={() => toggleBook(skill.number)}
              onKeyDown={(e) => handleKeyDown(e, skill.number)}
              role="button"
              tabIndex={0}
              aria-pressed={openBook === skill.number}
            >
              <div className="skill-book-inner">
                <div className="skill-cover">
                  <span className="spine-ridge" aria-hidden="true" />
                  <span className="skill-tag">{skill.number}</span>
                  <h3>{skill.title}</h3>
                  <div className="paper-tab">
                    <p>{skill.tags.join(', ')}</p>
                  </div>
                </div>
                <div className="skill-inside">
                  <span className="skill-tag">{skill.number}</span>
                  <h3>{skill.title}</h3>
                  <ul>
                    {skill.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="shelf-ledge" aria-hidden="true" />
      </div>
    </section>
  )
}

export default Skills
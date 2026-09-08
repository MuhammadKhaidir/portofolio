import { useRef, useState } from 'react'
import './Skills.css'

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

function Skills() {
  const [openBook, setOpenBook] = useState(null)
  const cardsRef = useRef({})

  const toggleBook = (number) => {
    setOpenBook((prev) => (prev === number ? null : number))
  }

  const handleKeyDown = (e, number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleBook(number)
    }
  }

  // buku sedikit "menoleh" ke arah kursor — dimatikan otomatis di layar sentuh
  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - py) * 9
    const ry = (px - 0.5) * 12
    card.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
    card.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
  }

  const handlePointerLeave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }

  return (
    <section id="skills" className="skills section">
      <div className="section-title">
        <span>02</span>
        <h2>Skills</h2>
      </div>

      <div className="shelf">
        <div className="skills-grid">
          {skills.map((skill) => {
            const isOpen = openBook === skill.number
            return (
              <div
                key={skill.number}
                ref={(el) => (cardsRef.current[skill.number] = el)}
                className={`skill-book${isOpen ? ' is-open' : ''}`}
                onClick={() => toggleBook(skill.number)}
                onKeyDown={(e) => handleKeyDown(e, skill.number)}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                role="button"
                tabIndex={0}
                aria-pressed={isOpen}
                aria-label={`Skill ${skill.title}, ${isOpen ? 'terbuka' : 'tertutup'}`}
              >
                <span className="skill-shadow ambient" aria-hidden="true" />
                <span className="skill-shadow contact" aria-hidden="true" />

                <div className="skill-book-inner">
                  <div className="skill-cover">
                    <span className="spine-ridge" aria-hidden="true" />
                    <span className="cover-grain" aria-hidden="true" />
                    <span className="skill-tag">{skill.number}</span>
                    <h3>{skill.title}</h3>
                    <div className="paper-tab">
                      <p>{skill.tags.join(' · ')}</p>
                    </div>
                    <span className="open-hint" aria-hidden="true">Ketuk untuk buka</span>
                  </div>

                  <div className="skill-inside">
                    <span className="page-rule" aria-hidden="true" />
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
            )
          })}
        </div>
        <div className="shelf-ledge" aria-hidden="true" />
      </div>
    </section>
  )
}

export default Skills
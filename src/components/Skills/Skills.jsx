import { useEffect, useRef, useState } from 'react'
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

// How long the cover takes to fade out before the icons fade in (and vice
// versa). Keep this in sync with the opacity transition duration in
// Skills.css (.skill-cover / .skill-icons).
const FADE_MS = 350

// Devicon (devicon.dev) hosts a colored logo for pretty much every language,
// framework and tool, served straight off jsDelivr — so a tag just needs to
// resolve to devicon's slug for its icon to show up, no need to go find and
// save each logo by hand. Pinned to a specific release so the CDN can cache
// it properly; bump the version below whenever you want newer icons.
const DEVICON_VERSION = 'v2.17.0'
const DEVICON_BASE = `https://cdn.jsdelivr.net/gh/devicons/devicon@${DEVICON_VERSION}/icons`

// Devicon's slugs are almost always just the tag name lowercased with
// punctuation stripped ("Next.js" -> "nextjs", "VS Code" -> "vscode"), so
// that's the default. Only a few names diverge from that pattern — add more
// entries here if a future tag's icon doesn't load.
const ICON_OVERRIDES = {
  html: 'html5',
  css: 'css3',
}

const slugify = (tag) => tag.toLowerCase().replace(/[^a-z0-9]/g, '')

const iconUrl = (tag) => {
  const key = slugify(tag)
  const slug = ICON_OVERRIDES[key] || key
  return `${DEVICON_BASE}/${slug}/${slug}-original.svg`
}

// Renders a tag's icon, falling back to its initials if devicon doesn't have
// a matching logo (there's no generic "SQL" logo, for instance) so a missing
// icon never shows up as a broken image.
function SkillIcon({ tag }) {
  const [broken, setBroken] = useState(false)

  return (
    <div className="skill-icon">
      {broken ? (
        <span className="skill-icon-fallback" aria-hidden="true">
          {tag.slice(0, 2).toUpperCase()}
        </span>
      ) : (
        <img
          className="skill-icon-img"
          src={iconUrl(tag)}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
        />
      )}
      <span className="skill-icon-label">{tag}</span>
    </div>
  )
}

function Skills() {
  const [openBook, setOpenBook] = useState(null) // which book is expanded
  const [showIcons, setShowIcons] = useState(null) // which book's icons are visible
  const timers = useRef({})

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      Object.values(activeTimers).forEach(clearTimeout)
    }
  }, [])

  const toggleBook = (number) => {
    clearTimeout(timers.current[number])

    if (openBook === number) {
      // Closing: icons fade out first, then the cover fades back in.
      setShowIcons(null)
      timers.current[number] = setTimeout(() => setOpenBook(null), FADE_MS)
    } else {
      // Opening: cover fades out first, then the icons fade in.
      setOpenBook(number)
      timers.current[number] = setTimeout(() => setShowIcons(number), FADE_MS)
    }
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
            const isShowingIcons = showIcons === skill.number
            return (
              <div
                key={skill.number}
                className={`skill-book${isOpen ? ' is-open' : ''}${
                  isShowingIcons ? ' show-icons' : ''
                }`}
                onClick={() => toggleBook(skill.number)}
                onKeyDown={(e) => handleKeyDown(e, skill.number)}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                role="button"
                tabIndex={0}
                aria-pressed={isOpen}
                aria-label={`Skill ${skill.title}, ${isOpen ? 'menampilkan ikon' : 'tertutup'}`}
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
                    <span className="open-hint" aria-hidden="true">Ketuk untuk lihat ikon</span>
                  </div>

                  <div className="skill-icons">
                    <span className="page-rule" aria-hidden="true" />
                    <span className="skill-tag">{skill.number}</span>
                    <h3>{skill.title}</h3>
                    <div className="skill-icon-grid">
                      {skill.tags.map((tag) => (
                        <SkillIcon key={tag} tag={tag} />
                      ))}
                    </div>
                    <span className="close-hint" aria-hidden="true">Ketuk untuk kembali</span>
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
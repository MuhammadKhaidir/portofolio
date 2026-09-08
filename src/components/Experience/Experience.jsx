import { useState, useEffect, useCallback } from 'react'
import './Experience.css'
import coreEditorImg from '../../assets/CoreEditor.jpeg'
import gdgImg from '../../assets/GDG.png'
import ptspImg from '../../assets/PTSP.jpeg'
import rriImg from '../../assets/RRI.jpeg'
import bemImg from '../../assets/BEM.jpeg'

function ExperienceItem({ date, title, company, description, image, imageAlt, rotated, onOpenLightbox }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`experience-item${isOpen ? ' is-open' : ''}`}>
      <div className="experience-date">{date}</div>

      <div className="experience-content">
        <div className="experience-text">
          <h3>{title}</h3>
          <p className="experience-company">{company}</p>
          <p className="experience-description">{description}</p>

          {image && (
            <button
              type="button"
              className="experience-toggle"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? 'Sembunyikan Foto' : 'Lihat Foto'}
            </button>
          )}
        </div>

        {image && (
          <div className={`experience-image${rotated ? ' is-rotated' : ''}`}>
            <button
              type="button"
              className="experience-image-trigger"
              onClick={() => onOpenLightbox(image, imageAlt, rotated)}
              aria-label={`Buka foto ${imageAlt}`}
            >
              <img src={image} alt={imageAlt} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Experience() {
  const [lightbox, setLightbox] = useState(null) // { src, alt, rotated }

  const openLightbox = useCallback((src, alt, rotated) => {
    setLightbox({ src, alt, rotated: Boolean(rotated) })
  }, [])

  const closeLightbox = useCallback(() => {
    setLightbox(null)
  }, [])

  useEffect(() => {
    if (!lightbox) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightbox, closeLightbox])

  return (
    <section id="experience" className="experience section">
      <div className="section-title">
        <span>04</span>
        <h2>Experience</h2>
      </div>

      <ExperienceItem
        date="2025 - Present"
        title="Development"
        company="2D RPG Indie Game Developer"
        description="Developing a 2D pixel-art RPG game using Java, focusing on gameplay systems, player mechanics, combat, NPC interactions, world exploration, inventory, save systems, and enemy behavior."
      />

      <ExperienceItem
        date="2026 - Present"
        title="Organization"
        company="BEM KM Fasilkom Unsri"
        description="As a staff of Academic division"
        image={bemImg}
        imageAlt="BEM KM Fasilkom Unsri"
        rotated
        onOpenLightbox={openLightbox}
      />

      <ExperienceItem
        date="2026"
        title="Internship"
        company="DPMPTSP Kota Palembang"
        description="Worked on information technology and web-related activities during internship."
        image={ptspImg}
        imageAlt="DPMPTSP Kota Palembang"
        onOpenLightbox={openLightbox}
      />

      <ExperienceItem
        date="2025"
        title="Community"
        company="GDGoC Unsri"
        description="As a member of public relation(out)"
        image={gdgImg}
        imageAlt="GDGoC Unsri"
        onOpenLightbox={openLightbox}
      />

      <ExperienceItem
        date="2023"
        title="Internship"
        company="Radio Republik Indonesia (RRI)"
        description="Contributed to the development and maintenance of digital systems, assisted with technical tasks, and gained practical experience in applying software development skills within a professional environment."
        image={rriImg}
        imageAlt="Radio Republik Indonesia"
        onOpenLightbox={openLightbox}
      />

      <ExperienceItem
        date="2022-2023"
        title="Organization"
        company="Core Editor SMKN1 Palembang"
        description="Edit a lot of videos by using Adobe premiere pro."
        image={coreEditorImg}
        imageAlt="Core Editor SMKN1 Palembang"
        onOpenLightbox={openLightbox}
      />

      {lightbox && (
        <div
          className="experience-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="experience-lightbox-close"
            onClick={closeLightbox}
            aria-label="Tutup"
          >
            &times;
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className={`experience-lightbox-img${lightbox.rotated ? ' is-rotated' : ''}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}

export default Experience
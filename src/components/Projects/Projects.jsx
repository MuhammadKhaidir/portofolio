import './Projects.css'
import pixelGameGif from '../../assets/2DGame.gif'
import Showcase from '../../assets/2DShowcase.png'
import GameWeb from '../../assets/2DGameWeb.png'

function Projects() {
  const projects = [
    {
      number: '01',
      title: '2D Pixel Game',
      description: 'A 2D medieval adventure game built with Java.',
      tags: ['Java', 'Game', 'Pixel Art'],
      image: pixelGameGif,
    },
    {
      number: '02',
      title: 'Showcase Website',
      description: 'A website to support my 2D game',
      tags: ['React', 'Node.js', 'AI'],
      image: GameWeb,
    },
    {
      number: '03',
      title: 'Portfolio Website',
      description: 'Personal portfolio showcasing my work and skills.',
      tags: ['React', 'Vite', 'CSS'],
      image: Showcase,
    },
  ]

  return (
    <section id="projects" className="projects section">
      <div className="section-title">
        <span>03</span>
        <h2>Projects</h2>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.number}>
            <div className="project-image">
              {project.image ? (
                <img src={project.image} alt={project.title} />
              ) : (
                <span>PROJECT {project.number}</span>
              )}
            </div>

            <div className="project-content">
              <h3>{project.title}</h3>

              <p>{project.description}</p>

              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Projects
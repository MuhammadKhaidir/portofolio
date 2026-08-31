import './Skills.css'

function Skills() {
  const skills = [
    {
      number: '01',
      title: 'Frontend',
      description: 'HTML, CSS, JavaScript, React, Next.js',
    },
    {
      number: '02',
      title: 'Backend',
      description: 'Java, Node.js, PHP, Laravel',
    },
    {
      number: '03',
      title: 'Database',
      description: 'SQL, MySQL, MariaDB',
    },
    {
      number: '04',
      title: 'Tools',
      description: 'Git, GitHub, VS Code, Figma',
    },
  ]

  return (
    <section id="skills" className="skills section">
      <div className="section-title">
        <span>02</span>
        <h2>Skills</h2>
      </div>

      <div className="skills-grid">
        {skills.map((skill) => (
          <div className="skill-card" key={skill.number}>
            <span>{skill.number}</span>
            <h3>{skill.title}</h3>
            <p>{skill.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
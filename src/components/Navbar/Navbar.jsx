import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <a href="#home" className="navbar-logo">
        KHAIDIR.
      </a>

      <div className="navbar-links">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
      </div>

      <a href="#contact" className="navbar-button">
        Let's Talk
      </a>
    </nav>
  )
}

export default Navbar
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <p>© 2026 Khaidir.</p>

      <div>
        <a href="https://github.com/MuhammadKhaidir">
          <img src="https://cdn.simpleicons.org/github/ffffff" alt="" className="footer-icon" />
          GitHub
        </a>
        <a href="#">
          <img src="https://cdn.simpleicons.org/linkedin/ffffff" alt="" className="footer-icon" />
          LinkedIn
        </a>
        <a href="https://www.instagram.com/m.khaiidir/">
          <img src="https://cdn.simpleicons.org/instagram/ffffff" alt="" className="footer-icon" />
          Instagram
        </a>
        <a href="https://wa.me/62895634304200" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" className="footer-icon" />
          WhatsApp
        </a>
      </div>
    </footer>
  )
}

export default Footer
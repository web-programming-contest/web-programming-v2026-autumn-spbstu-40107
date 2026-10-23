import './Footer.css'

const SOCIALS = [
  { name: 'ВКонтакте', href: 'https://vk.com', icon: '/images/social/vk.png' },
  { name: 'Telegram', href: 'https://t.me', icon: '/images/social/telegram.png' },
  { name: 'WhatsApp', href: 'https://www.whatsapp.com', icon: '/images/social/whatsapp.png' },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__about">
          <p className="footer__logo">Gadget Hub</p>
          <p>Магазин надежных гаджетов</p>
          <p className="footer__copyright">© 2024 ООО “Гаджет Хаб”. Все права защищены</p>
        </div>

        <a href="tel:88006783424" className="footer__phone">
          <img src="/images/icons/mobile.svg" alt="" className="footer__phone-icon" />8 (800) 678-34-24
        </a>

        <div className="footer__socials">
          {SOCIALS.map((social) => (
            <a key={social.name} href={social.href} target="_blank" rel="noreferrer">
              <img src={social.icon} alt={social.name} width="36" height="36" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer

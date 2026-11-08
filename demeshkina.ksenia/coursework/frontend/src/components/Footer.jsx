import React from 'react';
import {Link} from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <Link to="/" className="logo">
            Gadget Hub
          </Link>
          <p className="footer-subtitle">Магазин надежных гаджетов</p>
          <p className="footer-copy">
            © 2024 ООО «Гаджет Хаб». Все права защищены
          </p>
        </div>

        <div className="footer-right">
          <a href="tel:88006783424" className="footer-phone">
            8 (800) 678-34-24
          </a>
          <div className="footer-socials">
            <a
              href="https://vk.com"
              target="_blank"
              rel="noreferrer"
              className="social-icon"
            >
              <img src="/images/social/vk.png" alt="VK" />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="social-icon"
            >
              <img src="/images/social/telegram.png" alt="Telegram" />
            </a>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="social-icon"
            >
              <img src="/images/social/whatsapp.png" alt="WhatsApp" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

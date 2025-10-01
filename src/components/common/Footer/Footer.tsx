import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, Facebook, Youtube, Instagram, ExternalLink, Send } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-vinfast">
      <div className="footer__container">
        {/* Newsletter Section - Compact Design */}
        <div className="footer__newsletter-compact">
          <div className="newsletter-content">
            <div className="newsletter-header">
              <Mail className="newsletter-icon" size={18} />
              <h3 className="newsletter-title">Nhận thông tin mới nhất</h3>
            </div>
            <p className="newsletter-subtitle">Cập nhật dịch vụ & ưu đãi từ VinFast</p>
          </div>
          <form className="newsletter-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Email của bạn"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-submit">
                <Send size={16} />
              </button>
            </div>
            <p className="newsletter-privacy">
              Bằng việc đăng ký, bạn đồng ý với <Link to="/privacy" className="privacy-link">Chính sách bảo mật</Link>
            </p>
          </form>
        </div>

        {/* Main Footer Content */}
        <div className="footer__main">
          {/* Company Info */}
          <div className="footer__section footer__company">
            <div className="footer__logo">
              <Car className="footer__logo-icon" />
              <span className="footer__logo-text">EV Service Center</span>
            </div>
            <p className="footer__company-description">
              Công ty TNHH Kinh doanh Thương mại và Dịch vụ EV Service Center
            </p>
            <p className="footer__company-info">
              MST/MSDN: 0108926276 do Sở KHĐT TP Hà Nội cấp lần đầu ngày 01/10/2019 và các lần thay đổi tiếp theo.
            </p>
            <p className="footer__company-address">
              Địa chỉ trụ sở chính: Số 7, đường Bằng Lăng 1, khu đô thị Vinhomes Riverside, phường Việt Hưng, thành phố Hà Nội, Việt Nam
            </p>
          </div>

          {/* Main Links */}
          <div className="footer__section footer__links-main">
            <div className="footer__links-column">
              <Link to="/about" className="footer__link-main">VỀ EV SERVICE CENTER</Link>
              <Link to="/news" className="footer__link-main">TIN TỨC</Link>
              <Link to="/showrooms" className="footer__link-main">SHOWROOM & ĐẠI LÝ</Link>
            </div>
            <div className="footer__links-column">
              <Link to="/terms" className="footer__link-main">ĐIỀU KHOẢN CHÍNH SÁCH</Link>
              <Link to="/warranty" className="footer__link-main">BẢO HÀNH & DỊCH VỤ</Link>
              <Link to="/booking" className="footer__link-main">ĐẶT LỊCH BẢO DƯỠNG</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer__section footer__contact">
            <h4 className="footer__contact-title">DỊCH VỤ KHÁCH HÀNG</h4>
            <div className="footer__contact-item">
              <Phone className="footer__contact-icon" />
              <a href="tel:1900232389" className="footer__contact-link">1900 23 23 89</a>
            </div>
            <div className="footer__contact-item">
              <Mail className="footer__contact-icon" />
              <a href="mailto:support.vn@evservice.vn" className="footer__contact-link">support.vn@evservice.vn</a>
            </div>

            <h4 className="footer__contact-title footer__speakup-title">SPEAK-UP HOTLINE</h4>
            <div className="footer__contact-item">
              <Phone className="footer__contact-icon" />
              <a href="tel:+842444582193" className="footer__contact-link">+84 24 4458 2193</a>
            </div>
            <div className="footer__contact-item">
              <Mail className="footer__contact-icon" />
              <a href="mailto:v.speakup@evservice.vn" className="footer__contact-link">v.speakup@evservice.vn</a>
            </div>
          </div>

          {/* Social & Ecosystem */}
          <div className="footer__section footer__social-ecosystem">
            <h4 className="footer__social-title">Kết nối với EV Service Center</h4>
            <div className="footer__social-links">
              <a href="https://facebook.com" className="footer__social-link" target="_blank" rel="noopener noreferrer">
                <Facebook size={24} />
              </a>
              <a href="https://youtube.com" className="footer__social-link" target="_blank" rel="noopener noreferrer">
                <Youtube size={24} />
              </a>
              <a href="https://instagram.com" className="footer__social-link" target="_blank" rel="noopener noreferrer">
                <Instagram size={24} />
              </a>
            </div>

            <h4 className="footer__ecosystem-title">Hệ sinh thái</h4>
            <div className="footer__ecosystem-links">
              <a href="https://vinhomes.vn" className="footer__ecosystem-link" target="_blank" rel="noopener noreferrer">
                Vinhomes <ExternalLink size={12} />
              </a>
              <a href="https://vinmec.com" className="footer__ecosystem-link" target="_blank" rel="noopener noreferrer">
                Vinmec <ExternalLink size={12} />
              </a>
              <a href="https://vinpearl.com" className="footer__ecosystem-link" target="_blank" rel="noopener noreferrer">
                Vinpearl <ExternalLink size={12} />
              </a>
              <a href="https://vinfast.vn" className="footer__ecosystem-link" target="_blank" rel="noopener noreferrer">
                VinFast <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer__bottom">
          <div className="footer__bottom-left">
            <div className="footer__certification">
              <img src="/assets/images/bo_cong_thuong.jpg" alt="Đã thông báo Bộ Công Thương" className="footer__cert-logo" />
              <span>EV Service Center. All rights reserved.</span>
            </div>
          </div>
          <div className="footer__bottom-right">
            <span>&copy; Copyright 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
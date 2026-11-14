import { Container } from 'react-bootstrap';
import { FiFacebook, FiInstagram, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ShopStreamFooter = () => (
  <footer className="border-top mt-auto" style={{ backgroundColor: '#dce5f7' }}>
    <Container fluid className="px-3 px-lg-4 py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <Link to="/home" className="text-decoration-none fw-bold small" style={{ color: '#3523d2' }}>
            ShopStream
          </Link>
          <p className="text-secondary small mb-0 mt-1">© 2024 ShopStream Inc. All rights reserved.</p>
        </div>
        <nav className="d-flex flex-wrap gap-3">
          <Link to="/products" className="text-secondary text-decoration-none small">Privacy Policy</Link>
          <Link to="/products" className="text-secondary text-decoration-none small">Terms of Service</Link>
          <Link to="/products" className="text-secondary text-decoration-none small">Contact Us</Link>
          <Link to="/products" className="text-secondary text-decoration-none small">Shipping Info</Link>
        </nav>
        <div className="d-flex align-items-center gap-3 text-secondary">
          <a href="https://instagram.com" aria-label="ShopStream on Instagram" className="shopstream-social-link"><FiInstagram /></a>
          <a href="https://facebook.com" aria-label="ShopStream on Facebook" className="shopstream-social-link"><FiFacebook /></a>
          <a href="mailto:support@shopstream.example" aria-label="Email ShopStream support" className="shopstream-social-link"><FiMail /></a>
        </div>
      </div>
    </Container>
  </footer>
);

export default ShopStreamFooter;

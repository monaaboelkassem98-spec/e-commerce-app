import { useEffect, useState } from 'react';
import { Badge, Container, Form, Nav, Navbar } from 'react-bootstrap';
import { FiGrid, FiHome, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCartItems } from '../services/cartService';

const getCartCount = () => {
  try {
    return getCartItems().reduce((count, item) => count + Number(item.quantity || 1), 0);
  } catch {
    return 0;
  }
};

const ShopStreamNavbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(getCartCount);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount());
    window.addEventListener('shopstream:cart-updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('shopstream:cart-updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
    setSearch('');
  };

  return (
    <Navbar expand="md" className="shopstream-navbar bg-white border-bottom sticky-top">
      <Container fluid className="px-3 px-lg-4">
        <Navbar.Brand as={NavLink} to="/" className="shopstream-brand fw-bold">
          <span aria-hidden="true" className="me-2">🛍️</span>
          ShopStream
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="shopstream-navigation" aria-label="Toggle navigation" />
        <Navbar.Collapse id="shopstream-navigation">
          <Nav className="shopstream-main-nav align-items-md-center justify-content-md-center gap-md-2">
            <Nav.Link as={NavLink} to="/" className="shopstream-nav-link">
              <FiHome aria-hidden="true" /> Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/products" className="shopstream-nav-link">
              <FiGrid aria-hidden="true" /> Products
            </Nav.Link>
            <Nav.Link as={NavLink} to="/#categories" className="shopstream-nav-link">
              <FiGrid aria-hidden="true" /> Categories
            </Nav.Link>
          </Nav>
          <Form role="search" onSubmit={submitSearch} className="shopstream-search my-2 my-md-0 me-md-3">
            <FiSearch aria-hidden="true" />
            <Form.Control
              type="search"
              aria-label="Search products"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Form>
          <div className="d-flex align-items-center gap-2">
            <NavLink to="/cart" aria-label={`Shopping cart, ${cartCount} items`} className="shopstream-icon-link">
              <FiShoppingCart aria-hidden="true" />
              {cartCount > 0 && <Badge className="shopstream-cart-badge">{cartCount}</Badge>}
            </NavLink>
            <NavLink to="/profile" aria-label="User profile" className="shopstream-icon-link">
              <FiUser aria-hidden="true" />
            </NavLink>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ShopStreamNavbar;

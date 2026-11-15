import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { addCartItem } from '../services/cartService';
import ShopStreamNavbar from '../components/ShopStreamNavbar';
import ShopStreamFooter from '../components/ShopStreamFooter';

const Home = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [cartError, setCartError] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const addedTimeout = useRef(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => () => window.clearTimeout(addedTimeout.current), []);

  useEffect(() => {
    if (location.hash === '#categories') {
      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('https://dummyjson.com/products?limit=100', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Product request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.products) || data.products.length === 0) {
          throw new Error('The product catalog is empty.');
        }

        setProducts(data.products);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError('We could not load the product catalog. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => controller.abort();
  }, [retryCount]);

  const featuredProducts = useMemo(
    () => [...products].sort((a, b) => b.rating - a.rating).slice(0, 4),
    [products],
  );

  const categories = useMemo(() => {
    const grouped = products.reduce((groups, product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
      return groups;
    }, {});

    return Object.entries(grouped)
      .sort(([, first], [, second]) => second.length - first.length)
      .slice(0, 4)
      .map(([name, items]) => ({ name, product: items[0] }));
  }, [products]);

  const heroProduct = featuredProducts[0];

  const handleAddToCart = (product) => {
    try {
      addCartItem(product);
      setCartError('');
      setAddedProductId(product.id);
      window.clearTimeout(addedTimeout.current);
      addedTimeout.current = window.setTimeout(() => setAddedProductId(null), 2000);
    } catch {
      setAddedProductId(null);
      setCartError('Your item could not be added. Please try again.');
    }
  };

  const handleSubscribe = (event) => {
    event.preventDefault();
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div style={{ backgroundColor: '#f7f8ff', color: '#182234' }}>
      <ShopStreamNavbar />

      {cartError && (
        <Container className="pt-3">
          <Alert variant="danger" dismissible onClose={() => setCartError('')} className="mb-0">
            {cartError}
          </Alert>
        </Container>
      )}

      <main>
        <section style={{ background: 'linear-gradient(115deg, #eef2ff 0%, #f3f5ff 65%, #e5faf3 100%)' }}>
          <Container fluid className="px-3 px-lg-4 py-5">
            <Row className="align-items-center g-4 g-lg-5 py-lg-3">
              <Col lg={6} className="py-2 py-lg-4">
                <span
                  className="badge rounded-pill fw-medium px-3 py-2 mb-3"
                  style={{ backgroundColor: '#66efbd', color: '#07583f' }}
                >
                  NEW SEASON ARRIVAL
                </span>
                <h1 className="display-5 fw-bold lh-sm mb-3">
                  Experience the Future of <span style={{ color: '#3925d7' }}>Innovation.</span>
                </h1>
                <p className="text-secondary mb-4" style={{ maxWidth: '480px' }}>
                  Explore our curated selection of premium products designed to elevate your everyday.
                  Find thoughtful details, quality you can feel, and something new to love.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    as={Link}
                    to="/products"
                    className="px-4 py-2"
                    style={{ backgroundColor: '#3825d5', borderColor: '#3825d5' }}
                  >
                    Shop Now
                  </Button>
                  <Button
                    as="a"
                    href="#categories"
                    variant="outline-primary"
                    className="px-4 py-2"
                    style={{ borderColor: '#3825d5', color: '#3825d5' }}
                  >
                    View Collections
                  </Button>
                </div>
              </Col>
              <Col lg={6}>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center overflow-hidden"
                  style={{
                    minHeight: '280px',
                    height: 'min(38vw, 360px)',
                    background: 'linear-gradient(145deg, #152432, #25395f)',
                    boxShadow: '0 20px 40px rgba(27, 38, 77, 0.2)',
                  }}
                >
                  {loading ? (
                    <Spinner animation="border" variant="light" aria-label="Loading featured product" />
                  ) : heroProduct ? (
                    <img
                      src={heroProduct.thumbnail}
                      alt={heroProduct.title}
                      className="w-100 h-100 p-4"
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="text-white text-center px-4">
                      <h2 className="fw-bold">Find your next favorite</h2>
                      <p className="mb-0">Explore the latest from ShopStream.</p>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {error ? (
          <Container className="py-5">
            <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-0">
              <span>{error}</span>
              <Button variant="outline-danger" onClick={() => setRetryCount((count) => count + 1)}>
                Try again
              </Button>
            </Alert>
          </Container>
        ) : (
          <>
            <Container fluid id="categories" className="px-3 px-lg-4 py-5">
              <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                  <h2 className="h3 fw-bold mb-1">Top Categories</h2>
                  <p className="text-secondary small mb-0">Curated finds for every lifestyle.</p>
                </div>
                <Link to="/products" className="text-decoration-none small fw-medium" style={{ color: '#3523d2' }}>
                  See all <FiArrowRight aria-hidden="true" />
                </Link>
              </div>

              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" variant="primary" aria-label="Loading categories" />
                </div>
              ) : (
                <Row className="g-3">
                  {categories.map(({ name, product }, index) => (
                    <Col key={name} xs={12} sm={6} lg={index === 0 ? 6 : 3}>
                      <Link
                        to={`/products?category=${encodeURIComponent(name)}`}
                        className="text-decoration-none"
                        aria-label={`Shop ${name}`}
                      >
                        <Card className="border-0 overflow-hidden rounded-3 h-100 text-white">
                          <Card.Img
                            src={product.thumbnail}
                            alt=""
                            style={{ height: index === 0 ? '300px' : '210px', objectFit: 'cover' }}
                          />
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ background: 'linear-gradient(0deg, rgba(5, 14, 24, 0.78), transparent 70%)' }}
                          />
                          <Card.ImgOverlay className="d-flex flex-column justify-content-end">
                            <Card.Title className="fw-bold text-capitalize mb-1">{name.replaceAll('-', ' ')}</Card.Title>
                            <Card.Text className="small mb-0">Explore the collection</Card.Text>
                          </Card.ImgOverlay>
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              )}
            </Container>

            <Container fluid className="px-3 px-lg-4 py-4">
              <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                  <h2 className="h3 fw-bold mb-1">Featured Products</h2>
                  <p className="text-secondary small mb-0">Customer favorites, picked for you.</p>
                </div>
                <Link to="/products" className="text-decoration-none small fw-medium" style={{ color: '#3523d2' }}>
                  View all <span aria-hidden="true">→</span>
                </Link>
              </div>

              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" variant="primary" aria-label="Loading featured products" />
                </div>
              ) : (
                <Row className="g-3">
                  {featuredProducts.map((product) => (
                    <Col key={product.id} xs={12} sm={6} lg={3}>
                      <Card className="h-100 bg-white rounded-3 p-2" style={{ borderColor: '#e1e3ef' }}>
                        <Link to={`/products/${product.id}`} className="text-decoration-none">
                          <Card.Img
                            src={product.thumbnail}
                            alt={product.title}
                            className="rounded-2"
                            style={{ height: '190px', objectFit: 'contain', backgroundColor: '#f4f5f9' }}
                          />
                        </Link>
                        <Card.Body className="d-flex flex-column px-2 pb-2">
                          <span className="text-uppercase small mb-1" style={{ color: '#3925d7', fontSize: '0.7rem' }}>
                            {product.category.replaceAll('-', ' ')}
                          </span>
                          <Card.Title className="fs-6 fw-semibold text-truncate mb-2">{product.title}</Card.Title>
                          <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
                            <span className="fw-bold text-success">${product.price.toFixed(2)}</span>
                            <div className="d-flex gap-2">
                              <Button
                                as={Link}
                                to={`/products/${product.id}`}
                                variant="outline-secondary"
                                size="sm"
                              >
                                Details
                              </Button>
                              <div className="position-relative">
                                {addedProductId === product.id && (
                                  <span
                                    className="position-absolute bottom-100 start-50 translate-middle-x mb-1 badge text-bg-success text-nowrap"
                                    role="status"
                                    aria-live="polite"
                                  >
                                    ✓ Added!
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => handleAddToCart(product)}
                                  style={{ backgroundColor: '#3825d5', borderColor: '#3825d5' }}
                                >
                                  <FiShoppingCart aria-hidden="true" className="me-1" /> Add to Cart
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Container>

            <Container fluid className="px-3 px-lg-4 py-5">
              <section
                className="rounded-4 text-white px-4 px-md-5 py-5"
                style={{ background: 'linear-gradient(120deg, #3924d4, #3120c6)' }}
              >
                <Row className="align-items-center g-4">
                  <Col lg={8}>
                    <h2 className="display-6 fw-bold mb-2">Stay Ahead of the Stream</h2>
                    <p className="text-white-50 mb-4" style={{ maxWidth: '620px' }}>
                      Join our inner circle for early access to product launches, seasonal deals, and curated trends.
                      No spam, just high-quality updates.
                    </p>
                    {subscribed ? (
                      <Alert variant="success" className="mb-0 py-2">
                        Thanks for subscribing. Watch your inbox for ShopStream updates.
                      </Alert>
                    ) : (
                      <Form onSubmit={handleSubscribe} className="d-flex flex-column flex-sm-row gap-2" style={{ maxWidth: '520px' }}>
                        <Form.Control
                          type="email"
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="Enter your email"
                          aria-label="Email address"
                          className="py-2"
                        />
                        <Button type="submit" variant="success" className="px-4 fw-semibold text-nowrap flex-shrink-0">
                          Join Now
                        </Button>
                      </Form>
                    )}
                  </Col>
                </Row>
              </section>
            </Container>
          </>
        )}
      </main>

      <ShopStreamFooter />
    </div>
  );
};

export default Home;

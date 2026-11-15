import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Nav, Row, Spinner } from 'react-bootstrap';
import { FiArrowRight, FiHeadphones, FiHeart, FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addCartItem } from '../services/cartService';
import ShopStreamNavbar from '../components/ShopStreamNavbar';
import ShopStreamFooter from '../components/ShopStreamFooter';

const colors = [
  { name: 'Midnight Indigo', value: '#3925d5' },
  { name: 'Graphite', value: '#383b3d' },
  { name: 'Cloud White', value: '#ffffff' },
];

const formatCategory = (category) => category?.replaceAll('-', ' ') || 'Products';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedError, setRelatedError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [activeTab, setActiveTab] = useState('specifications');
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadProduct = async () => {
      setLoading(true);
      setError('');
      setRelatedError('');
      setProduct(null);
      setRelatedProducts([]);

      try {
        const response = await fetch(`https://dummyjson.com/products/${id}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          throw new Error('Product not found.');
        }

        if (!response.ok) {
          throw new Error(`Product request failed with status ${response.status}.`);
        }

        const data = await response.json();
        setProduct(data);
        setActiveImage(data.images?.[0] || data.thumbnail || '');

        try {
          const relatedResponse = await fetch(
            `https://dummyjson.com/products/category/${encodeURIComponent(data.category)}?limit=5`,
            { signal: controller.signal },
          );

          if (!relatedResponse.ok) {
            throw new Error(`Related products request failed with status ${relatedResponse.status}.`);
          }
          const relatedData = await relatedResponse.json();
          setRelatedProducts(
            (relatedData.products || []).filter((item) => item.id !== data.id).slice(0, 4),
          );
        } catch (relatedRequestError) {
          if (relatedRequestError.name !== 'AbortError') {
            setRelatedError('Recommended products could not be loaded.');
          }
        }
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'We could not load this product. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => controller.abort();
  }, [id]);

  const images = useMemo(() => {
    if (!product) {
      return [];
    }

    return [...new Set([...(product.images || []), product.thumbnail].filter(Boolean))];
  }, [product]);

  const discount = Math.round(product?.discountPercentage || 0);
  const originalPrice = product
    ? product.price / (1 - (product.discountPercentage || 0) / 100)
    : 0;
  const reviewCount = product?.reviews?.length || 128;
  const rating = Number(product?.rating || 0);

  const handleAddToCart = () => {
    try {
      addCartItem(product, quantity);
      setCartError('');
      setCartMessage(`${quantity} × ${product.title} added to your cart.`);
    } catch {
      setCartMessage('');
      setCartError('We could not add this item to your cart. Please try again.');
    }
  };

  const handleBuyNow = () => {
    try {
      addCartItem(product, quantity);
      navigate('/cart');
    } catch {
      setCartMessage('');
      setCartError('We could not add this item to your cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" variant="primary" aria-label="Loading product details" />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Product not found.'}</Alert>
        <Button as={Link} to="/products" variant="primary">Back to Products</Button>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: '#f7f8ff', color: '#182234' }}>
      <ShopStreamNavbar />

      <main>
        <Container fluid className="px-3 px-lg-4 py-4">
          <nav aria-label="Breadcrumb" className="small mb-4">
            <Link to="/" className="text-secondary text-decoration-none">Home</Link>
            <span className="mx-2 text-secondary" aria-hidden="true">›</span>
            <Link to="/products" className="text-secondary text-decoration-none text-capitalize">
              {formatCategory(product.category)}
            </Link>
            <span className="mx-2 text-secondary" aria-hidden="true">›</span>
            <span className="fw-semibold">{product.title}</span>
          </nav>

          {cartMessage && (
            <Alert variant="success" dismissible onClose={() => setCartMessage('')}>
              {cartMessage} <Alert.Link as={Link} to="/cart">View cart</Alert.Link>
            </Alert>
          )}
          {cartError && (
            <Alert variant="danger" dismissible onClose={() => setCartError('')}>
              {cartError}
            </Alert>
          )}

          <Row className="g-4 g-xl-5">
            <Col lg={7}>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <div className="d-flex flex-sm-column gap-2 order-2 order-sm-1 overflow-auto">
                  {images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      aria-label={`Show product image ${index + 1}`}
                      aria-pressed={activeImage === image}
                      className="flex-shrink-0 rounded-3 bg-white p-1"
                      style={{
                        width: '64px',
                        height: '64px',
                        border: activeImage === image ? '2px solid #3925d5' : '1px solid #d6d9e8',
                      }}
                    >
                      <img src={image} alt="" className="w-100 h-100 rounded-2" style={{ objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>

                <div
                  className="position-relative flex-grow-1 rounded-3 border bg-white p-3 p-md-4 order-1 order-sm-2"
                  style={{ minHeight: '340px', height: 'min(55vw, 480px)' }}
                >
                  <img
                    src={activeImage || product.thumbnail}
                    alt={product.title}
                    className="w-100 h-100"
                    style={{ objectFit: 'contain' }}
                  />
                  <Button
                    type="button"
                    variant="light"
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={isFavorite}
                    onClick={() => setIsFavorite((favorite) => !favorite)}
                    className="position-absolute top-0 end-0 m-3 rounded-circle shadow-sm"
                  >
                    <FiHeart style={{ color: isFavorite ? '#dc3545' : '#3925d5', fontSize: '1.1rem' }} fill={isFavorite ? 'currentColor' : 'none'} />
                  </Button>
                </div>
              </div>
            </Col>

            <Col lg={5}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge rounded-pill px-2 py-2" style={{ backgroundColor: '#66efbd', color: '#07583f' }}>
                  New Arrival
                </span>
                <span className="small text-secondary">SKU: SS-{String(product.id).padStart(5, '0')}</span>
              </div>
              <h1 className="h2 fw-bold mb-2">{product.title}</h1>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="text-success" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
                  {'★'.repeat(Math.max(0, Math.round(rating)))}
                  <span className="text-secondary">{'★'.repeat(Math.max(0, 5 - Math.round(rating)))}</span>
                </span>
                <span className="small fw-semibold">{rating.toFixed(1)}</span>
                <a href="#product-reviews" className="small text-secondary"> {reviewCount} Reviews</a>
              </div>

              <div className="d-flex flex-wrap align-items-baseline gap-2 mb-1">
                <span className="display-6 fw-bold">${product.price.toFixed(2)}</span>
                {discount > 0 && (
                  <>
                    <span className="small text-secondary text-decoration-line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <span className="small fw-semibold text-success">({discount}% OFF)</span>
                  </>
                )}
              </div>
              <p className="small text-secondary mb-4">
                Shipping calculated at checkout. Free shipping on orders over $100.
              </p>
              <hr />
              <p className="text-secondary small lh-lg mb-4">{product.description}</p>

              <div className="mb-3">
                <h2 className="small fw-semibold mb-2">Select Color: {selectedColor.name}</h2>
                <div className="d-flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      aria-label={color.name}
                      aria-pressed={selectedColor.name === color.name}
                      onClick={() => setSelectedColor(color)}
                      className="rounded-circle"
                      style={{
                        width: '27px',
                        height: '27px',
                        backgroundColor: color.value,
                        border: selectedColor.name === color.name ? '3px solid #aeb8ff' : '2px solid #d9deeb',
                        boxShadow: selectedColor.name === color.name ? '0 0 0 2px #3925d5' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="small fw-semibold d-block mb-2" htmlFor="product-quantity">Quantity</label>
                <div className="d-flex flex-column flex-sm-row gap-2">
                  <div className="d-flex align-items-center justify-content-between border rounded-2 px-2" style={{ minWidth: '110px' }}>
                    <Button
                      variant="link"
                      aria-label="Decrease quantity"
                      className="text-dark text-decoration-none px-1"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    >
                      −
                    </Button>
                    <span id="product-quantity" className="small fw-semibold" aria-live="polite">{quantity}</span>
                    <Button
                      variant="link"
                      aria-label="Increase quantity"
                      className="text-dark text-decoration-none px-1"
                      disabled={product.stock > 0 && quantity >= product.stock}
                      onClick={() => setQuantity((value) => value + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    className="flex-grow-1 fw-semibold"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    style={{ backgroundColor: '#3825d5', borderColor: '#3825d5' }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
              <Button
                className="w-100 fw-semibold mb-4"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                style={{ backgroundColor: '#08794e', borderColor: '#08794e' }}
              >
                Buy Now
              </Button>

              <Row className="g-3 small">
                <Col xs={6}><FiShield className="text-success me-2" aria-hidden="true" />2 Year Warranty</Col>
                <Col xs={6}><FiTruck className="text-success me-2" aria-hidden="true" />Fast 2-Day Delivery</Col>
                <Col xs={6}><FiRefreshCw className="text-success me-2" aria-hidden="true" />30-Day Returns</Col>
                <Col xs={6}><FiHeadphones className="text-success me-2" aria-hidden="true" />Lifetime Support</Col>
              </Row>
              {product.stock > 0 && product.stock <= 10 && (
                <p className="small text-danger mt-3 mb-0">Only {product.stock} left in stock.</p>
              )}
            </Col>
          </Row>

          <section className="mt-5 pt-4" id="product-reviews">
            <Nav
              variant="underline"
              activeKey={activeTab}
              onSelect={(key) => key && setActiveTab(key)}
              className="border-bottom mb-4"
              aria-label="Product information"
            >
              <Nav.Item><Nav.Link eventKey="specifications">Specifications</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="reviews">User Reviews</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="questions">Q&amp;A</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="downloads">Downloads</Nav.Link></Nav.Item>
            </Nav>

            {activeTab === 'specifications' && (
              <Row className="g-3">
                <Col md={4}>
                  <Card className="h-100 border rounded-3 p-3" style={{ backgroundColor: '#eef2ff' }}>
                    <h2 className="h6 fw-bold mb-3">Product Details</h2>
                    <div className="d-flex justify-content-between gap-2 small mb-2">
                      <span className="text-secondary">Brand</span><strong>{product.brand || 'ShopStream'}</strong>
                    </div>
                    <div className="d-flex justify-content-between gap-2 small mb-2">
                      <span className="text-secondary">Category</span><strong className="text-capitalize">{formatCategory(product.category)}</strong>
                    </div>
                    <div className="d-flex justify-content-between gap-2 small">
                      <span className="text-secondary">Availability</span><strong>{product.stock > 0 ? 'In stock' : 'Out of stock'}</strong>
                    </div>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100 border rounded-3 p-3" style={{ backgroundColor: '#eef2ff' }}>
                    <h2 className="h6 fw-bold mb-3">Shipping &amp; Returns</h2>
                    <p className="text-secondary small mb-2">{product.shippingInformation || 'Fast, reliable delivery right to your door.'}</p>
                    <p className="text-secondary small mb-0">{product.returnPolicy || 'Easy 30-day returns for peace of mind.'}</p>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100 border rounded-3 p-3" style={{ backgroundColor: '#eef2ff' }}>
                    <h2 className="h6 fw-bold mb-3">In the Box</h2>
                    <p className="text-secondary small mb-3">Everything you need to enjoy your new {product.title}.</p>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge text-dark fw-normal" style={{ backgroundColor: '#dce5f7' }}>Product</span>
                      <span className="badge text-dark fw-normal" style={{ backgroundColor: '#dce5f7' }}>Care guide</span>
                      <span className="badge text-dark fw-normal" style={{ backgroundColor: '#dce5f7' }}>Warranty</span>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}

            {activeTab === 'reviews' && (
              <Card className="border rounded-3 p-4" style={{ backgroundColor: '#eef2ff' }}>
                <h2 className="h5 fw-bold">Customer Reviews</h2>
                {product.reviews?.length ? (
                  product.reviews.map((review, index) => (
                    <div key={`${review.reviewerEmail || review.reviewerName}-${index}`} className="border-bottom py-3">
                      <div className="d-flex justify-content-between gap-3">
                        <strong className="small">{review.reviewerName || 'Verified customer'}</strong>
                        <span className="small text-success">{'★'.repeat(Math.round(review.rating || 0))}</span>
                      </div>
                      <p className="text-secondary small mt-2 mb-1">{review.comment}</p>
                      <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        {review.date ? new Date(review.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary small mb-0">Rated {rating.toFixed(1)} out of 5 by {reviewCount} customers.</p>
                )}
              </Card>
            )}

            {activeTab === 'questions' && (
              <Card className="border rounded-3 p-4" style={{ backgroundColor: '#eef2ff' }}>
                <h2 className="h5 fw-bold">Questions &amp; Answers</h2>
                <p className="text-secondary small mb-0">
                  Need help with this product? Our support team is here to help you choose with confidence.
                </p>
              </Card>
            )}

            {activeTab === 'downloads' && (
              <Card className="border rounded-3 p-4" style={{ backgroundColor: '#eef2ff' }}>
                <h2 className="h5 fw-bold">Product Downloads</h2>
                <p className="text-secondary small mb-0">
                  Product guides and documentation will be available here when provided by the manufacturer.
                </p>
              </Card>
            )}
          </section>

          {relatedError && <Alert variant="warning">{relatedError}</Alert>}
          {relatedProducts.length > 0 && (
            <section className="py-5">
              <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                  <h2 className="h3 fw-bold mb-1">Complete Your Setup</h2>
                  <p className="text-secondary small mb-0">Recommended products based on your interest.</p>
                </div>
                <Link to="/products" className="small text-decoration-none fw-semibold" style={{ color: '#3523d2' }}>
                  View All <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
              <Row className="g-3">
                {relatedProducts.map((item) => (
                  <Col key={item.id} xs={6} md={3}>
                    <Card className="h-100 border rounded-3 overflow-hidden">
                      <Link to={`/products/${item.id}`} className="p-2 text-center" style={{ backgroundColor: '#eef2ff' }}>
                        <Card.Img
                          src={item.thumbnail}
                          alt={item.title}
                          style={{ height: '140px', objectFit: 'contain' }}
                        />
                      </Link>
                      <Card.Body className="p-3">
                        <Card.Title
                          as={Link}
                          to={`/products/${item.id}`}
                          className="d-block text-dark text-decoration-none small fw-semibold text-truncate"
                        >
                          {item.title}
                        </Card.Title>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span className="fw-semibold small text-success">${item.price.toFixed(2)}</span>
                          <Button
                            size="sm"
                            aria-label={`View ${item.title}`}
                            as={Link}
                            to={`/products/${item.id}`}
                            style={{ backgroundColor: '#3825d5', borderColor: '#3825d5' }}
                          >
                            View
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>
          )}
        </Container>
      </main>

      <ShopStreamFooter />
    </div>
  );
};

export default ProductDetails;

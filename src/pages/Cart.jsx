import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { FiArrowRight, FiMinus, FiPlus, FiShoppingCart, FiTrash2, FiTruck } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { getCartItems, saveCartItems } from '../services/cartService';
import { fetchProducts } from '../services/productService';
import ShopStreamNavbar from '../components/ShopStreamNavbar';
import ShopStreamFooter from '../components/ShopStreamFooter';

const loadCart = () => {
  try {
    return { items: getCartItems(), error: '' };
  } catch {
    return { items: [], error: 'Your saved cart could not be read. Please refresh the page or clear your browser storage.' };
  }
};

const Cart = () => {
  const navigate = useNavigate();
  const [initialCart] = useState(loadCart);
  const [cartItems, setCartItems] = useState(initialCart.items);
  const [loading, setLoading] = useState(initialCart.items.length > 0);
  const [error, setError] = useState(initialCart.error);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    if (initialCart.items.length === 0) {
      return undefined;
    }

    let active = true;

    const syncCartProducts = async () => {
      try {
        const products = await fetchProducts();
        if (!active) {
          return;
        }

        const productById = new Map(products.map((product) => [product.id, product]));
        const syncedItems = initialCart.items.map((item) => {
          const currentProduct = productById.get(item.id);
          return currentProduct ? { ...currentProduct, quantity: item.quantity || 1 } : item;
        });

        setCartItems(syncedItems);
        setError('');
        try {
          saveCartItems(syncedItems);
          setStorageError('');
        } catch {
          setStorageError('Product details refreshed, but your cart could not be updated in browser storage.');
        }
      } catch {
        if (active) {
          setError('We could not refresh product details. Your saved cart is still available below.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    syncCartProducts();

    return () => {
      active = false;
    };
  }, [initialCart.items]);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price) * Number(item.quantity || 1), 0),
    [cartItems],
  );
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 9.99;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + shipping + estimatedTax;
  const itemCount = cartItems.reduce((count, item) => count + Number(item.quantity || 1), 0);
  const deliveryWindow = useMemo(() => {
    const earliest = new Date();
    const latest = new Date();
    earliest.setDate(earliest.getDate() + 5);
    latest.setDate(latest.getDate() + 7);
    return [earliest, latest].map((date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  }, []);

  const updateQuantity = (id, delta) => {
    const updatedItems = cartItems.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return { ...item, quantity: Math.max(1, Number(item.quantity || 1) + delta) };
    });

    setCartItems(updatedItems);
    try {
      saveCartItems(updatedItems);
      setStorageError('');
    } catch {
      setStorageError('Your cart change could not be saved. Please check your browser storage.');
    }
  };

  const removeItem = (id) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedItems);

    try {
      saveCartItems(updatedItems);
      setStorageError('');
    } catch {
      setStorageError('This item could not be removed from saved cart data. Please check your browser storage.');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f7f8ff', color: '#182234' }}>
      <ShopStreamNavbar />

      <main className="flex-grow-1">
        <Container fluid className="px-3 px-lg-4 py-4 py-md-5">
          <h1 className="h2 fw-bold mb-4">Your Shopping Cart</h1>

          {error && <Alert variant="warning" dismissible onClose={() => setError('')}>{error}</Alert>}
          {storageError && <Alert variant="danger" dismissible onClose={() => setStorageError('')}>{storageError}</Alert>}

          {loading && (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" variant="primary" className="me-2" />
              <span className="small text-secondary">Refreshing product details...</span>
            </div>
          )}

          {cartItems.length === 0 ? (
            <Card className="border rounded-3 py-5 text-center" style={{ borderColor: '#d9dced' }}>
              <Card.Body>
                <FiShoppingCart className="fs-1 mb-2 text-secondary" aria-hidden="true" />
                <h2 className="h5 fw-bold">Your cart is empty</h2>
                <p className="text-secondary mb-3">Find something you love and it will appear here.</p>
                <Button as={Link} to="/products" style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}>
                  Continue Shopping
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-3 g-lg-4 align-items-start">
              <Col lg={8}>
                <div className="d-flex flex-column gap-3">
                  {cartItems.map((item) => (
                    <Card key={item.id} className="border rounded-3" style={{ borderColor: '#d9dced' }}>
                      <Card.Body className="p-3">
                        <Row className="align-items-center g-3">
                          <Col xs="auto">
                            <Link to={`/products/${item.id}`} aria-label={`View ${item.title}`}>
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="rounded-2 bg-light"
                                style={{ width: '98px', height: '98px', objectFit: 'cover' }}
                              />
                            </Link>
                          </Col>
                          <Col className="min-w-0">
                            <Link to={`/products/${item.id}`} className="text-decoration-none text-dark">
                              <h2 className="h5 fw-semibold text-truncate mb-1">{item.title}</h2>
                            </Link>
                            <p className="small text-secondary text-truncate mb-2">
                              {item.brand ? `${item.brand} | ` : ''}{item.description}
                            </p>
                            <div className="d-inline-flex align-items-center border rounded-2 px-1" style={{ backgroundColor: '#f0f3ff' }}>
                              <Button
                                variant="link"
                                aria-label={`Decrease ${item.title} quantity`}
                                className="text-dark text-decoration-none py-0 px-2"
                                disabled={Number(item.quantity || 1) <= 1}
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <FiMinus aria-hidden="true" />
                              </Button>
                              <span className="small fw-semibold px-1" aria-live="polite">{item.quantity || 1}</span>
                              <Button
                                variant="link"
                                aria-label={`Increase ${item.title} quantity`}
                                className="text-dark text-decoration-none py-0 px-2"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <FiPlus aria-hidden="true" />
                              </Button>
                            </div>
                          </Col>
                          <Col xs={12} sm="auto" className="d-flex flex-row flex-sm-column align-items-center align-items-sm-end justify-content-between gap-2">
                            <span className="fw-bold fs-5" style={{ color: '#3925d5' }}>
                              ${(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}
                            </span>
                            <Button
                              variant="link"
                              className="text-danger text-decoration-none p-0 small"
                              onClick={() => removeItem(item.id)}
                            >
                              <FiTrash2 aria-hidden="true" className="me-1" />Remove
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Col>

              <Col lg={4}>
                <Card className="cart-order-summary border rounded-3 position-sticky" style={{ top: '1.5rem', borderColor: '#d9dced', backgroundColor: '#eef2ff' }}>
                  <Card.Body className="p-3 p-md-4">
                    <h2 className="h5 fw-bold mb-3">Order Summary</h2>
                    <p className="small text-secondary mb-3">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                    <div className="d-flex justify-content-between mb-3 text-secondary">
                      <span>Subtotal</span>
                      <span className="fw-semibold text-dark">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 text-secondary">
                      <span>Shipping</span>
                      <span className={`fw-semibold ${shipping === 0 ? 'text-success' : 'text-dark'}`}>
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 text-secondary">
                      <span>Estimated Tax</span>
                      <span className="fw-semibold text-dark">${estimatedTax.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <span className="fw-bold fs-5">Total</span>
                      <span className="fw-bold fs-4" style={{ color: '#3925d5' }}>${total.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-100 py-2 fw-semibold mb-3 shadow-sm"
                      onClick={handleCheckout}
                      disabled={loading}
                      style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}
                    >
                      Proceed to Checkout <FiArrowRight aria-hidden="true" className="ms-1" />
                    </Button>
                    <p className="text-secondary text-center small mb-3">
                      By proceeding to checkout, you agree to ShopStream&apos;s terms and privacy policy.
                    </p>
                    <hr />
                    <div className="d-flex align-items-center gap-3 rounded-2 p-3" style={{ backgroundColor: '#e4edff' }}>
                      <FiTruck className="fs-5 flex-shrink-0" style={{ color: '#3925d5' }} aria-hidden="true" />
                      <div>
                        <p className="small fw-semibold mb-0">Free Express Delivery</p>
                        <p className="small text-secondary mb-0">
                          {deliveryWindow[0]} - {deliveryWindow[1]}
                        </p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </main>

      <ShopStreamFooter />
    </div>
  );
};

export default Cart;

import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { FiArrowRight, FiCheckCircle, FiHelpCircle, FiTruck } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { getCartItems, saveCartItems } from '../services/cartService';
import ShopStreamNavbar from '../components/ShopStreamNavbar';
import ShopStreamFooter from '../components/ShopStreamFooter';

const ORDERS_KEY = 'shopstream-orders';
const LAST_ORDER_KEY = 'shopstream-last-order';
const PROFILE_KEY = 'shopstream-profile';
const ADDRESSES_KEY = 'shopstream-addresses';

const getNextBusinessDays = (days) => {
  const date = new Date();
  let addedDays = 0;

  while (addedDays < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      addedDays += 1;
    }
  }

  return date;
};

const createOrder = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  let profile = {};
  let addresses = [];

  try {
    profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    addresses = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
  } catch {
    profile = {};
    addresses = [];
  }

  const address = addresses[0];
  const recipient = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

  return {
    orderId,
    items,
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
    status: 'Processing',
    date: new Date().toISOString(),
    email: profile.email || '',
    address: address
      ? `${recipient || address.name}\n${address.street}\n${address.city}, ${address.postalCode}`
      : recipient
        ? `${recipient}\nShipping address not provided`
        : 'Shipping address not provided',
    shippingMethod: 'Standard Delivery (3-5 Business Days)',
    estimatedDelivery: getNextBusinessDays(5).toISOString(),
  };
};

const loadOrder = (locationState) => {
  if (locationState?.order) {
    return locationState.order;
  }

  try {
    const lastOrder = localStorage.getItem(LAST_ORDER_KEY);
    if (lastOrder) {
      return JSON.parse(lastOrder);
    }
  } catch {
    return createOrder([]);
  }

  return createOrder(getCartItems());
};

const OrderSuccess = () => {
  const location = useLocation();
  const [order] = useState(() => loadOrder(location.state));
  const [storageError, setStorageError] = useState('');
  const deliveryDate = useMemo(
    () => order.estimatedDelivery ? new Date(order.estimatedDelivery) : getNextBusinessDays(5),
    [order.estimatedDelivery],
  );
  const currency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      if (!Array.isArray(savedOrders)) {
        throw new Error('Invalid order history');
      }

      const alreadySaved = savedOrders.some((savedOrder) => savedOrder.orderId === order.orderId);
      if (!alreadySaved) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...savedOrders]));
      }
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      saveCartItems([]);
    } catch {
      setStorageError('Your order is confirmed, but we could not update your saved order history.');
    }
  }, [order]);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f7f8ff', color: '#182234' }}>
      <ShopStreamNavbar />

      <main className="flex-grow-1">
        <Container fluid className="px-3 px-lg-4 py-4 py-md-5">
          <section className="text-center mb-5">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: '64px', height: '64px', backgroundColor: '#66efbd', color: '#08794e', fontSize: '2rem' }}
              aria-label="Order successful"
            >
              <FiCheckCircle aria-hidden="true" />
            </div>
            <h1 className="display-6 fw-bold mb-2">Thank you for your order!</h1>
            <p className="text-secondary mb-1">
              Your order <span className="fw-semibold text-dark">#{order.orderId}</span> has been placed successfully.
            </p>
            <p className="text-secondary small mb-0">
              {order.email
                ? <>We&apos;ve sent a confirmation to <span style={{ color: '#3925d5' }}>{order.email}</span>.</>
                : 'Your order confirmation is ready.'}
            </p>
          </section>

          {storageError && <Alert variant="warning">{storageError}</Alert>}

          <Row className="g-3">
            <Col lg={8}>
              <Card className="h-100 border rounded-3 p-3 p-md-4" style={{ borderColor: '#d9dced' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h2 className="h5 fw-bold mb-1">Estimated Delivery</h2>
                    <p className="small fw-semibold text-success mb-0">
                      {deliveryDate.toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <FiTruck className="fs-4 text-secondary" aria-hidden="true" />
                </div>

                <div className="d-flex align-items-center justify-content-between mb-4 px-2">
                  {['Placed', 'Processing', 'Shipped'].map((step, index) => (
                    <div key={step} className="d-flex flex-column align-items-center text-center">
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: index === 0 ? '#3925d5' : '#eef2ff',
                          color: index === 0 ? '#fff' : '#69728a',
                        }}
                      >
                        {index === 0 ? '✓' : index === 1 ? '▣' : '⇢'}
                      </span>
                      <span className="small fw-medium">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex align-items-center gap-2 mb-4 px-5" aria-hidden="true">
                  <div className="flex-grow-1 border-top border-primary" />
                  <div className="flex-grow-1 border-top" />
                </div>

                <hr />
                <Row className="g-3">
                  <Col sm={6}>
                    <h3 className="text-uppercase small fw-semibold text-secondary mb-2">Shipping Address</h3>
                    <p className="small mb-0" style={{ whiteSpace: 'pre-line' }}>{order.address || 'Shipping address not provided'}</p>
                  </Col>
                  <Col sm={6}>
                    <h3 className="text-uppercase small fw-semibold text-secondary mb-2">Shipping Method</h3>
                    <p className="small mb-0">{order.shippingMethod || 'Standard Delivery (3-5 Business Days)'}</p>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="h-100 border rounded-3" style={{ borderColor: '#d9dced', backgroundColor: '#eef2ff' }}>
                <Card.Body className="p-3 p-md-4">
                  <h2 className="h5 fw-bold mb-3">Order Summary</h2>
                  <div className="d-flex flex-column gap-3 mb-3">
                    {(order.items || []).map((item) => (
                      <div key={item.id} className="d-flex align-items-center gap-3">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="rounded-2 bg-white"
                          style={{ width: '52px', height: '52px', objectFit: 'contain' }}
                        />
                        <div className="flex-grow-1">
                          <h3 className="small fw-semibold mb-1">{item.title}</h3>
                          <p className="text-secondary mb-0" style={{ fontSize: '0.75rem' }}>
                            Qty: {item.quantity} · {item.brand || 'ShopStream'}
                          </p>
                        </div>
                        <span className="small fw-semibold">{currency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {(!order.items || order.items.length === 0) && (
                      <p className="text-secondary small mb-0">No item details are available for this order.</p>
                    )}
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Subtotal</span><span>{currency(order.subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Shipping</span>
                    {Number(order.shipping) === 0
                      ? <Badge bg="success">FREE</Badge>
                      : <span>{currency(order.shipping)}</span>}
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Tax</span><span>{currency(order.tax)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold fs-5">Total</span>
                    <span className="fs-5 fw-semibold" style={{ color: '#3925d5' }}>{currency(order.total)}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 my-4">
            <Button as={Link} to="/products" className="px-4 py-2" style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}>
              Continue Shopping <FiArrowRight className="ms-1" aria-hidden="true" />
            </Button>
            <Button as={Link} to="/profile" variant="outline-primary" className="px-4 py-2">
              View Order History
            </Button>
          </div>

          <Alert
            className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 border rounded-3 px-3 py-3 mb-0"
            style={{ backgroundColor: '#ddfbf1', borderColor: '#8debc9', color: '#182234' }}
          >
            <div className="d-flex align-items-center gap-3">
              <span className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: '#66efbd', color: '#07583f' }}>
                <FiHelpCircle aria-hidden="true" />
              </span>
              <div>
                <p className="small fw-medium mb-1">Need help with your order?</p>
                <p className="small text-secondary mb-0">Our support team is available 24/7. Reference order #{order.orderId} when contacting us.</p>
              </div>
            </div>
            <Button
              as="a"
              href="mailto:support@shopstream.example"
              className="px-4"
              style={{ backgroundColor: '#08794e', borderColor: '#08794e' }}
            >
              Contact Support
            </Button>
          </Alert>
        </Container>
      </main>

      <ShopStreamFooter />
    </div>
  );
};

export default OrderSuccess;

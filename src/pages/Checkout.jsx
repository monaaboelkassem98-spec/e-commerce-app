import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FiArrowRight, FiCreditCard, FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { getCartItems } from '../services/cartService';
import ShopStreamNavbar from '../components/ShopStreamNavbar';
import ShopStreamFooter from '../components/ShopStreamFooter';

const PROFILE_KEY = 'shopstream-profile';
const ADDRESSES_KEY = 'shopstream-addresses';

const readStoredValue = (key, fallback) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
};

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

const createInitialShipping = () => {
  const profile = readStoredValue(PROFILE_KEY, {});
  const addresses = readStoredValue(ADDRESSES_KEY, []);
  const address = Array.isArray(addresses) ? addresses[0] || {} : {};

  return {
    fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || address.name || '',
    email: profile.email || '',
    phone: profile.phone || address.phone || '',
    address: address.street || '',
    city: address.city || '',
    zipCode: address.postalCode || '',
    country: address.country || '',
  };
};

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems] = useState(() => getCartItems());
  const [shippingInfo, setShippingInfo] = useState(createInitialShipping);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingInfo, setBillingInfo] = useState({
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0),
    [cartItems],
  );
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  const updateShippingInfo = (event) => {
    const { name, value } = event.target;
    setShippingInfo((current) => ({ ...current, [name]: value }));
  };

  const handlePlaceOrder = (event) => {
    event.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Your cart is empty. Add products before placing an order.');
      return;
    }

    setSubmitting(true);

    const customerName = shippingInfo.fullName.trim();
    const [firstName, ...lastNameParts] = customerName.split(/\s+/);
    const order = {
      orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      items: cartItems,
      subtotal,
      shipping,
      tax,
      total,
      status: 'Processing',
      date: new Date().toISOString(),
      email: shippingInfo.email.trim(),
      phone: shippingInfo.phone.trim(),
      address: `${customerName}\n${shippingInfo.address.trim()}\n${shippingInfo.city.trim()}, ${shippingInfo.zipCode.trim()}\n${shippingInfo.country}`,
      shippingMethod: 'Standard Delivery (3-5 Business Days)',
      estimatedDelivery: getNextBusinessDays(5).toISOString(),
      paymentMethod,
    };

    const profile = {
      ...readStoredValue(PROFILE_KEY, {}),
      firstName,
      lastName: lastNameParts.join(' '),
      email: shippingInfo.email.trim(),
      phone: shippingInfo.phone.trim(),
    };
    const addresses = readStoredValue(ADDRESSES_KEY, []);
    const savedAddresses = Array.isArray(addresses) ? addresses : [];
    const nextAddress = {
      id: Date.now(),
      name: customerName,
      street: shippingInfo.address.trim(),
      city: shippingInfo.city.trim(),
      postalCode: shippingInfo.zipCode.trim(),
      country: shippingInfo.country,
      phone: shippingInfo.phone.trim(),
    };
    const nextAddresses = [
      nextAddress,
      ...savedAddresses.filter((address) => (
        address.street !== nextAddress.street
        || address.city !== nextAddress.city
        || address.postalCode !== nextAddress.postalCode
      )),
    ];

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      localStorage.setItem(ADDRESSES_KEY, JSON.stringify(nextAddresses));
      navigate('/order-success', { state: { order } });
    } catch {
      setSubmitting(false);
      setError('We could not save your order information. Check your browser storage and try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f7f8ff' }}>
        <ShopStreamNavbar />
        <Container className="py-5 flex-grow-1">
          <Alert variant="info" className="text-center p-4">
            <h1 className="h5 fw-bold">Your cart is empty</h1>
            <p className="mb-3">Add something you love before heading to checkout.</p>
            <Button as={Link} to="/products" style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}>
              Explore Products
            </Button>
          </Alert>
        </Container>
        <ShopStreamFooter />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f7f8ff', color: '#182234' }}>
      <ShopStreamNavbar />

      <main className="flex-grow-1">
        <Container fluid className="px-3 px-lg-4 py-4">
          <div className="mb-4">
            <h1 className="h3 fw-bold mb-1">Secure Checkout</h1>
            <p className="small text-secondary mb-0">Complete your order with ShopStream&apos;s verified protection.</p>
          </div>

          <Row className="g-4 align-items-start">
            <Col lg={8}>
              <div className="d-flex align-items-center gap-2 gap-md-3 mb-4 small">
                <span className="d-flex align-items-center gap-2 fw-semibold" style={{ color: '#3925d5' }}>
                  <Badge pill style={{ backgroundColor: '#3925d5' }}>1</Badge> Shipping
                </span>
                <span className="border-top flex-grow-1" />
                <span className="d-flex align-items-center gap-2 text-secondary">
                  <Badge pill bg="light" text="dark" className="border">2</Badge> Payment
                </span>
                <span className="border-top flex-grow-1" />
                <span className="d-flex align-items-center gap-2 text-secondary">
                  <Badge pill bg="light" text="dark" className="border">3</Badge> Review
                </span>
              </div>

              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

              <Form onSubmit={handlePlaceOrder}>
                <Card className="border rounded-3 mb-3" style={{ borderColor: '#d9dced' }}>
                  <Card.Body className="p-3 p-md-4">
                    <h2 className="h5 fw-bold mb-3"><FiTruck className="me-2" style={{ color: '#3925d5' }} aria-hidden="true" />Shipping Information</h2>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group controlId="checkout-full-name">
                          <Form.Label className="small fw-semibold">Full Name</Form.Label>
                          <Form.Control name="fullName" value={shippingInfo.fullName} onChange={updateShippingInfo} placeholder="Alex Johnson" autoComplete="name" required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="checkout-email">
                          <Form.Label className="small fw-semibold">Email</Form.Label>
                          <Form.Control type="email" name="email" value={shippingInfo.email} onChange={updateShippingInfo} placeholder="alex@example.com" autoComplete="email" required />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group controlId="checkout-address">
                          <Form.Label className="small fw-semibold">Address</Form.Label>
                          <Form.Control name="address" value={shippingInfo.address} onChange={updateShippingInfo} placeholder="123 Commerce Way" autoComplete="street-address" required />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="checkout-city">
                          <Form.Label className="small fw-semibold">City</Form.Label>
                          <Form.Control name="city" value={shippingInfo.city} onChange={updateShippingInfo} placeholder="New York" autoComplete="address-level2" required />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="checkout-zip">
                          <Form.Label className="small fw-semibold">Zip Code</Form.Label>
                          <Form.Control name="zipCode" value={shippingInfo.zipCode} onChange={updateShippingInfo} placeholder="10001" autoComplete="postal-code" required />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="checkout-phone">
                          <Form.Label className="small fw-semibold">Phone Number</Form.Label>
                          <Form.Control type="tel" name="phone" value={shippingInfo.phone} onChange={updateShippingInfo} placeholder="+1 (555) 000-0000" autoComplete="tel" required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="checkout-country">
                          <Form.Label className="small fw-semibold">Country</Form.Label>
                          <Form.Select name="country" value={shippingInfo.country} onChange={updateShippingInfo} autoComplete="country-name" required>
                            <option value="">Select a country</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Australia">Australia</option>
                            <option value="Egypt">Egypt</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Check
                      type="checkbox"
                      id="billing-same-address"
                      label="Billing address is the same as shipping"
                      checked={billingSameAsShipping}
                      onChange={(event) => setBillingSameAsShipping(event.target.checked)}
                      className="mt-3 small"
                    />
                    {!billingSameAsShipping && (
                      <Row className="g-3 mt-1">
                        <Col md={12}>
                          <Form.Group controlId="billing-address">
                            <Form.Label className="small fw-semibold">Billing Address</Form.Label>
                            <Form.Control value={billingInfo.address} onChange={(event) => setBillingInfo({ ...billingInfo, address: event.target.value })} placeholder="Street address" required />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="billing-city">
                            <Form.Label className="small fw-semibold">City</Form.Label>
                            <Form.Control value={billingInfo.city} onChange={(event) => setBillingInfo({ ...billingInfo, city: event.target.value })} required />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="billing-zip">
                            <Form.Label className="small fw-semibold">Zip Code</Form.Label>
                            <Form.Control value={billingInfo.zipCode} onChange={(event) => setBillingInfo({ ...billingInfo, zipCode: event.target.value })} required />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="billing-country">
                            <Form.Label className="small fw-semibold">Country</Form.Label>
                            <Form.Select value={billingInfo.country} onChange={(event) => setBillingInfo({ ...billingInfo, country: event.target.value })} required>
                              <option value="">Select a country</option>
                              <option value="United States">United States</option>
                              <option value="Canada">Canada</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Australia">Australia</option>
                              <option value="Egypt">Egypt</option>
                              <option value="Germany">Germany</option>
                              <option value="France">France</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>

                <Card className="border rounded-3 mb-3" style={{ borderColor: '#d9dced' }}>
                  <Card.Body className="p-3 p-md-4">
                    <h2 className="h5 fw-bold mb-3"><FiCreditCard className="me-2" style={{ color: '#3925d5' }} aria-hidden="true" />Payment Method</h2>
                    <div className="d-flex flex-column gap-2">
                      <div className={`border rounded-2 p-3 ${paymentMethod === 'card' ? 'border-primary border-2' : ''}`}>
                        <Form.Check
                          type="radio"
                          name="payment-method"
                          id="payment-card"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(event) => setPaymentMethod(event.target.value)}
                          label={<span className="small fw-semibold">Credit or Debit Card</span>}
                        />
                        {paymentMethod === 'card' && (
                          <div className="mt-3">
                            <Form.Group controlId="card-number" className="mb-3">
                              <Form.Label className="small fw-semibold">Card Number</Form.Label>
                              <Form.Control
                                inputMode="numeric"
                                autoComplete="cc-number"
                                value={cardInfo.number}
                                onChange={(event) => setCardInfo({ ...cardInfo, number: event.target.value.replace(/[^\d ]/g, '').slice(0, 23) })}
                                placeholder="0000 0000 0000 0000"
                                pattern="[0-9 ]{12,23}"
                                minLength={12}
                                maxLength={23}
                                required
                              />
                            </Form.Group>
                            <Row className="g-3">
                              <Col sm={6}>
                                <Form.Group controlId="card-expiry">
                                  <Form.Label className="small fw-semibold">Expiry Date</Form.Label>
                                  <Form.Control
                                    autoComplete="cc-exp"
                                    value={cardInfo.expiry}
                                    onChange={(event) => setCardInfo({ ...cardInfo, expiry: event.target.value.slice(0, 5) })}
                                    placeholder="MM/YY"
                                    pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                                    required
                                  />
                                </Form.Group>
                              </Col>
                              <Col sm={6}>
                                <Form.Group controlId="card-cvv">
                                  <Form.Label className="small fw-semibold">CVV</Form.Label>
                                  <Form.Control
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                    value={cardInfo.cvv}
                                    onChange={(event) => setCardInfo({ ...cardInfo, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) })}
                                    placeholder="123"
                                    pattern="[0-9]{3,4}"
                                    minLength={3}
                                    maxLength={4}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                          </div>
                        )}
                      </div>

                      {[
                        { id: 'paypal', label: 'PayPal' },
                        { id: 'cash', label: 'Cash on Delivery' },
                      ].map((method) => (
                        <div key={method.id} className={`border rounded-2 p-3 ${paymentMethod === method.id ? 'border-primary border-2' : ''}`}>
                          <Form.Check
                            type="radio"
                            name="payment-method"
                            id={`payment-${method.id}`}
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(event) => setPaymentMethod(event.target.value)}
                            label={<span className="small fw-semibold">{method.label}</span>}
                          />
                          {paymentMethod === method.id && method.id === 'paypal' && (
                            <p className="small text-secondary ms-4 mt-2 mb-0">
                              You&apos;ll continue with PayPal after placing this demo order.
                            </p>
                          )}
                          {paymentMethod === method.id && method.id === 'cash' && (
                            <p className="small text-secondary ms-4 mt-2 mb-0">
                              Pay the delivery partner when your order arrives.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 fw-semibold"
                    style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}
                  >
                    {submitting ? <><Spinner size="sm" className="me-2" />Placing Order</> : <>Place Order <FiArrowRight className="ms-2" aria-hidden="true" /></>}
                  </Button>
                </div>
              </Form>
            </Col>

            <Col lg={4}>
              <Card className="checkout-order-summary border rounded-3 position-sticky" style={{ top: '1.5rem', borderColor: '#d9dced', backgroundColor: '#e5edfc' }}>
                <Card.Body className="p-3 p-md-4">
                  <h2 className="h5 fw-bold mb-3">Order Summary</h2>
                  <p className="small text-secondary mb-3">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                  <div className="d-flex flex-column gap-3 mb-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="d-flex align-items-center gap-2">
                        <img src={item.thumbnail} alt={item.title} className="rounded-2 bg-white" style={{ width: '58px', height: '58px', objectFit: 'contain' }} />
                        <div className="flex-grow-1 min-w-0">
                          <h3 className="small fw-semibold text-truncate mb-1">{item.title}</h3>
                          <p className="small text-secondary mb-0">Qty: {item.quantity || 1}</p>
                        </div>
                        <span className="small fw-bold">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Subtotal</span><span>{`$${subtotal.toFixed(2)}`}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Shipping</span>
                    {shipping === 0 ? <Badge bg="success">FREE</Badge> : <span>{`$${shipping.toFixed(2)}`}</span>}
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Tax (Est.)</span><span>{`$${tax.toFixed(2)}`}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold fs-5">Total</span>
                    <span className="fw-bold fs-5" style={{ color: '#3925d5' }}>{`$${total.toFixed(2)}`}</span>
                  </div>
                  <Alert className="small mb-0 py-2" style={{ backgroundColor: '#d2f7ec', borderColor: '#b8eddd', color: '#08794e' }}>
                    <div><FiShield className="me-2" aria-hidden="true" />256-bit SSL Secure Payment</div>
                    <div className="mt-1"><FiRefreshCw className="me-2" aria-hidden="true" />30-Day Money Back Guarantee</div>
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>

      <ShopStreamFooter />
    </div>
  );
};

export default Checkout;

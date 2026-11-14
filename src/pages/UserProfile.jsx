import { useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { FiCreditCard, FiEdit2, FiLogOut, FiMapPin, FiSettings, FiShoppingBag, FiClock, FiUser } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import ShopStreamNavbar from '../components/ShopStreamNavbar';
import ShopStreamFooter from '../components/ShopStreamFooter';

const PROFILE_KEY = 'shopstream-profile';
const ORDERS_KEY = 'shopstream-orders';
const ADDRESSES_KEY = 'shopstream-addresses';
const PAYMENTS_KEY = 'shopstream-payments';
const SETTINGS_KEY = 'shopstream-settings';

const defaultProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: '',
};

const sections = [
  { id: 'profile', label: 'My Profile', icon: FiUser },
  { id: 'orders', label: 'Order History', icon: FiClock },
  { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin },
  { id: 'payments', label: 'Payment Methods', icon: FiCreditCard },
  { id: 'settings', label: 'Account Settings', icon: FiSettings },
];

const readStoredValue = (key, fallback) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : fallback;
};

const loadAccountData = () => {
  try {
    const savedProfile = readStoredValue(PROFILE_KEY, null);
    const user = readStoredValue('user', {});
    const orders = readStoredValue(ORDERS_KEY, []);
    const addresses = readStoredValue(ADDRESSES_KEY, []);
    const payments = readStoredValue(PAYMENTS_KEY, []);
    const settings = readStoredValue(SETTINGS_KEY, {});

    if (![orders, addresses, payments].every(Array.isArray)) {
      throw new Error('Invalid saved account data');
    }

    return {
      profile: {
        firstName: savedProfile?.firstName ?? user.firstName ?? '',
        lastName: savedProfile?.lastName ?? user.lastName ?? '',
        email: savedProfile?.email ?? user.email ?? '',
        phone: savedProfile?.phone ?? user.phone ?? '',
        avatar: savedProfile?.avatar ?? user.image ?? '',
      },
      orders,
      addresses,
      payments,
      settings: { orderUpdates: true, offers: false, ...settings },
      error: '',
    };
  } catch {
    return {
      profile: defaultProfile,
      orders: [],
      addresses: [],
      payments: [],
      settings: { orderUpdates: true, offers: false },
      error: 'We could not load your saved account information. Please check your browser storage and reload.',
    };
  }
};

const UserProfile = () => {
  const navigate = useNavigate();
  const avatarInput = useRef(null);
  const [accountData] = useState(loadAccountData);
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState(accountData.profile);
  const [orders] = useState(accountData.orders);
  const [addresses, setAddresses] = useState(accountData.addresses);
  const [payments, setPayments] = useState(accountData.payments);
  const [settings, setSettings] = useState(accountData.settings);
  const [addressForm, setAddressForm] = useState({ name: '', street: '', city: '', postalCode: '' });
  const [paymentForm, setPaymentForm] = useState({ name: '', lastFour: '' });
  const [error, setError] = useState(accountData.error);
  const [success, setSuccess] = useState('');

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'ShopStream Member';
  const initials = fullName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const totalSpent = useMemo(
    () => orders.reduce((total, order) => total + Number(order.total || 0), 0),
    [orders],
  );
  const loyaltyPoints = Math.floor(totalSpent / 10);
  const recentOrders = [...orders].slice(0, 4);

  const persistValue = (key, value, successMessage) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setError('');
      setSuccess(successMessage);
      return true;
    } catch {
      setSuccess('');
      setError('Your changes could not be saved. Please check available browser storage and try again.');
      return false;
    }
  };

  const updateProfileField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = (event) => {
    event.preventDefault();
    persistValue(PROFILE_KEY, profile, 'Your profile details have been saved.');
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Please choose an image smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const updatedProfile = { ...profile, avatar: reader.result };
      if (persistValue(PROFILE_KEY, updatedProfile, 'Your profile photo has been updated.')) {
        setProfile(updatedProfile);
      }
    };
    reader.onerror = () => setError('We could not read that image. Please try another file.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const addAddress = (event) => {
    event.preventDefault();
    const updatedAddresses = [...addresses, { ...addressForm, id: Date.now() }];
    if (persistValue(ADDRESSES_KEY, updatedAddresses, 'Your address has been saved.')) {
      setAddresses(updatedAddresses);
      setAddressForm({ name: '', street: '', city: '', postalCode: '' });
    }
  };

  const removeAddress = (id) => {
    const updatedAddresses = addresses.filter((address) => address.id !== id);
    if (persistValue(ADDRESSES_KEY, updatedAddresses, 'The address has been removed.')) {
      setAddresses(updatedAddresses);
    }
  };

  const addPaymentMethod = (event) => {
    event.preventDefault();
    const updatedPayments = [
      ...payments,
      { ...paymentForm, id: Date.now(), lastFour: paymentForm.lastFour.slice(-4) },
    ];
    if (persistValue(PAYMENTS_KEY, updatedPayments, 'Your payment method has been saved.')) {
      setPayments(updatedPayments);
      setPaymentForm({ name: '', lastFour: '' });
    }
  };

  const removePaymentMethod = (id) => {
    const updatedPayments = payments.filter((payment) => payment.id !== id);
    if (persistValue(PAYMENTS_KEY, updatedPayments, 'The payment method has been removed.')) {
      setPayments(updatedPayments);
    }
  };

  const updateSetting = (name, value) => {
    const updatedSettings = { ...settings, [name]: value };
    if (persistValue(SETTINGS_KEY, updatedSettings, 'Your preferences have been saved.')) {
      setSettings(updatedSettings);
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const orderStatusVariant = (status) => {
    const normalizedStatus = String(status || '').toLowerCase();
    if (normalizedStatus === 'delivered') {
      return 'success';
    }
    if (normalizedStatus === 'processing' || normalizedStatus === 'pending') {
      return 'secondary';
    }
    return 'primary';
  };

  const renderOrders = (items) => (
    items.length ? (
      <div>
        {items.map((order) => {
          const orderItems = order.items || order.products || [];
          const firstItem = orderItems[0] || order;
          const orderId = order.orderId || order.id || 'N/A';
          const orderDate = order.date || order.createdAt || order.orderDate;

          return (
            <div key={orderId} className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 p-3 border-bottom">
              <div className="d-flex align-items-center gap-3">
                {firstItem.thumbnail || firstItem.image ? (
                  <img
                    src={firstItem.thumbnail || firstItem.image}
                    alt={firstItem.title || 'Order item'}
                    className="rounded-2 bg-light"
                    style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="rounded-2 d-flex align-items-center justify-content-center bg-light text-secondary" style={{ width: '52px', height: '52px' }}>
                    ▣
                  </div>
                )}
                <div>
                  <h3 className="small fw-semibold mb-1">{firstItem.title || `Order #${orderId}`}</h3>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.75rem' }}>
                    Order #{orderId}{orderDate ? ` · Placed on ${new Date(orderDate).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-3">
                <span className="fw-bold" style={{ color: '#3925d5' }}>
                  ${Number(order.total || firstItem.price || 0).toFixed(2)}
                </span>
                <Badge bg={orderStatusVariant(order.status)} className="rounded-pill px-3 py-2">
                  {order.status || 'Processing'}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-5 px-3">
        <div className="fs-2 mb-2" aria-hidden="true">▣</div>
        <h3 className="h6 fw-semibold">No orders yet</h3>
        <p className="text-secondary small mb-3">Your purchases will appear here once you place an order.</p>
        <Button as={Link} to="/products" size="sm" style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}>
          Explore Products
        </Button>
      </div>
    )
  );

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f7f8ff', color: '#182234' }}>
      <ShopStreamNavbar />

      <main className="flex-grow-1">
        <Container fluid className="px-3 px-lg-4 py-4">
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

          <Row className="g-4">
            <Col lg={3} xl={2}>
              <Card className="border-0 rounded-3 shadow-sm p-3" style={{ backgroundColor: '#eef2ff' }}>
                <h1 className="h6 fw-bold mb-1" style={{ color: '#3925d5' }}>Account</h1>
                <p className="text-secondary small mb-3">Manage your settings</p>
                <hr className="mt-0" />
                <nav className="d-flex flex-column gap-2" aria-label="Account sections">
                  {sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'primary' : 'light'}
                      className="text-start d-flex align-items-center gap-2 border-0 small"
                      onClick={() => {
                        setActiveSection(section.id);
                        setSuccess('');
                        setError('');
                      }}
                      style={activeSection === section.id
                        ? { backgroundColor: '#5140e8' }
                        : { backgroundColor: 'transparent', color: '#40485c' }}
                    >
                      <section.icon aria-hidden="true" />
                      {section.label}
                    </Button>
                  ))}
                </nav>
                <hr />
                <Button variant="link" className="text-danger text-decoration-none text-start small" onClick={signOut}>
                  <FiLogOut className="me-2" aria-hidden="true" /> Sign Out
                </Button>
              </Card>
            </Col>

            <Col lg={9} xl={10}>
              <Card className="border rounded-3 mb-3 p-3 p-md-4" style={{ borderColor: '#e1e3ef', background: 'linear-gradient(110deg, #fff, #f8f9ff)' }}>
                <Row className="align-items-center g-3">
                  <Col xs="auto">
                    <div className="position-relative">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={`${fullName} profile`}
                          className="rounded-circle border bg-white"
                          style={{ width: '82px', height: '82px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: '82px', height: '82px', background: 'linear-gradient(135deg, #3724d3, #73cbb5)', fontSize: '1.5rem' }}
                          aria-label={`${fullName} initials`}
                        >
                          {initials}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => avatarInput.current?.click()}
                        className="position-absolute bottom-0 end-0 rounded-circle border-0 text-white"
                        aria-label="Upload profile photo"
                        style={{ width: '27px', height: '27px', backgroundColor: '#3925d5' }}
                      >
                        <FiEdit2 aria-hidden="true" />
                      </button>
                      <Form.Control
                        ref={avatarInput}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="d-none"
                        aria-label="Choose profile photo"
                      />
                    </div>
                  </Col>
                  <Col>
                    <h2 className="h3 fw-bold mb-1">{fullName}</h2>
                    <p className="text-secondary small mb-2">{profile.email || 'Add an email address to your profile'}</p>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge pill style={{ backgroundColor: '#66efbd', color: '#07583f' }}>ShopStream Member</Badge>
                      <Badge pill bg="light" text="dark">Member since {new Date().getFullYear()}</Badge>
                    </div>
                  </Col>
                  <Col xs={12} md="auto" className="d-flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setActiveSection('profile');
                        document.getElementById('personal-information')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}
                    >
                      Edit Profile
                    </Button>
                    <Button as={Link} to="/products" variant="outline-primary">Continue Shopping</Button>
                  </Col>
                </Row>
              </Card>

              {activeSection === 'profile' && (
                <>
                  <Row className="g-3 mb-3">
                    <Col md={4}>
                      <Card className="h-100 border rounded-3 p-3" style={{ borderColor: '#e1e3ef' }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="rounded-2 px-2 py-1" style={{ backgroundColor: '#e8e8ff', color: '#3925d5' }}><FiShoppingBag /></span>
                          <span className="text-success small">{orders.length ? 'Your account' : 'Start shopping'}</span>
                        </div>
                        <p className="text-secondary small mt-2 mb-1">Total Orders</p>
                        <p className="h4 fw-bold mb-0">{orders.length}</p>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="h-100 border rounded-3 p-3" style={{ borderColor: '#e1e3ef' }}>
                        <span className="align-self-start rounded-2 px-2 py-1" style={{ backgroundColor: '#e4fbf2', color: '#08794e' }}><FiCreditCard /></span>
                        <p className="text-secondary small mt-2 mb-1">Total Spent</p>
                        <p className="h4 fw-bold mb-0">${totalSpent.toFixed(2)}</p>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="h-100 border rounded-3 p-3" style={{ borderColor: '#e1e3ef' }}>
                        <span className="align-self-start rounded-2 px-2 py-1" style={{ backgroundColor: '#e8e8ff', color: '#3925d5' }}>★</span>
                        <p className="text-secondary small mt-2 mb-1">Loyalty Points</p>
                        <p className="h4 fw-bold mb-0">{loyaltyPoints.toLocaleString()}</p>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="border rounded-3 mb-3" id="personal-information" style={{ borderColor: '#e1e3ef' }}>
                    <Card.Header className="bg-white py-3">
                      <h2 className="h5 fw-bold mb-0">Personal Information</h2>
                    </Card.Header>
                    <Card.Body className="p-3 p-md-4">
                      <Form onSubmit={saveProfile}>
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group controlId="profile-first-name">
                              <Form.Label className="small fw-semibold">First Name</Form.Label>
                              <Form.Control name="firstName" value={profile.firstName} onChange={updateProfileField} required />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="profile-last-name">
                              <Form.Label className="small fw-semibold">Last Name</Form.Label>
                              <Form.Control name="lastName" value={profile.lastName} onChange={updateProfileField} required />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="profile-email">
                              <Form.Label className="small fw-semibold">Email Address</Form.Label>
                              <Form.Control type="email" name="email" value={profile.email} onChange={updateProfileField} required />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="profile-phone">
                              <Form.Label className="small fw-semibold">Phone Number</Form.Label>
                              <Form.Control type="tel" name="phone" value={profile.phone} onChange={updateProfileField} placeholder="Add your phone number" />
                            </Form.Group>
                          </Col>
                        </Row>
                        <div className="d-flex justify-content-end mt-4">
                          <Button type="submit" style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}>
                            Save Changes
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>

                  <Card className="border rounded-3 overflow-hidden" style={{ borderColor: '#e1e3ef' }}>
                    <Card.Header className="d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: '#eef2ff' }}>
                      <h2 className="h5 fw-bold mb-0">Recent Orders</h2>
                      <Button variant="link" className="small fw-semibold text-decoration-none p-0" onClick={() => setActiveSection('orders')}>
                        View All
                      </Button>
                    </Card.Header>
                    {renderOrders(recentOrders)}
                  </Card>
                </>
              )}

              {activeSection === 'orders' && (
                <Card className="border rounded-3 overflow-hidden" style={{ borderColor: '#e1e3ef' }}>
                  <Card.Header className="py-3" style={{ backgroundColor: '#eef2ff' }}>
                    <h2 className="h5 fw-bold mb-0">Order History</h2>
                  </Card.Header>
                  {renderOrders(orders)}
                </Card>
              )}

              {activeSection === 'addresses' && (
                <Card className="border rounded-3" style={{ borderColor: '#e1e3ef' }}>
                  <Card.Header className="py-3" style={{ backgroundColor: '#eef2ff' }}>
                    <h2 className="h5 fw-bold mb-0">Saved Addresses</h2>
                  </Card.Header>
                  <Card.Body className="p-3 p-md-4">
                    {addresses.length > 0 && (
                      <Row className="g-3 mb-4">
                        {addresses.map((address) => (
                          <Col md={6} key={address.id}>
                            <Card className="h-100 p-3">
                              <div className="d-flex justify-content-between gap-2">
                                <div>
                                  <h3 className="h6 fw-semibold">{address.name}</h3>
                                  <p className="text-secondary small mb-0">{address.street}<br />{address.city}, {address.postalCode}</p>
                                </div>
                                <Button variant="link" className="text-danger text-decoration-none p-0 small" onClick={() => removeAddress(address.id)}>
                                  Remove
                                </Button>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                    <h3 className="h6 fw-semibold mb-3">Add an Address</h3>
                    <Form onSubmit={addAddress}>
                      <Row className="g-3">
                        <Col md={6}><Form.Control aria-label="Address label" placeholder="Address label (e.g. Home)" value={addressForm.name} onChange={(event) => setAddressForm({ ...addressForm, name: event.target.value })} required /></Col>
                        <Col md={6}><Form.Control aria-label="Street address" placeholder="Street address" value={addressForm.street} onChange={(event) => setAddressForm({ ...addressForm, street: event.target.value })} required /></Col>
                        <Col md={6}><Form.Control aria-label="City" placeholder="City" value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} required /></Col>
                        <Col md={6}><Form.Control aria-label="Postal code" placeholder="Postal code" value={addressForm.postalCode} onChange={(event) => setAddressForm({ ...addressForm, postalCode: event.target.value })} required /></Col>
                      </Row>
                      <Button type="submit" className="mt-3" style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}>Save Address</Button>
                    </Form>
                  </Card.Body>
                </Card>
              )}

              {activeSection === 'payments' && (
                <Card className="border rounded-3" style={{ borderColor: '#e1e3ef' }}>
                  <Card.Header className="py-3" style={{ backgroundColor: '#eef2ff' }}>
                    <h2 className="h5 fw-bold mb-0">Payment Methods</h2>
                  </Card.Header>
                  <Card.Body className="p-3 p-md-4">
                    <Alert variant="info" className="small">
                      For your security, only a payment label and the last four digits are saved here. Never enter your full card number.
                    </Alert>
                    {payments.map((payment) => (
                      <div key={payment.id} className="d-flex justify-content-between align-items-center border rounded-3 p-3 mb-3">
                        <div>
                          <h3 className="small fw-semibold mb-1">{payment.name}</h3>
                          <span className="text-secondary small">•••• {payment.lastFour}</span>
                        </div>
                        <Button variant="link" className="text-danger text-decoration-none small" onClick={() => removePaymentMethod(payment.id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Form onSubmit={addPaymentMethod}>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group controlId="payment-name">
                            <Form.Label className="small fw-semibold">Payment Label</Form.Label>
                            <Form.Control value={paymentForm.name} onChange={(event) => setPaymentForm({ ...paymentForm, name: event.target.value })} placeholder="Personal card" required />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="payment-last-four">
                            <Form.Label className="small fw-semibold">Last Four Digits</Form.Label>
                            <Form.Control inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={paymentForm.lastFour} onChange={(event) => setPaymentForm({ ...paymentForm, lastFour: event.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="1234" required />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Button type="submit" className="mt-3" style={{ backgroundColor: '#3925d5', borderColor: '#3925d5' }}>Add Payment Method</Button>
                    </Form>
                  </Card.Body>
                </Card>
              )}

              {activeSection === 'settings' && (
                <Card className="border rounded-3" style={{ borderColor: '#e1e3ef' }}>
                  <Card.Header className="py-3" style={{ backgroundColor: '#eef2ff' }}>
                    <h2 className="h5 fw-bold mb-0">Account Settings</h2>
                  </Card.Header>
                  <Card.Body className="p-3 p-md-4">
                    <Form.Check
                      type="switch"
                      id="order-updates-setting"
                      label="Receive order updates"
                      checked={settings.orderUpdates}
                      onChange={(event) => updateSetting('orderUpdates', event.target.checked)}
                      className="mb-3"
                    />
                    <Form.Check
                      type="switch"
                      id="offers-setting"
                      label="Receive product news and special offers"
                      checked={settings.offers}
                      onChange={(event) => updateSetting('offers', event.target.checked)}
                      className="mb-4"
                    />
                    <Button variant="outline-danger" onClick={signOut}>Sign Out</Button>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </main>

      <ShopStreamFooter />
    </div>
  );
};

export default UserProfile;

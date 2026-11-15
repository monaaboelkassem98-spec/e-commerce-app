import { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { FaApple, FaGoogle } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import ShopStreamNavbar from '../components/ShopStreamNavbar';
import ShopStreamFooter from '../components/ShopStreamFooter';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms and Privacy Policy');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f7f8ff' }}>
      <ShopStreamNavbar />
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <Container className="d-flex justify-content-center">
          <Card style={{ width: '480px', maxWidth: '100%' }} className="p-4 shadow-sm border rounded-4 bg-white">
            <div className="text-center mb-4">
              <h3 className="fw-bold mb-1">Create Account</h3>
              <p className="text-muted small">Join ShopStream for a personalized shopping experience.</p>
            </div>
        
        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

            <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3" controlId="formFullName">
            <Form.Label className="small fw-semibold text-secondary">Full Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="John Doe" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
              className="py-2"
            />
          </Form.Group>

          <Row className="mb-3">
            <Col xs={12} sm={6}>
              <Form.Group controlId="formUsername">
                <Form.Label className="small fw-semibold text-secondary">Username</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="johndoe" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  className="py-2"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group controlId="formEmail">
                <Form.Label className="small fw-semibold text-secondary">Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="john@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="py-2"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="small fw-semibold text-secondary">Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="********" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="py-2"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label className="small fw-semibold text-secondary">Confirm Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="********" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              className="py-2"
            />
          </Form.Group>

          <div className="mb-3">
            <Form.Check 
              type="checkbox"
              id="agreeTerms"
              label="I agree to the Terms of Service and Privacy Policy"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="small text-muted"
            />
          </div>

          <Button variant="primary" type="submit" className="w-100 py-2 fw-semibold mb-3" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up →'}
          </Button>

          <div className="text-center text-muted small my-3 position-relative">
            <span className="bg-white px-2 position-relative" style={{ zIndex: 1 }}>Or register with</span>
            <hr className="position-absolute w-100 top-50 start-0 m-0" style={{ zIndex: 0 }} />
          </div>

          <Row className="g-2 mb-3">
            <Col xs={6}>
              <Button variant="outline-light" className="w-100 border text-dark bg-white py-2 small fw-semibold">
                <FaGoogle aria-hidden="true" className="me-2" />
                Google
              </Button>
            </Col>
            <Col xs={6}>
              <Button variant="outline-light" className="w-100 border text-dark bg-white py-2 small fw-semibold">
                <FaApple aria-hidden="true" className="me-2" />
                Apple
              </Button>
            </Col>
          </Row>

          <div className="text-center mt-4 small text-muted">
            Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-semibold">Sign In</Link>
          </div>
            </Form>
          </Card>
        </Container>
      </main>
      <ShopStreamFooter />
    </div>
  );
};

export default Register;
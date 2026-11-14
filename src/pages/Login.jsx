import { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { FaApple, FaGoogle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import ShopStreamNavbar from "../components/ShopStreamNavbar";
import ShopStreamFooter from "../components/ShopStreamFooter";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/products");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f7f8ff" }}>
      <ShopStreamNavbar />
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <Container className="d-flex justify-content-center">
          <Card
            style={{ width: "420px", maxWidth: "100%" }}
            className="p-4 shadow-sm border rounded-4 bg-white"
          >
            <div className="text-center mb-4">
              <h3 className="fw-bold mb-1">Welcome Back</h3>
              <p className="text-muted small">
                Please enter your details to sign in.
              </p>
            </div>

            {error && (
          <Alert variant="danger" className="py-2 small">
            {error}
          </Alert>
        )}

            <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label className="small fw-semibold text-secondary">
              Email or Username
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="name@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="py-2"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <div className="d-flex justify-content-between align-items-center">
              <Form.Label className="small fw-semibold text-secondary mb-0">
                Password
              </Form.Label>
              <a
                href="#forgot"
                className="small text-decoration-none text-primary"
              >
                Forgot?
              </a>
            </div>
            <Form.Control
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="py-2 mt-1"
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form.Check
              type="checkbox"
              id="rememberMe"
              label="Stay signed in for 30 days"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="small text-muted"
            />
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-2 fw-semibold mb-3"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </Button>

          <div className="text-center text-muted small my-3 position-relative">
            <span
              className="bg-white px-2 position-relative"
              style={{ zIndex: 1 }}
            >
              Or continue with
            </span>
            <hr
              className="position-absolute w-100 top-50 start-0 m-0"
              style={{ zIndex: 0 }}
            />
          </div>

          <Row className="g-2 mb-3">
            <Col xs={6}>
              <Button
                variant="outline-light"
                className="w-100 border text-dark bg-white py-2 small fw-semibold"
              >
                <FaGoogle aria-hidden="true" className="me-2" />
                Google
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant="outline-light"
                className="w-100 border text-dark bg-white py-2 small fw-semibold"
              >
                <FaApple aria-hidden="true" className="me-2" />
                Apple
              </Button>
            </Col>
          </Row>

          <div className="text-center mt-4 small text-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary text-decoration-none fw-semibold"
            >
              Register
            </Link>
          </div>
            </Form>
          </Card>
        </Container>
      </main>
      <ShopStreamFooter />
    </div>
  );
};

export default Login;

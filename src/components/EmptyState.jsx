import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { FiArrowRight, FiCheckCircle, FiSearch, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = FiShoppingCart,
  title = 'Your cart is feeling light',
  description = "It looks like you haven't added anything to your cart yet. Let's find something special for you.",
  actionLabel = 'Start Shopping',
  actionTo = '/products',
  onAction,
  secondaryLabel,
  secondaryTo,
  tips = [],
  categories = [],
  searchTerm,
  className = '',
}) => (
  <Container className={`py-5 ${className}`}>
    <section className="text-center py-4 py-md-5" aria-labelledby="empty-state-title">
      <div
        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
        style={{ width: '144px', height: '144px', backgroundColor: '#e5ecff', color: '#3925d5' }}
      >
        <Icon size={56} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h1 id="empty-state-title" className="h2 fw-bold mb-2">
        {searchTerm ? `No results for "${searchTerm}"` : title}
      </h1>
      <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '440px' }}>
        {searchTerm ? "We couldn't find exactly what you were looking for." : description}
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-2">
        {onAction ? (
          <Button onClick={onAction} className="px-4 py-2 rounded-pill">
            {actionLabel} <FiArrowRight className="ms-1" aria-hidden="true" />
          </Button>
        ) : (
          <Button as={Link} to={actionTo} className="px-4 py-2 rounded-pill">
            {actionLabel} <FiArrowRight className="ms-1" aria-hidden="true" />
          </Button>
        )}
        {secondaryLabel && secondaryTo && (
          <Button as={Link} to={secondaryTo} variant="outline-primary" className="px-4 py-2 rounded-pill">
            {secondaryLabel}
          </Button>
        )}
      </div>
    </section>

    {(tips.length > 0 || categories.length > 0) && (
      <Row className="g-3 mt-4">
        {tips.length > 0 && (
          <Col lg={8}>
            <Card className="h-100 border-0 rounded-3 p-3 p-md-4" style={{ backgroundColor: '#eef2ff' }}>
              <h2 className="h6 fw-bold mb-3" style={{ color: '#3925d5' }}>Need a quick fix?</h2>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                {tips.map((tip) => (
                  <li key={tip} className="small d-flex align-items-start gap-2">
                    <FiCheckCircle className="text-success flex-shrink-0 mt-1" aria-hidden="true" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        )}
        {categories.length > 0 && (
          <Col xs={12}>
            <h2 className="small fw-bold text-uppercase text-secondary mb-3">Browse popular categories</h2>
            <Row className="g-2">
              {categories.map((category) => (
                <Col key={category.label} xs={6} sm={4} lg>
                  <Button
                    as={Link}
                    to={category.to}
                    variant="light"
                    className="w-100 h-100 rounded-3 py-3"
                    style={{ backgroundColor: '#e5ecff', color: '#3925d5' }}
                  >
                    {category.icon && <category.icon className="d-block mx-auto mb-2" aria-hidden="true" />}
                    <span className="small text-dark">{category.label}</span>
                  </Button>
                </Col>
              ))}
            </Row>
          </Col>
        )}
      </Row>
    )}

    {searchTerm && (
      <div className="text-center mt-4 text-secondary">
        <FiSearch aria-hidden="true" className="me-2" />
        Try another search or browse all products.
      </div>
    )}
  </Container>
);

export default EmptyState;

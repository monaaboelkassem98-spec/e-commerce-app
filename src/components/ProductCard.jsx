import { Card, Button } from 'react-bootstrap';
import { FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { addCartItem } from '../services/cartService';

const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = () => {
    addCartItem(product);
    onAddToCart?.(product);
  };

  return (
    <Card className="h-100 rounded-3 p-2 bg-white" style={{ borderColor: '#e1e3ef' }}>
      <div className="position-relative">
        <Link to={`/products/${product.id}`} aria-label={`View ${product.title}`}>
          <Card.Img
            variant="top"
            src={product.thumbnail}
            alt={product.title}
            style={{ height: '190px', objectFit: 'contain' }}
            className="p-2 bg-light rounded-2"
          />
        </Link>
      </div>
      <Card.Body className="d-flex flex-column px-2 pt-3 pb-2">
        <div>
          <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
            <span className="text-muted small text-uppercase text-truncate" style={{ fontSize: '0.7rem' }}>
              {product.category.replaceAll('-', ' ')}
            </span>
            <span className="small text-nowrap" style={{ color: '#08794e' }}>★ {product.rating?.toFixed(1) || '4.5'}</span>
          </div>
          <Card.Title
            as={Link}
            to={`/products/${product.id}`}
            className="fs-6 fw-semibold text-truncate mb-1 text-decoration-none text-dark"
          >
            {product.title}
          </Card.Title>
          <Card.Text className="text-secondary small mb-3" style={{ fontSize: '0.8rem', minHeight: '2.4em' }}>
            {product.description}
          </Card.Text>
        </div>

        <div className="d-flex justify-content-between align-items-center gap-2 mt-auto">
          <div>
            <div className="fw-semibold small text-success">${product.price.toFixed(2)}</div>
            {product.discountPercentage > 0 && (
              <div className="text-secondary text-decoration-line-through" style={{ fontSize: '0.7rem' }}>
                ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
              </div>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button
              as={Link}
              to={`/products/${product.id}`}
              variant="outline-secondary"
              size="sm"
              className="px-2"
            >
              Details <FiArrowRight aria-hidden="true" className="ms-1" />
            </Button>
            <Button
              size="sm"
              className="px-2 fw-medium"
              onClick={handleAddToCart}
              style={{ backgroundColor: '#3825d5', borderColor: '#3825d5' }}
            >
              <FiShoppingCart aria-hidden="true" className="me-1" /> Add
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
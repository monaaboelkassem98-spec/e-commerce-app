import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Container, Form, Pagination, Row, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ShopStreamNavbar from '../components/ShopStreamNavbar';
import ShopStreamFooter from '../components/ShopStreamFooter';
import { fetchProducts } from '../services/productService';

const PAGE_SIZE = 12;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category');
  const selectedCategories = selectedCategory ? [selectedCategory] : [];
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [minimumRating, setMinimumRating] = useState(0);
  const [maximumPrice, setMaximumPrice] = useState(1000);
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [cartMessage, setCartMessage] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(
    () => window.matchMedia('(min-width: 992px)').matches,
  );

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await fetchProducts();
        if (active) {
          setProducts(data);
        }
      } catch {
        if (active) {
          setError('We could not load the product catalog. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [retryCount]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 992px)');
    const updateFiltersOpen = (event) => setFiltersOpen(event.matches);

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', updateFiltersOpen);
      return () => desktopQuery.removeEventListener('change', updateFiltersOpen);
    }

    desktopQuery.addListener(updateFiltersOpen);
    return () => desktopQuery.removeListener(updateFiltersOpen);
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products],
  );
  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))].sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => (
      product.price <= maximumPrice
      && product.rating >= minimumRating
      && (selectedCategories.length === 0 || selectedCategories.includes(product.category))
      && (selectedBrand === 'all' || product.brand === selectedBrand)
      && (
        !searchQuery.trim()
        || `${product.title} ${product.description} ${product.category} ${product.brand || ''}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      )
    ));

    if (sortOrder === 'price-low') {
      result = [...result].sort((first, second) => first.price - second.price);
    } else if (sortOrder === 'price-high') {
      result = [...result].sort((first, second) => second.price - first.price);
    } else if (sortOrder === 'rating') {
      result = [...result].sort((first, second) => second.rating - first.rating);
    } else {
      result = [...result].sort((first, second) => second.id - first.id);
    }

    return result;
  }, [products, maximumPrice, minimumRating, selectedCategories, selectedBrand, searchQuery, sortOrder]);

  const pageCount = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleCategory = (category) => {
    setCurrentPage(1);
    const updatedParams = new URLSearchParams(searchParams);
    if (selectedCategory === category) {
      updatedParams.delete('category');
    } else {
      updatedParams.set('category', category);
    }
    setSearchParams(updatedParams);
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setSearchParams({});
    setSelectedBrand('all');
    setMinimumRating(0);
    setMaximumPrice(1000);
    setSortOrder('newest');
  };

  const handleAddToCart = (product) => {
    setCartMessage(`${product.title} was added to your cart.`);
  };

  const handleSortChange = (event) => {
    setCurrentPage(1);
    setSortOrder(event.target.value);
  };

  const paginationItems = () => {
    const items = [];
    const start = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
    const end = Math.min(pageCount, start + 4);

    if (start > 1) {
      items.push(<Pagination.Item key={1} onClick={() => setCurrentPage(1)}>{1}</Pagination.Item>);
      if (start > 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }
    }

    for (let page = start; page <= end; page += 1) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Pagination.Item>,
      );
    }

    if (end < pageCount) {
      if (end < pageCount - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }
      items.push(
        <Pagination.Item key={pageCount} onClick={() => setCurrentPage(pageCount)}>
          {pageCount}
        </Pagination.Item>,
      );
    }

    return items;
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f7f8ff', color: '#182234' }}>
      <ShopStreamNavbar />

      {cartMessage && (
        <Container fluid className="px-3 px-lg-4 pt-3">
          <Alert variant="success" dismissible onClose={() => setCartMessage('')} className="mb-0">
            {cartMessage} <Alert.Link as={Link} to="/cart">View cart</Alert.Link>
          </Alert>
        </Container>
      )}

      <main className="flex-grow-1">
        <Container fluid className="px-3 px-lg-4 py-4">
          {error ? (
            <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <span>{error}</span>
              <Button variant="outline-danger" onClick={() => setRetryCount((count) => count + 1)}>
                Try again
              </Button>
            </Alert>
          ) : (
            <>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
                <div>
                  <h1 className="h5 fw-bold mb-1">All Products</h1>
                  <p className="text-secondary small mb-0">
                    {loading
                      ? 'Loading the latest products...'
                      : `Showing ${filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of ${filteredProducts.length} results`}
                  </p>
                </div>
                <Form.Group className="d-flex align-items-center gap-2">
                  <Form.Label htmlFor="sort-products" className="small text-secondary mb-0 text-nowrap">Sort by:</Form.Label>
                  <Form.Select
                    id="sort-products"
                    value={sortOrder}
                    onChange={handleSortChange}
                    className="form-select-sm"
                    style={{ width: '175px' }}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="rating">Top Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <Row className="g-4">
                <Col lg={3} xl={2}>
                  <details
                    className="products-filter-sidebar bg-white rounded-3 p-3"
                    open={filtersOpen}
                    onToggle={(event) => setFiltersOpen(event.currentTarget.open)}
                  >
                    <summary className="products-filter-summary fw-semibold mb-3">Filters</summary>
                    <div className="products-filter-content">
                      <div id="category-filters" className="mb-4">
                        <h2 className="small fw-semibold text-uppercase mb-3">Category</h2>
                        {loading ? (
                          <Spinner animation="border" size="sm" aria-label="Loading categories" />
                        ) : (
                          <Form>
                            {categories.map((category) => (
                              <Form.Check
                                key={category}
                                type="checkbox"
                                id={`category-${category}`}
                                label={category.replaceAll('-', ' ')}
                                checked={selectedCategories.includes(category)}
                                onChange={() => toggleCategory(category)}
                                className="small mb-2 text-capitalize"
                              />
                            ))}
                          </Form>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h2 className="small fw-semibold text-uppercase mb-0">Price range</h2>
                          <span className="small text-secondary">${maximumPrice}</span>
                        </div>
                        <Form.Range
                          min={0}
                          max={1000}
                          step={10}
                          value={maximumPrice}
                          aria-label="Maximum product price"
                          onChange={(event) => {
                            setCurrentPage(1);
                            setMaximumPrice(Number(event.target.value));
                          }}
                        />
                        <div className="d-flex justify-content-between text-secondary" style={{ fontSize: '0.75rem' }}>
                          <span>$0</span>
                          <span>$1,000+</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h2 className="small fw-semibold text-uppercase mb-2">Rating</h2>
                        <Form.Select
                          aria-label="Minimum product rating"
                          value={minimumRating}
                          onChange={(event) => {
                            setCurrentPage(1);
                            setMinimumRating(Number(event.target.value));
                          }}
                          size="sm"
                        >
                          <option value={0}>All ratings</option>
                          <option value={4}>★★★★☆ &amp; Up</option>
                          <option value={4.5}>★★★★★ &amp; Up</option>
                        </Form.Select>
                      </div>

                      <div className="mb-4">
                        <h2 className="small fw-semibold text-uppercase mb-2">Brand</h2>
                        <Form.Select
                          aria-label="Filter by brand"
                          value={selectedBrand}
                          onChange={(event) => {
                            setCurrentPage(1);
                            setSelectedBrand(event.target.value);
                          }}
                          size="sm"
                        >
                          <option value="all">All Brands</option>
                          {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                        </Form.Select>
                      </div>

                      <Button
                        variant="light"
                        className="w-100 small"
                        onClick={clearFilters}
                        style={{ backgroundColor: '#e8edff', color: '#3325c8' }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </details>
                </Col>

                <Col lg={9} xl={10}>
                  {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
                      <Spinner animation="border" variant="primary" aria-label="Loading products" />
                    </div>
                  ) : visibleProducts.length ? (
                    <>
                      <Row className="g-3">
                        {visibleProducts.map((product) => (
                          <Col key={product.id} xs={12} sm={6} xl={4}>
                            <ProductCard product={product} onAddToCart={handleAddToCart} />
                          </Col>
                        ))}
                      </Row>
                      {pageCount > 1 && (
                        <Pagination className="justify-content-center mt-5 mb-0">
                          <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            aria-label="Previous page"
                          />
                          {paginationItems()}
                          <Pagination.Next
                            disabled={currentPage === pageCount}
                            onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                            aria-label="Next page"
                          />
                        </Pagination>
                      )}
                    </>
                  ) : (
                    <Alert variant="light" className="text-center py-5">
                      <h2 className="h5 fw-semibold">No products found</h2>
                      <p className="text-secondary mb-3">Try changing your search or filters.</p>
                      <Button variant="outline-primary" onClick={clearFilters}>Clear Filters</Button>
                    </Alert>
                  )}
                </Col>
              </Row>
            </>
          )}
        </Container>
      </main>

      <ShopStreamFooter />
    </div>
  );
};

export default Products;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../../components/tienda/CategoryCard';
import ProductCard from '../../components/tienda/ProductCard';
import { loadCategoriesAndProducts, calcularPorcentajeDescuento } from '../../utils/tienda/categoriaService';
import { dataService } from '../../utils/dataService';
import { ofertasConfig } from '../../utils/tienda/ofertasData';
import { scrollToTop } from '../../utils/tienda/tiendaUtils';
import { authService } from '../../utils/tienda/authService';
import { verificarStockDisponible, obtenerStockDisponible } from '../../utils/tienda/stockService';

const Categorias = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [headerImageError, setHeaderImageError] = useState(false);
  const [ofertasCount, setOfertasCount] = useState(0);

  const navigate = useNavigate();

  const aplicarOfertasConfiguradas = (productos) => {
    return productos.map(producto => {
      const ofertaConfig = ofertasConfig.find(oferta =>
        oferta.codigo === producto.codigo
      );

      if (ofertaConfig) {
        const precioOferta = Math.round(producto.precio * (1 - ofertaConfig.descuento / 100));

        return {
          ...producto,
          precioOriginal: producto.precio,
          precioOferta: precioOferta,
          descuento: ofertaConfig.descuento,
          tiempoRestante: ofertaConfig.tiempoRestante,
          exclusivo: ofertaConfig.exclusivo,
          enOferta: true
        };
      }

      return producto;
    });
  };

  const contarProductosEnOferta = (productos) => {
    return productos.filter(producto => producto.enOferta).length;
  };

  const adaptarProductosDesdeBD = (productosBD) => {
    return productosBD.map(producto => {
      let categoriaNombre = producto.categoria;
      if (typeof producto.categoria === 'object' && producto.categoria !== null) {
        categoriaNombre = producto.categoria.nombre || producto.categoria.name || 'Sin categoría';
      }

      const stock = producto.stock || producto.stockActual || 0;
      const stockCritico = producto.stock_critico || producto.stockCritico || 5;

      let imagen = producto.imagen || producto.img || producto.url_imagen;
      if (!imagen) {
        imagen = '/src/assets/placeholder-producto.png';
      }

      return {
        ...producto,
        imagen: imagen,
        categoria: categoriaNombre,
        stock: stock,
        stock_critico: stockCritico,
        stock_disponible: stock,
        enOferta: false,
        precioOferta: null,
        descuento: 0
      };
    });
  };

  const handleAddToCart = async (product) => {
    const user = authService.getCurrentUser();
    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    try {
      const stockDisponible = await verificarStockDisponible(product.codigo, 1);

      if (!stockDisponible) {
        const stockActual = await obtenerStockDisponible(product.codigo);
        alert(`No hay stock disponible de ${product.nombre}. Stock actual: ${stockActual}`);
        return;
      }

      const carritoActual = JSON.parse(localStorage.getItem('junimoCart')) || [];
      const productoEnCarrito = carritoActual.find(item => item.codigo === product.codigo);

      let nuevoCarrito;
      if (productoEnCarrito) {
        nuevoCarrito = carritoActual.map(item =>
          item.codigo === product.codigo
            ? {
              ...item,
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * (product.precioOferta || product.precio)
            }
            : item
        );
      } else {
        nuevoCarrito = [...carritoActual, {
          ...product,
          cantidad: 1,
          subtotal: product.precioOferta || product.precio
        }];
      }

      localStorage.setItem('junimoCart', JSON.stringify(nuevoCarrito));

      alert(`${product.nombre} agregado al carrito`);

      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('stockUpdated'));

    } catch (error) {
      alert('Error al agregar producto al carrito: ' + error.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const productosDesdeBD = await dataService.getProductos();

        if (productosDesdeBD && productosDesdeBD.length > 0) {
          const productosAdaptados = adaptarProductosDesdeBD(productosDesdeBD);
          const productosConOfertas = aplicarOfertasConfiguradas(productosAdaptados);

          const totalOfertas = contarProductosEnOferta(productosConOfertas);
          setOfertasCount(totalOfertas);

          const categoriasUnicas = [...new Set(productosConOfertas.map(product => product.categoria))];

          const categoriasConInfo = categoriasUnicas.map(categoria => {
            const productosCategoria = productosConOfertas.filter(product => product.categoria === categoria);
            const ofertasEnCategoria = productosCategoria.filter(product => product.enOferta).length;

            return {
              nombre: categoria,
              cantidadProductos: productosCategoria.length,
              ofertasEnCategoria: ofertasEnCategoria,
              productos: productosCategoria
            };
          });

          setCategories(categoriasConInfo);
        } else {
          setCategories([]);
          setOfertasCount(0);
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setCategories([]);
        setOfertasCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCategoryClick = (categoria) => {
    setProductsLoading(true);

    setTimeout(() => {
      setSelectedCategory(categoria);
      setProductsLoading(false);

      setTimeout(() => {
        const productosElement = document.getElementById('productos-categoria');
        if (productosElement) {
          productosElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }, 300);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    scrollToTop();
  };

  const handleProductDetails = (productCode) => {
    navigate(`/producto/${productCode}`);
    setTimeout(scrollToTop, 100);
  };

  return (
    <div
      className="min-vh-100 w-100"
      style={{
        backgroundImage: 'url("src/assets/tienda/fondostardew.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        fontFamily: "'Lato', sans-serif"
      }}
    >
      <div style={{ height: '80px' }}></div>

      <Container className="py-5">
        <Row className="justify-content-center mb-5">
          <Col lg={8} className="text-center">
            {!headerImageError ? (
              <img
                src="../src/assets/tienda/categorias.png"
                alt="Nuestras Categorías"
                className="img-fluid mb-4"
                style={{
                  maxWidth: '1000px',
                  width: '100%',
                  filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                }}
                onError={() => setHeaderImageError(true)}
              />
            ) : (
              <h1
                className="fw-bold mb-3"
                style={{
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  fontSize: '2.5rem',
                  fontFamily: "'Indie Flower', cursive"
                }}
              >
                Nuestras Categorías
              </h1>
            )}

            <p
              className="fs-5 mb-4"
              style={{
                color: 'rgba(255,255,255,0.9)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              {selectedCategory
                ? `Explora todos los productos de ${selectedCategory.nombre}`
                : 'Descubre todos nuestros productos organizados por categorías'
              }
            </p>

            {!selectedCategory && ofertasCount > 0 && (
              <Badge bg="danger" className="fs-6 px-3 py-2 mb-3">
                {ofertasCount} productos en oferta
              </Badge>
            )}

            {selectedCategory && (
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button
                  style={{
                    backgroundColor: '#dedd8ff5',
                    color: '#000000',
                    border: '2px solid #000000',
                    fontWeight: 'bold'
                  }}
                  onClick={handleBackToCategories}
                >
                  Volver a Categorías
                </Button>

                {selectedCategory.ofertasEnCategoria > 0 && (
                  <Badge bg="warning" text="dark" className="fs-6 px-3 py-2">
                    {selectedCategory.ofertasEnCategoria} oferta(s) en esta categoría
                  </Badge>
                )}
              </div>
            )}
          </Col>
        </Row>

        {loading ? (
          <Row className="justify-content-center py-5">
            <Col className="text-center">
              <Spinner animation="border" variant="warning" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3 text-white fs-5">Cargando categorías desde la base de datos...</p>
            </Col>
          </Row>
        ) : selectedCategory ? (
          <>
            <div id="productos-categoria">
              <Row className="mb-4">
                <Col>
                  <div
                    className="rounded-4 p-4 text-center"
                    style={{
                      backgroundColor: 'rgba(222, 221, 143, 0.95)',
                      border: '3px solid #000000'
                    }}
                  >
                    <h3
                      className="fw-bold mb-2 text-dark"
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                    >
                      {selectedCategory.nombre}
                    </h3>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                      <p className="mb-0 text-dark">
                        <Badge bg="success" className="me-1">{selectedCategory.cantidadProductos}</Badge> productos
                      </p>
                      {selectedCategory.ofertasEnCategoria > 0 && (
                        <p className="mb-0 text-dark">
                          <Badge bg="danger" className="me-1">{selectedCategory.ofertasEnCategoria}</Badge> en oferta
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>

              {productsLoading ? (
                <Row className="justify-content-center py-5">
                  <Col className="text-center">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-3 text-white">Cargando productos...</p>
                  </Col>
                </Row>
              ) : (
                <Row>
                  {selectedCategory.productos.map((product) => (
                    <ProductCard
                      key={product.codigo}
                      product={product}
                      handleAddToCart={handleAddToCart}
                      handleDetailsClick={handleProductDetails}
                      calcularPorcentajeDescuento={calcularPorcentajeDescuento}
                    />
                  ))}

                  {selectedCategory.productos.length === 0 && (
                    <Col className="text-center py-5">
                      <div
                        className="rounded-4 p-5 mx-auto"
                        style={{
                          backgroundColor: 'rgba(222, 221, 143, 0.95)',
                          border: '3px solid #000000',
                          maxWidth: '500px'
                        }}
                      >
                        <span className="display-1">🌾</span>
                        <h4 className="text-dark mt-3 fw-bold">
                          No hay productos en esta categoría
                        </h4>
                        <Button
                          style={{
                            backgroundColor: '#87CEEB',
                            color: '#000000',
                            border: '2px solid #000000',
                            fontWeight: 'bold'
                          }}
                          className="mt-3"
                          onClick={handleBackToCategories}
                        >
                          Volver a Categorías
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>
              )}
            </div>
          </>
        ) : (
          <>
            {ofertasCount > 0 && (
              <Row className="mb-4">
                <Col>
                  <div
                    className="rounded-4 p-4 text-center shadow-lg border-3 border-warning"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(255, 193, 7, 0.9))',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <h3
                      className="fw-bold mb-3 text-white"
                      style={{
                        fontFamily: "'Indie Flower', cursive",
                        fontSize: '2rem',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      Ofertas Activas en Todas las Categorías
                    </h3>
                    <p className="fs-5 text-white mb-3 fw-semibold">
                      Tenemos <Badge bg="danger" className="fs-4">{ofertasCount}</Badge> productos en oferta con descuentos increíbles
                    </p>
                  </div>
                </Col>
              </Row>
            )}

            <Row>
              {categories.map((categoria) => (
                <CategoryCard
                  key={categoria.nombre}
                  categoria={categoria}
                  onCategoryClick={handleCategoryClick}
                />
              ))}

              {categories.length === 0 && !loading && (
                <Col className="text-center py-5">
                  <div
                    className="rounded-4 p-5 mx-auto"
                    style={{
                      backgroundColor: 'rgba(222, 221, 143, 0.95)',
                      border: '3px solid #000000',
                      maxWidth: '500px'
                    }}
                  >
                    <span className="display-1">📦</span>
                    <h4 className="text-dark mt-3 fw-bold">
                      No hay categorías disponibles
                    </h4>
                    <p className="text-muted">
                      No se encontraron categorías de productos en la base de datos.
                    </p>
                  </div>
                </Col>
              )}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default Categorias;
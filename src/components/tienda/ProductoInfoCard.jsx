import React, { useState, useEffect } from 'react';
import { Card, Badge, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { getProductosConStockActual } from '../../utils/tienda/stockService';
import { useNavigate } from 'react-router-dom';

const ProductoInfoCard = ({
  product,
  cantidad,
  setCantidad,
  handleAddToCart,
  formatearPrecio,
  categoryIcons,
  user
}) => {
  const [stockActual, setStockActual] = useState(product.stock_disponible || product.stock);
  const navigate = useNavigate();

  useEffect(() => {
    const actualizarStock = async () => {
      try {
        const productosActualizados = await getProductosConStockActual();

        if (Array.isArray(productosActualizados)) {
          const productoActualizado = productosActualizados.find(p => p.codigo === product.codigo);
          if (productoActualizado) {
            setStockActual(productoActualizado.stock_disponible);

            if (cantidad > productoActualizado.stock_disponible) {
              setCantidad(Math.max(1, productoActualizado.stock_disponible));
            }
          }
        }
      } catch (error) {
        console.error('Error actualizando stock:', error);
      }
    };

    actualizarStock();

    window.addEventListener('cartUpdated', actualizarStock);

    return () => {
      window.removeEventListener('cartUpdated', actualizarStock);
    };
  }, [product.codigo, cantidad, setCantidad]);

  const handleLoginRedirect = () => {
    alert('Debes iniciar sesión para agregar productos al carrito');
    navigate('/login');
  };

  return (
    <Card
      className="border-3 border-warning rounded-4 shadow-lg p-4 p-md-5"
      style={{
        borderColor: '#dedd8ff5 !important',
        backgroundColor: '#87CEEB'
      }}
    >
      <div className="mb-4">
        <Badge
          className="fs-6 px-3 py-2 rounded-3 border-2 border-dark fw-bold me-2"
          style={{
            background: 'linear-gradient(135deg, #2E8B57, #3CB371)',
            color: '#000000'
          }}
        >
          {categoryIcons[product.categoria]} {product.categoria}
        </Badge>
        {stockActual < product.stock_critico && stockActual > 0 && (
          <Badge
            bg="warning"
            className="fs-6 px-3 py-2 rounded-3 border-2 border-dark fw-bold text-dark"
          >
            Stock Bajo
          </Badge>
        )}
        {!user && (
          <Badge
            bg="secondary"
            className="fs-6 px-3 py-2 rounded-3 border-2 border-dark fw-bold text-white"
          >
            Inicia Sesión
          </Badge>
        )}
      </div>

      <h1
        className="display-5 fw-bold mb-4 text-dark"
        style={{
          fontFamily: "'Indie Flower', cursive",
          textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
        }}
      >
        {product.nombre}
      </h1>

      <div className="border-bottom border-3 border-warning pb-4 mb-4">
        {product.enOferta ? (
          <>
            <div className="text-muted text-decoration-line-through fs-4 mb-2">
              {formatearPrecio(product.precioOriginal)}
            </div>
            <span
              className="fw-bolder text-danger"
              style={{
                fontSize: '2.8rem',
                fontFamily: "'Lato', sans-serif",
                textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
              }}
            >
              {formatearPrecio(product.precioOferta)}
            </span>
            <Badge
              bg="danger"
              className="fs-6 ms-3 px-3 py-2 border-2 border-dark"
            >
              -{product.descuento}%
            </Badge>
          </>
        ) : (
          <span
            className="fw-bolder text-dark"
            style={{
              fontSize: '2.8rem',
              fontFamily: "'Lato', sans-serif",
              textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
            }}
          >
            {formatearPrecio(product.precio)}
          </span>
        )}
      </div>

      <div className="mb-4">
        <h5
          className="fw-bold mb-3 text-dark"
          style={{
            fontSize: '1.3rem',
            fontFamily: "'Lato', sans-serif",
            borderLeft: '4px solid #dedd8ff5',
            paddingLeft: '0.75rem',
            textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
          }}
        >
          Descripción
        </h5>
        <p
          className="fs-6 lh-lg mb-0 text-dark"
          style={{
            fontFamily: "'Lato', sans-serif",
            textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
          }}
        >
          {product.descripcion}
        </p>
      </div>

      <div className="mb-4">
        <h5
          className="fw-bold mb-3 text-dark"
          style={{
            fontSize: '1.3rem',
            fontFamily: "'Lato', sans-serif",
            borderLeft: '4px solid #dedd8ff5',
            paddingLeft: '0.75rem',
            textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
          }}
        >
          Disponibilidad
        </h5>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span
            className={`badge fs-6 px-3 py-2 rounded-3 border-2 fw-bold ${stockActual > 0
                ? 'bg-success border-dark text-dark'
                : 'bg-danger border-dark text-dark'
              }`}
            style={{
              textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
            }}
          >
            {stockActual > 0 ? 'En Stock' : 'Agotado'}
          </span>
          <span
            className="text-dark fw-semibold"
            style={{
              fontFamily: "'Lato', sans-serif",
              textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
            }}
          >
            ({stockActual} unidades disponibles)
          </span>
        </div>
      </div>

      {!user && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex align-items-center">
            <span className="me-2"></span>
            <span>
              <strong>Inicia sesión</strong> para agregar productos al carrito y realizar compras.
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="mt-2"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </Button>
        </Alert>
      )}

      <PurchaseSection
        product={product}
        cantidad={cantidad}
        setCantidad={setCantidad}
        handleAddToCart={handleAddToCart}
        handleLoginRedirect={handleLoginRedirect}
        stockActual={stockActual}
        user={user}
      />

      <AdditionalInfo />
    </Card>
  );
};

const PurchaseSection = ({
  product,
  cantidad,
  setCantidad,
  handleAddToCart,
  handleLoginRedirect,
  stockActual,
  user
}) => {
  const handleCantidadChange = (e) => {
    const value = parseInt(e.target.value) || 0;

    if (value < 1) {
      setCantidad(1);
    } else if (value > stockActual) {
      setCantidad(stockActual);
    } else {
      setCantidad(value);
    }
  };

  const incrementarCantidad = () => {
    if (cantidad < stockActual) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const getButtonConfig = () => {
    if (!user) {
      return {
        text: 'INICIAR SESIÓN PARA COMPRAR',
        action: handleLoginRedirect,
        disabled: false,
        variant: 'secondary'
      };
    }

    if (stockActual === 0) {
      return {
        text: 'PRODUCTO AGOTADO',
        action: () => { },
        disabled: true,
        variant: 'danger'
      };
    }

    return {
      text: `AGREGAR ${cantidad} AL CARRITO`,
      action: handleAddToCart,
      disabled: false,
      variant: 'warning'
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <Card
      className="border-2 border-warning rounded-3 p-4 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(222, 221, 143, 0.15), rgba(135, 206, 235, 0.1))'
      }}
    >
      <Row className="align-items-center">
        <Col md={4} className="mb-3 mb-md-0">
          <div>
            <label
              className="fw-bold mb-2 text-dark d-block"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: '1.1rem',
                textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
              }}
            >
              Cantidad
            </label>

            <div className="d-flex align-items-center">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={decrementarCantidad}
                disabled={cantidad <= 1 || stockActual === 0 || !user}
                style={{
                  border: '2px solid #87CEEB',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  width: '45px',
                  height: '45px'
                }}
              >
                -
              </Button>

              <Form.Control
                type="number"
                value={cantidad}
                onChange={handleCantidadChange}
                min="1"
                max={stockActual}
                disabled={stockActual === 0 || !user}
                className="mx-2 text-center fw-bold"
                style={{
                  border: '2px solid #87CEEB',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  height: '45px',
                  width: '80px',
                  fontFamily: "'Lato', sans-serif"
                }}
              />

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={incrementarCantidad}
                disabled={cantidad >= stockActual || stockActual === 0 || !user}
                style={{
                  border: '2px solid #87CEEB',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  width: '45px',
                  height: '45px'
                }}
              >
                +
              </Button>
            </div>

            <div className="mt-2">
              <small
                className="text-dark fw-medium"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                {user ? `Máximo: ${stockActual} unidades` : 'Inicia sesión para comprar'}
              </small>
            </div>
          </div>
        </Col>

        <Col md={8}>
          <Button
            variant={buttonConfig.variant}
            size="lg"
            className="w-100 rounded-3 border-3 border-dark fw-bold py-3 text-dark text-uppercase"
            style={{
              background: buttonConfig.variant === 'warning'
                ? 'linear-gradient(135deg, #dedd8ff5, #ffd700)'
                : buttonConfig.variant === 'secondary'
                  ? '#6c757d'
                  : '#dc3545',
              fontFamily: "'Lato', sans-serif",
              fontSize: '1.1rem',
              letterSpacing: '0.5px'
            }}
            onClick={buttonConfig.action}
            disabled={buttonConfig.disabled}
          >
            {buttonConfig.text}
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

const AdditionalInfo = () => (
  <div className="border-top border-3 border-warning pt-4">
    <div className="d-flex align-items-center gap-3 mb-3 p-2 rounded-3 transition-all">
      <span className="fs-4"></span>
      <span
        className="text-dark fw-medium"
        style={{
          fontFamily: "'Lato', sans-serif",
          textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
        }}
      >
        Envío gratis en compras sobre $30.000
      </span>
    </div>
    <div className="d-flex align-items-center gap-3 mb-3 p-2 rounded-3 transition-all">
      <span className="fs-4"></span>
      <span
        className="text-dark fw-medium"
        style={{
          fontFamily: "'Lato', sans-serif",
          textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
        }}
      >
        Devolución fácil en 30 días
      </span>
    </div>
    <div className="d-flex align-items-center gap-3 p-2 rounded-3 transition-all">
      <span className="fs-4"></span>
      <span
        className="text-dark fw-medium"
        style={{
          fontFamily: "'Lato', sans-serif",
          textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
        }}
      >
        Garantía de satisfacción
      </span>
    </div>
  </div>
);

export default ProductoInfoCard;
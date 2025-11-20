import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Badge, Button, Spinner } from 'react-bootstrap';
import ProductoDetalleHeader from '../../components/tienda/ProductoDetalleHeader';
import ProductoDetalleMain from '../../components/tienda/ProductoDetalleMain';
import ProductoDetalleRelated from '../../components/tienda/ProductoDetalleRelated';
import { formatearPrecio, categoryIcons } from '../../utils/tienda/tiendaUtils';
import { verificarStockDisponible, obtenerStockDisponible, getProductosConStockActual } from '../../utils/tienda/stockService';
import { authService } from '../../utils/tienda/authService';
import { dataService } from '../../utils/dataService';
import { ofertasConfig } from '../../utils/tienda/ofertasData';

const ProductoDetalle = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adaptarProductoDesdeBD = (productoBD) => {
    if (!productoBD) return null;

    let categoriaNombre = productoBD.categoria;
    if (typeof productoBD.categoria === 'object' && productoBD.categoria !== null) {
      categoriaNombre = productoBD.categoria.nombre || productoBD.categoria.name || 'Sin categoría';
    }

    const stock = productoBD.stock || productoBD.stockActual || 0;
    const stockCritico = productoBD.stock_critico || productoBD.stockCritico || 5;

    let imagen = productoBD.imagen || productoBD.img || productoBD.url_imagen;
    if (!imagen) {
      imagen = '/src/assets/placeholder-producto.png';
    }

    return {
      ...productoBD,
      imagen: imagen,
      categoria: categoriaNombre,
      stock: stock,
      stock_critico: stockCritico,
      stock_disponible: stock,
      enOferta: false,
      precioOferta: null,
      descuento: 0
    };
  };

  const aplicarOfertasConfiguradas = (producto) => {
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
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const cargarProductoConOferta = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productoDesdeBD = await dataService.getProductoById(codigo);
        
        if (productoDesdeBD) {
          const productoAdaptado = adaptarProductoDesdeBD(productoDesdeBD);
          const productoConOferta = aplicarOfertasConfiguradas(productoAdaptado);
          
          let productosConStock = [];
          try {
            productosConStock = await getProductosConStockActual([productoConOferta]);
          } catch (stockError) {
            productosConStock = [productoConOferta];
          }

          if (!Array.isArray(productosConStock)) {
            productosConStock = [productoConOferta];
          }

          const productoConStock = productosConStock.find(p => p.codigo === codigo) || productoConOferta;
          const productoFinal = aplicarOfertasConfiguradas(productoConStock);
          
          setProduct(productoFinal);
          
          try {
            const todosProductos = await dataService.getProductos();
            const productosAdaptados = todosProductos.map(adaptarProductoDesdeBD);
            const productosConOfertas = productosAdaptados.map(aplicarOfertasConfiguradas);
            
            const relacionados = productosConOfertas
              .filter(p => p.categoria === productoFinal.categoria && p.codigo !== codigo)
              .slice(0, 4);
            
            setRelatedProducts(relacionados);
          } catch (relError) {
            setRelatedProducts([]);
          }
        } else {
          setError('Producto no encontrado en la base de datos');
        }
      } catch (error) {
        setError('Error al cargar el producto desde la base de datos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarProductoConOferta();
  }, [codigo]);

  useEffect(() => {
    const handleAuthChange = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    try {
      const stockDisponible = await verificarStockDisponible(product.codigo, cantidad);
      
      if (!stockDisponible) {
        const stockActual = await obtenerStockDisponible(product.codigo);
        alert(`No hay suficiente stock disponible de ${product.nombre}. Stock actual: ${stockActual}`);
        return;
      }

      const savedCart = localStorage.getItem('junimoCart');
      let cartItems = savedCart ? JSON.parse(savedCart) : [];
      
      const existingItem = cartItems.find(item => item.codigo === product.codigo);
      
      let newCartItems;
      if (existingItem) {
        newCartItems = cartItems.map(item =>
          item.codigo === product.codigo
            ? { 
                ...item, 
                cantidad: item.cantidad + cantidad,
                subtotal: (item.cantidad + cantidad) * (product.precioOferta || product.precio)
              }
            : item
        );
      } else {
        newCartItems = [...cartItems, { 
          ...product, 
          cantidad: cantidad,
          subtotal: cantidad * (product.precioOferta || product.precio)
        }];
      }

      localStorage.setItem('junimoCart', JSON.stringify(newCartItems));
      
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('stockUpdated'));

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      
      setCantidad(1);
      
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      alert('Error al agregar producto al carrito: ' + error.message);
    }
  };

  const handleRelatedProductClick = (productCode) => {
    navigate(`/producto/${productCode}`);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  if (loading) {
    return (
      <div 
        className="min-vh-100"
        style={{
          backgroundImage: 'url("src/assets/tienda/fondostardew.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          fontFamily: "'Lato', sans-serif"
        }}
      >
        <div style={{ height: '100px' }}></div>
        <Container className="text-center py-5">
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <Spinner animation="border" variant="warning" style={{ width: '3rem', height: '3rem' }} />
            <h4 className="text-white fw-bold mt-3">Cargando producto desde BD...</h4>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div 
        className="min-vh-100"
        style={{
          backgroundImage: 'url("src/assets/tienda/fondostardew.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          fontFamily: "'Lato', sans-serif"
        }}
      >
        <div style={{ height: '100px' }}></div>
        <Container className="text-center py-5">
          <Alert variant="danger" className="rounded-4">
            <h4>{error || 'Producto no encontrado'}</h4>
            <p>El producto que buscas no existe en la base de datos.</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Volver a la Tienda
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div 
      className="min-vh-100"
      style={{
        backgroundImage: 'url("https://images3.alphacoders.com/126/1269904.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        fontFamily: "'Lato', sans-serif"
      }}
    >
      <div style={{ height: '100px' }}></div>

      {showAlert && (
        <Alert 
          variant="success" 
          className="position-fixed top-0 end-0 m-3 rounded-3 border-2 border-success fw-bold"
          style={{ zIndex: 1050 }}
        >
          ¡{product.nombre} agregado al carrito!
        </Alert>
      )}

      <Container className="py-4">
        {product.enOferta && (
          <div className="text-center mb-4">
            <Badge 
              bg="danger" 
              className="fs-4 px-4 py-3 border-3 border-white fw-bold"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              OFERTA ESPECIAL - {product.descuento}% DE DESCUENTO
            </Badge>
          </div>
        )}

        <ProductoDetalleHeader />

        <ProductoDetalleMain 
          product={product}
          cantidad={cantidad}
          setCantidad={setCantidad}
          handleAddToCart={handleAddToCart}
          formatearPrecio={formatearPrecio}
          categoryIcons={categoryIcons}
          user={user}
        />

        {relatedProducts.length > 0 && (
          <ProductoDetalleRelated 
            relatedProducts={relatedProducts}
            handleRelatedProductClick={handleRelatedProductClick}
            formatearPrecio={formatearPrecio}
            categoryIcons={categoryIcons}
          />
        )}
      </Container>
    </div>
  );
};

export default ProductoDetalle;
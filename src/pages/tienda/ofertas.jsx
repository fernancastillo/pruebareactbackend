import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../utils/tienda/authService';
import { actualizarStockEnProductos } from '../../utils/tienda/stockService';
import OfertasHeader from '../../components/tienda/OfertasHeader';
import OfertasInfoCard from '../../components/tienda/OfertasInfoCard';
import OfertasGrid from '../../components/tienda/OfertasGrid';
import { ofertasConfig } from '../../utils/tienda/ofertasData';
import { dataService } from '../../utils/dataService';

const Ofertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para adaptar productos desde BD
  const adaptarProductosDesdeBD = (productosBD) => {
    return productosBD.map(producto => {
      // Extraer nombre de categoría si es objeto
      let categoriaNombre = producto.categoria;
      if (typeof producto.categoria === 'object' && producto.categoria !== null) {
        categoriaNombre = producto.categoria.nombre || producto.categoria.name || 'Sin categoría';
      }

      // Adaptar nombres de campos de stock
      const stock = producto.stock || producto.stockActual || 0;
      const stockCritico = producto.stock_critico || producto.stockCritico || 5;

      // Asegurar que la imagen tenga una ruta válida
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

  // Función para aplicar ofertas usando tu configuración
  const aplicarOfertasConfiguradas = (productos) => {
    return productos.map(producto => {
      // Buscar oferta por código exacto
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

  // Función para obtener solo productos en oferta
  const obtenerProductosEnOferta = (productos) => {
    return productos.filter(producto => producto.enOferta);
  };

  // Cargar ofertas desde la base de datos
  const cargarOfertas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener productos desde la base de datos
      const productosDesdeBD = await dataService.getProductos();

      if (!productosDesdeBD || productosDesdeBD.length === 0) {
        setError('No se encontraron productos en la base de datos.');
        setOfertas([]);
        return;
      }

      // Adaptar productos al formato que espera la aplicación
      const productosAdaptados = adaptarProductosDesdeBD(productosDesdeBD);

      // APLICAR OFERTAS a todos los productos
      const productosConOfertas = aplicarOfertasConfiguradas(productosAdaptados);

      // FILTRAR SOLO LOS PRODUCTOS QUE ESTÁN EN OFERTA
      const productosEnOferta = obtenerProductosEnOferta(productosConOfertas);

      setOfertas(productosEnOferta);

    } catch (error) {
      console.error('Error cargando ofertas:', error);
      setError('Error al cargar las ofertas desde la base de datos.');
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar ofertas al montar el componente
  useEffect(() => {
    actualizarStockEnProductos();
    cargarOfertas();
  }, []);

  // Verificar autenticación al cargar
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const handleAuthChange = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundImage: 'url("src/assets/tienda/fondostardew.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        backgroundAttachment: 'fixed',
        fontFamily: "'Lato', sans-serif"
      }}
    >
      <div style={{ height: '120px' }}></div>

      <Container className="py-5">
        <OfertasHeader user={user} />
        <OfertasInfoCard
          user={user}
          ofertasCount={ofertas.length}
          navigate={navigate}
          loading={loading}
          error={error}
        />
        <OfertasGrid
          ofertas={ofertas}
          user={user}
          loading={loading}
          error={error}
        />
      </Container>
    </div>
  );
};

export default Ofertas;
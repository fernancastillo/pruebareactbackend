// utils/dataService.js
const API_BASE_URL = 'http://localhost:8094/v1';

// Servicio para manejar errores de API
const handleApiError = (error, operation) => {
  console.error(`Error en ${operation}:`, error);
  throw new Error(`Error al ${operation}: ${error.message}`);
};

// Función genérica para llamadas API
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error, `llamar ${endpoint}`);
  }
};

export const dataService = {
  // Ya no necesitamos initializeData ya que los datos vienen de la BD
  initializeData: () => {
    console.log('✅ Usando base de datos Oracle Cloud');
    return true;
  },

  // PRODUCTOS
  getProductos: async () => {
    return await apiCall('/productos', { method: 'GET' });
  },

  getProductoById: async (codigo) => {
    return await apiCall(`/productoById/${codigo}`, { method: 'GET' });
  },

  getProductoByName: async (nombre) => {
    return await apiCall(`/productoByName/${nombre}`, { method: 'GET' });
  },

  getProductosByCategoria: async (categoriaId) => {
    return await apiCall(`/productosByCategoria/${categoriaId}`, { method: 'GET' });
  },

  getProductosByNombre: async (nombre) => {
    return await apiCall(`/productosByNombre?nombre=${encodeURIComponent(nombre)}`, { method: 'GET' });
  },

  getProductosStockCritico: async () => {
    return await apiCall('/productosStockCritico', { method: 'GET' });
  },

  getProductosByPrecio: async (precioMin, precioMax) => {
    return await apiCall(`/productosByPrecio?precioMin=${precioMin}&precioMax=${precioMax}`, { method: 'GET' });
  },

  addProducto: async (producto) => {
    return await apiCall('/addProducto', {
      method: 'POST',
      body: JSON.stringify(producto),
    });
  },

  updateProducto: async (producto) => {
    return await apiCall('/updateProducto', {
      method: 'PUT',
      body: JSON.stringify(producto),
    });
  },

  deleteProducto: async (codigo) => {
    return await apiCall(`/deleteProducto/${codigo}`, { method: 'DELETE' });
  },

  // USUARIOS
  getUsuarios: async () => {
    return await apiCall('/usuarios', { method: 'GET' });
  },

  getUsuarioById: async (run) => {
    return await apiCall(`/usuariosById/${run}`, { method: 'GET' });
  },

  getUsuarioByCorreo: async (correo) => {
    return await apiCall(`/usuariosByCorreo/${correo}`, { method: 'GET' });
  },

  getUsuarioByTipo: async (tipo) => {
    return await apiCall(`/usuariosByTipo/${tipo}`, { method: 'GET' });
  },

  addUsuario: async (usuario) => {
    return await apiCall('/addUsuario', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  },

  updateUsuario: async (usuario) => {
    return await apiCall('/updateUsuario', {
      method: 'PUT',
      body: JSON.stringify(usuario),
    });
  },

  deleteUsuario: async (run) => {
    return await apiCall(`/deleteUsuario/${run}`, { method: 'DELETE' });
  },

  // CATEGORÍAS
  getCategorias: async () => {
    return await apiCall('/categorias', { method: 'GET' });
  },

  getCategoriaById: async (id) => {
    return await apiCall(`/categoriaById/${id}`, { method: 'GET' });
  },

  getCategoriaByName: async (nombre) => {
    return await apiCall(`/categoriaByName/${nombre}`, { method: 'GET' });
  },

  addCategoria: async (categoria) => {
    return await apiCall('/addCategoria', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });
  },

  // ÓRDENES
  getOrdenes: async () => {
    return await apiCall('/ordenes', { method: 'GET' });
  },

  getOrdenByNumero: async (numero) => {
    return await apiCall(`/OrdenByNumero/${numero}`, { method: 'GET' });
  },

  addOrden: async (orden) => {
    return await apiCall('/addOrden', {
      method: 'POST',
      body: JSON.stringify(orden),
    });
  },

  updateOrden: async (orden) => {
    return await apiCall('/updateOrden', {
      method: 'PUT',
      body: JSON.stringify(orden),
    });
  },

  deleteOrden: async (numero) => {
    return await apiCall(`/deleteOrden/${numero}`, { method: 'DELETE' });
  },

  // DETALLE ORDEN
  getDetallesOrdenes: async () => {
    return await apiCall('/detallesOrdenes', { method: 'GET' });
  },

  getDetalleOrdenById: async (id) => {
    return await apiCall(`/detallesOrdenesById/${id}`, { method: 'GET' });
  },

  addDetalleOrden: async (detalle) => {
    return await apiCall('/addDetalleOrden', {
      method: 'POST',
      body: JSON.stringify(detalle),
    });
  },

  // ✅ MÉTODOS ESPECIALES PARA ÓRDENES (implementados en frontend)
  getOrdenesPorUsuario: async (run) => {
    const ordenes = await dataService.getOrdenes();
    return ordenes.filter(orden => orden.run === run);
  },

  getOrdenesPorEstado: async (estado) => {
    const ordenes = await dataService.getOrdenes();
    return ordenes.filter(orden => orden.estadoEnvio === estado);
  },

  // ✅ MÉTODOS ESPECIALES PARA PRODUCTOS (implementados en frontend)
  getProductosPorCategoria: async (categoriaNombre) => {
    // Primero obtener todas las categorías para encontrar el ID
    const categorias = await dataService.getCategorias();
    const categoria = categorias.find(cat => cat.nombre === categoriaNombre);
    
    if (categoria) {
      return await dataService.getProductosByCategoria(categoria.id);
    }
    return [];
  },

  getProductosStockCritico: async () => {
    return await dataService.getProductosStockCritico();
  },

  // ✅ MÉTODOS ESPECIALES PARA USUARIOS
  getUsuariosPorTipo: async (tipo) => {
    return await dataService.getUsuarioByTipo(tipo);
  },

  // ✅ Ya no necesitamos resetData ya que los datos vienen de la BD
  resetData: () => {
    console.log('ℹ️ Los datos ahora se gestionan desde la base de datos Oracle');
    return true;
  },

  // ✅ VERIFICAR ESTADO DE DATOS (ahora desde BD)
  checkDataStatus: async () => {
    try {
      const productos = await dataService.getProductos();
      const usuarios = await dataService.getUsuarios();
      const ordenes = await dataService.getOrdenes();
      
      return {
        productos: {
          count: productos.length,
          loaded: productos.length > 0
        },
        usuarios: {
          count: usuarios.length,
          loaded: usuarios.length > 0
        },
        ordenes: {
          count: ordenes.length,
          loaded: ordenes.length > 0
        }
      };
    } catch (error) {
      console.error('Error verificando estado de datos:', error);
      return {
        productos: { count: 0, loaded: false },
        usuarios: { count: 0, loaded: false },
        ordenes: { count: 0, loaded: false }
      };
    }
  }
};
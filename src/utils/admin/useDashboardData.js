import { useState, useEffect } from 'react';
import { dataService } from '../dataService';

export const useDashboardData = () => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalProductos: 0,
    totalOrdenes: 0,
    ordenesPendientes: 0,
    ordenesEntregadas: 0,
    ingresosTotales: 0
  });

  const [productosStockCritico, setProductosStockCritico] = useState([]);
  const [ultimasOrdenes, setUltimasOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const normalizarProductos = (productosBD) => {
    if (!Array.isArray(productosBD)) return [];

    return productosBD.map(producto => {
      const stockActual = producto.stockActual || producto.stock || producto.stock_actual || 0;
      const stockCritico = producto.stockCritico || producto.stock_critico || 5;
      const categoria = typeof producto.categoria === 'object'
        ? (producto.categoria.nombre || producto.categoria.name || 'Sin categoría')
        : (producto.categoria || 'Sin categoría');

      return {
        codigo: producto.codigo || producto.codigo_producto || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        categoria: categoria,
        precio: producto.precio || 0,
        stockActual: stockActual,
        stockCritico: stockCritico,
        imagen: producto.imagen || '',
        stock: stockActual,
        stock_critico: stockCritico
      };
    });
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usuariosResponse, productosResponse, ordenesResponse] = await Promise.all([
        dataService.getUsuarios(),
        dataService.getProductos(),
        dataService.getOrdenes()
      ]);

      const usuarios = Array.isArray(usuariosResponse) ? usuariosResponse : [];
      const productosBD = Array.isArray(productosResponse) ? productosResponse : [];
      const ordenes = Array.isArray(ordenesResponse) ? ordenesResponse : [];

      const productos = normalizarProductos(productosBD);

      const ordenesPendientes = ordenes.filter(o =>
        o.estadoEnvio && o.estadoEnvio.toLowerCase() === 'pendiente'
      ).length;

      const ordenesEntregadas = ordenes.filter(o =>
        o.estadoEnvio && o.estadoEnvio.toLowerCase() === 'entregado'
      ).length;

      const ingresosTotales = ordenes
        .filter(o => o.estadoEnvio && o.estadoEnvio.toLowerCase() === 'entregado')
        .reduce((total, orden) => total + (orden.total || 0), 0);

      setStats({
        totalUsuarios: usuarios.length,
        totalProductos: productos.length,
        totalOrdenes: ordenes.length,
        ordenesPendientes,
        ordenesEntregadas,
        ingresosTotales
      });

      const stockCritico = productos.filter(p => {
        const stock = p.stockActual || p.stock || 0;
        const stockCritico = p.stockCritico || p.stock_critico || 5;
        return stock <= stockCritico;
      });

      setProductosStockCritico(stockCritico);

      const ordenesOrdenadas = [...ordenes]
        .sort((a, b) => {
          const dateA = a.fecha ? new Date(a.fecha) : new Date(0);
          const dateB = b.fecha ? new Date(b.fecha) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5);

      setUltimasOrdenes(ordenesOrdenadas);

    } catch (error) {
      setError(error.message);

      setStats({
        totalUsuarios: 0,
        totalProductos: 0,
        totalOrdenes: 0,
        ordenesPendientes: 0,
        ordenesEntregadas: 0,
        ingresosTotales: 0
      });
      setProductosStockCritico([]);
      setUltimasOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    productosStockCritico,
    ultimasOrdenes,
    loading,
    error,
    refreshData: loadDashboardData
  };
};
import { useState, useEffect } from 'react';
import { dataService } from '../dataService';

export const useOrdenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrden, setEditingOrden] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    numeroOrden: '',
    run: '',
    estado: '',
    fecha: ''
  });

  useEffect(() => {
    loadOrdenes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [ordenes, filtros]);

  const normalizarOrdenes = (ordenesBD) => {
    if (!Array.isArray(ordenesBD)) return [];
    
    return ordenesBD.map(orden => {
      return {
        numeroOrden: orden.numeroOrden || '',
        fecha: orden.fecha || '',
        run: orden.usuario ? (orden.usuario.run || '') : '',
        estadoEnvio: orden.estadoEnvio || 'Pendiente',
        total: orden.total || 0,
        productos: orden.detalles ? orden.detalles.map(detalle => ({
          codigo: detalle.producto ? detalle.producto.codigo : '',
          nombre: detalle.producto ? detalle.producto.nombre : '',
          cantidad: detalle.cantidad || 0,
          precio: detalle.producto ? detalle.producto.precio : 0
        })) : []
      };
    });
  };

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ordenesResponse = await dataService.getOrdenes();
      const ordenesNormalizadas = normalizarOrdenes(ordenesResponse);
      
      setOrdenes(ordenesNormalizadas);
      
    } catch (error) {
      setError(`Error al cargar órdenes: ${error.message}`);
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    if (!Array.isArray(ordenes)) {
      setOrdenesFiltradas([]);
      return;
    }

    let filtered = [...ordenes];

    if (filtros.numeroOrden) {
      filtered = filtered.filter(orden => 
        orden.numeroOrden.toLowerCase().includes(filtros.numeroOrden.toLowerCase())
      );
    }

    if (filtros.run) {
      filtered = filtered.filter(orden => 
        orden.run.includes(filtros.run)
      );
    }

    if (filtros.estado) {
      filtered = filtered.filter(orden => 
        orden.estadoEnvio === filtros.estado
      );
    }

    if (filtros.fecha) {
      filtered = filtered.filter(orden => 
        orden.fecha === filtros.fecha
      );
    }

    setOrdenesFiltradas(filtered);
  };

  const handleEdit = (orden) => {
    setEditingOrden(orden);
    setShowModal(true);
  };

  const handleUpdateEstado = async (numeroOrden, nuevoEstado) => {
    try {
      const ordenExistente = ordenes.find(o => o.numeroOrden === numeroOrden);
      if (!ordenExistente) {
        throw new Error('Orden no encontrada');
      }

      const ordenActualizada = {
        ...ordenExistente,
        estadoEnvio: nuevoEstado
      };

      await dataService.updateOrden(ordenActualizada);
      await loadOrdenes();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleDelete = async (numeroOrden) => {
    try {
      await dataService.deleteOrden(numeroOrden);
      await loadOrdenes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrden(null);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      numeroOrden: '',
      run: '',
      estado: '',
      fecha: ''
    });
  };

  const refreshData = () => {
    loadOrdenes();
  };

  const calcularEstadisticasOrdenes = (ordenes) => {
    const totalOrdenes = ordenes.length;
    const pendientes = ordenes.filter(o => o.estadoEnvio === 'Pendiente').length;
    const enviadas = ordenes.filter(o => o.estadoEnvio === 'Enviado').length;
    const entregadas = ordenes.filter(o => o.estadoEnvio === 'Entregado').length;
    const canceladas = ordenes.filter(o => o.estadoEnvio === 'Cancelado').length;
    const ingresosTotales = ordenes
      .filter(o => o.estadoEnvio === 'Entregado')
      .reduce((sum, orden) => sum + orden.total, 0);

    return {
      totalOrdenes,
      pendientes,
      enviadas,
      entregadas,
      canceladas,
      ingresosTotales
    };
  };

  const estadisticas = calcularEstadisticasOrdenes(ordenes);

  return {
    ordenes,
    ordenesFiltradas,
    loading,
    error,
    editingOrden,
    showModal,
    filtros,
    estadisticas,
    handleEdit,
    handleUpdateEstado,
    handleDelete,
    handleCloseModal,
    handleFiltroChange,
    handleLimpiarFiltros,
    refreshData,
    onEdit: handleEdit,
    onUpdate: handleUpdateEstado,
    onDelete: handleDelete,
    onCloseModal: handleCloseModal
  };
};
import { useState, useEffect } from 'react';
import { useProductos } from '../../utils/admin/useProductos';
import ProductosTable from '../../components/admin/ProductosTable';
import ProductoModal from '../../components/admin/ProductoModal';
import ProductosFiltros from '../../components/admin/ProductosFiltros';
import ReporteModal from '../../components/admin/ReporteModal';
import {
  generarReporteCSV,
  generarReporteCSVExcel,
  generarReporteJSON,
  descargarArchivo,
  generarEstadisticas,
  formatearFecha
} from '../../utils/admin/reportUtils';

const SuccessAlert = ({ message, show, onClose }) => {
  if (!show) return null;

  return (
    <div className="alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg"
      style={{ zIndex: 9999, minWidth: '300px' }} role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-check-circle-fill me-2 fs-5"></i>
        <strong>{message}</strong>
        <button
          type="button"
          className="btn-close ms-2"
          onClick={onClose}
          aria-label="Cerrar"
        ></button>
      </div>
    </div>
  );
};

const Productos = () => {
  const {
    productos,
    productosFiltrados,
    categorias,
    loading,
    error,
    editingProducto,
    showModal,
    filtros,
    successMessage,
    showSuccessMessage,
    clearSuccessMessage,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleEdit,
    handleCreateNew,
    handleCloseModal,
    getCodigoAutomatico,
    actualizarCategorias,
    handleFiltroChange,
    handleLimpiarFiltros
  } = useProductos();

  const [showReporteModal, setShowReporteModal] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    document.body.style.backgroundImage = 'url("../src/assets/tienda/fondostardew.png")';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minHeight = '100vh';

    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.minHeight = '';
    };
  }, []);

  const handleSave = async (productoData) => {
    try {
      setActionError('');
      let result;

      if (editingProducto) {
        result = await handleUpdate(editingProducto.codigo, productoData);
      } else {
        result = await handleCreate(productoData);
      }

      if (!result.success) {
        setActionError(result.error);
      } else {
        setTimeout(() => {
          actualizarCategorias();
        }, 100);
      }
    } catch (error) {
      setActionError(`Error: ${error.message}`);
    }
  };

  const handleGenerarReporte = (formato = 'csv') => {
    try {
      const fecha = formatearFecha();
      let contenido, nombreArchivo, tipoMIME;

      if (formato === 'csv') {
        contenido = generarReporteCSV(productosFiltrados);
        nombreArchivo = `reporte_productos_${fecha}.csv`;
        tipoMIME = 'text/csv;charset=utf-8;';
      } else if (formato === 'csv-excel') {
        contenido = generarReporteCSVExcel(productosFiltrados);
        nombreArchivo = `reporte_productos_${fecha}.csv`;
        tipoMIME = 'text/csv;charset=utf-8;';
      } else {
        contenido = generarReporteJSON(productosFiltrados);
        nombreArchivo = `reporte_productos_${fecha}.json`;
        tipoMIME = 'application/json;charset=utf-8;';
      }

      descargarArchivo(contenido, nombreArchivo, tipoMIME);

      const estadisticas = generarEstadisticas(productosFiltrados);

    } catch (error) {
      setActionError('Error al generar el reporte. Por favor, intenta nuevamente.');
    }
  };

  const handleSeleccionCSV = (formato) => {
    handleGenerarReporte(formato);
    setShowReporteModal(false);
  };

  const handleAbrirModalCSV = () => {
    setShowReporteModal(true);
  };

  const handleCerrarModalReporte = () => {
    setShowReporteModal(false);
  };

  const handleReporteJSON = () => {
    const estadisticas = generarEstadisticas(productosFiltrados);

    const confirmar = window.confirm(`
ESTADÍSTICAS DEL REPORTE:

• Total de productos: ${estadisticas.totalProductos}
• Sin stock: ${estadisticas.sinStock}
• Stock crítico: ${estadisticas.stockCritico}
• Stock normal: ${estadisticas.stockNormal}
• Categorías: ${estadisticas.categorias}

¿Deseas descargar el reporte en formato JSON?
    `.trim());

    if (confirmar) {
      handleGenerarReporte('json');
    }
  };

  const handleReporteSolicitado = (formato) => {
    if (formato === 'csv') {
      handleAbrirModalCSV();
    } else {
      handleReporteJSON();
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px', minHeight: '100vh' }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border text-white" role="status">
            <span className="visually-hidden">Cargando productos...</span>
          </div>
          <span className="ms-2 text-white">Cargando productos desde Oracle...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid" style={{ padding: '20px', minHeight: '100vh' }}>
        <div className="alert alert-danger">
          <h4>Error al cargar productos</h4>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const estadisticas = generarEstadisticas(productosFiltrados);

  return (
    <div className="container-fluid" style={{ padding: '20px', minHeight: '100vh' }}>

      <SuccessAlert
        message={successMessage}
        show={showSuccessMessage}
        onClose={clearSuccessMessage}
      />

      {actionError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {actionError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setActionError('')}
          ></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-white fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
          Gestión de Productos
        </h1>
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-success shadow"
            onClick={handleCreateNew}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Agregar Producto
          </button>
          <button
            className="btn btn-primary shadow"
            onClick={() => handleReporteSolicitado('csv')}
          >
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
            Reporte CSV
          </button>
          <button
            className="btn btn-warning shadow"
            onClick={() => handleReporteSolicitado('json')}
          >
            <i className="bi bi-file-code me-2"></i>
            Reporte JSON
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2" style={{ opacity: 0.95 }}>
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Productos Filtrados
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {productosFiltrados.length}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-box-seam fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2" style={{ opacity: 0.95 }}>
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Stock Crítico
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {productosFiltrados.filter(p => p.stock > 0 && p.stock <= p.stock_critico).length}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-exclamation-triangle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-danger shadow h-100 py-2" style={{ opacity: 0.95 }}>
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    Sin Stock
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {productosFiltrados.filter(p => p.stock === 0).length}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-x-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2" style={{ opacity: 0.95 }}>
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Categorías Filtradas
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {new Set(productosFiltrados.map(p => p.categoria)).size}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-tags fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductosFiltros
        filtros={filtros}
        categorias={categorias}
        onFiltroChange={handleFiltroChange}
        onLimpiarFiltros={handleLimpiarFiltros}
        resultados={{
          filtrados: productosFiltrados.length,
          totales: productos.length
        }}
      />

      <ProductosTable
        productos={productosFiltrados}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onGenerarReporte={handleReporteSolicitado}
      />

      <ProductoModal
        show={showModal}
        producto={editingProducto}
        categorias={categorias}
        getCodigoAutomatico={getCodigoAutomatico}
        onSave={handleSave}
        onClose={handleCloseModal}
      />

      <ReporteModal
        show={showReporteModal}
        estadisticas={estadisticas}
        tipo="productos"
        onSeleccionarFormato={handleSeleccionCSV}
        onClose={handleCerrarModalReporte}
      />
    </div>
  );
};

export default Productos;
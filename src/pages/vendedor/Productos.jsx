import { useState, useEffect } from 'react';
import { useProductos } from '../../utils/vendedor/useProductos';
import ProductosTable from '../../components/vendedor/ProductosTable';
import ProductoModal from '../../components/vendedor/ProductoModal';
import ProductosFiltros from '../../components/vendedor/ProductosFiltros';

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
        handleEdit,
        handleCloseModal,
        handleFiltroChange,
        handleLimpiarFiltros
    } = useProductos();

    const [actionError, setActionError] = useState('');

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando productos...</span>
                    </div>
                    <span className="ms-2 text-dark">Cargando productos desde Oracle...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
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

    return (
        <div className="container-fluid px-0">

            {actionError && (
                <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                    <strong>Error:</strong> {actionError}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setActionError('')}
                    ></button>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0 fw-bold text-white" style={{ fontFamily: "'Indie Flower', cursive", textShadow:'2px 2px 4px rgba(0,0,0,0.7)'}}>
                    Gestión de Productos
                </h1>
            </div>

            {/* Estadísticas simplificadas para vendedor */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <div className="text-primary mb-3">
                                <i className="bi bi-box-seam fs-1"></i>
                            </div>
                            <h5 className="card-title fw-bold text-dark mb-1">{productosFiltrados.length}</h5>
                            <p className="card-text text-muted small">Productos Filtrados</p>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <div className="text-warning mb-3">
                                <i className="bi bi-exclamation-triangle fs-1"></i>
                            </div>
                            <h5 className="card-title fw-bold text-dark mb-1">
                                {productosFiltrados.filter(p => p.stock > 0 && p.stock <= p.stock_critico).length}
                            </h5>
                            <p className="card-text text-muted small">Stock Crítico</p>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <div className="text-danger mb-3">
                                <i className="bi bi-x-circle fs-1"></i>
                            </div>
                            <h5 className="card-title fw-bold text-dark mb-1">
                                {productosFiltrados.filter(p => p.stock === 0).length}
                            </h5>
                            <p className="card-text text-muted small">Sin Stock</p>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <div className="text-success mb-3">
                                <i className="bi bi-tags fs-1"></i>
                            </div>
                            <h5 className="card-title fw-bold text-dark mb-1">
                                {new Set(productosFiltrados.map(p => p.categoria)).size}
                            </h5>
                            <p className="card-text text-muted small">Categorías</p>
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
            />

            <ProductoModal
                show={showModal}
                producto={editingProducto}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default Productos;
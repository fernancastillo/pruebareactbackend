import { useState, useEffect } from 'react';
import OrdenesStats from '../../components/vendedor/OrdenesStats';
import OrdenesFiltros from '../../components/vendedor/OrdenesFiltros';
import OrdenesTable from '../../components/vendedor/OrdenesTable';
import OrdenModal from '../../components/vendedor/OrdenModal';
import { useOrdenes } from '../../utils/vendedor/useOrdenes';

const Ordenes = () => {
    const {
        ordenes,
        ordenesFiltradas,
        loading,
        error,
        editingOrden,
        showModal,
        filtros,
        estadisticas,
        handleEdit,
        handleCloseModal,
        handleFiltroChange,
        handleLimpiarFiltros
    } = useOrdenes();

    const [actionError, setActionError] = useState('');

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando órdenes...</span>
                    </div>
                    <span className="ms-2 text-dark">Cargando órdenes desde Oracle...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="alert alert-danger">
                    <h4>Error al cargar órdenes</h4>
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
        <div className="container-fluid px-0"> {/* Sin padding lateral */}

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
                <h1 className="h3 mb-0 fw-bold text-white" style={{ fontFamily: "'Indie Flower', cursive", textShadow:'2px 2px 4px rgba(0,0,0,0.7)' }}>
                    Gestión de Órdenes
                </h1>
            </div>

            <OrdenesStats estadisticas={estadisticas} />

            <OrdenesFiltros
                filtros={filtros}
                onFiltroChange={handleFiltroChange}
                onLimpiarFiltros={handleLimpiarFiltros}
                resultados={{
                    filtradas: ordenesFiltradas.length,
                    totales: ordenes.length
                }}
            />

            <OrdenesTable
                ordenes={ordenesFiltradas}
                onEdit={handleEdit}
            />

            <OrdenModal
                show={showModal}
                orden={editingOrden}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default Ordenes;
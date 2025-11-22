import { useState } from 'react';
import { formatCurrency, formatDate, getEstadoBadge } from '../../utils/vendedor/dashboardUtils';
import { generarBoletaOrden, generarBoletaCSV, generarBoletaTexto } from '../../utils/vendedor/boletaUtils';

const OrdenModal = ({ show, orden, onClose }) => {
    const [showSelectorFormato, setShowSelectorFormato] = useState(false);
    const [actionError, setActionError] = useState('');

    if (!show || !orden) return null;

    const handleDescargarBoleta = () => {
        setShowSelectorFormato(true);
    };

    const handleSeleccionFormato = async (formato) => {
        setShowSelectorFormato(false);

        try {
            switch (formato) {
                case 'html':
                    await generarBoletaOrden(orden);
                    break;
                case 'csv':
                    await generarBoletaCSV(orden);
                    break;
                case 'txt':
                    await generarBoletaTexto(orden);
                    break;
                default:
                    await generarBoletaOrden(orden);
            }
        } catch (error) {
            setActionError('Error al generar la boleta: ' + error.message);
        }
    };

    const handleCerrarSelector = () => {
        setShowSelectorFormato(false);
    };

    const getEstadoDescripcion = (estado) => {
        const descripciones = {
            'Pendiente': 'La orden está pendiente de procesamiento y envío.',
            'Enviado': 'La orden ha sido enviada al cliente.',
            'Entregado': 'La orden ha sido entregada exitosamente.',
            'Cancelado': 'La orden ha sido cancelada.'
        };
        return descripciones[estado] || 'Estado de la orden.';
    };

    return (
        <>
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header" style={{ backgroundColor: '#dedd8ff5' }}>
                            <h5 className="modal-title fw-bold text-dark">
                                <i className="bi bi-receipt me-2"></i>
                                Detalles de Orden: <span className="text-primary">{orden.numeroOrden}</span>
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">

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

                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-header" style={{ backgroundColor: '#87CEEB' }}>
                                            <h6 className="mb-0 fw-bold text-dark">
                                                <i className="bi bi-info-circle me-2"></i>
                                                Información de la Orden
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-sm table-borderless">
                                                <tbody>
                                                    <tr>
                                                        <td className="fw-bold text-muted">Número:</td>
                                                        <td className="fw-semibold">{orden.numeroOrden}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold text-muted">Fecha:</td>
                                                        <td>{formatDate(orden.fecha)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold text-muted">RUN Cliente:</td>
                                                        <td className="fw-semibold">{orden.run}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold text-muted">Total:</td>
                                                        <td className="fw-bold text-primary fs-5">{formatCurrency(orden.total)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-header text-center" style={{ backgroundColor: '#87CEEB' }}>
                                            <h6 className="mb-0 fw-bold text-dark">
                                                <i className="bi bi-truck me-2"></i>
                                                Estado del Envío
                                            </h6>
                                        </div>
                                        <div className="card-body d-flex flex-column justify-content-center align-items-center h-100"> {/* Centrado completo */}
                                            <div className="mb-3 text-center">
                                                {/* ESTADO SOLO LECTURA - SIN SELECTOR DE EDICIÓN */}
                                                <span className={`badge ${getEstadoBadge(orden.estadoEnvio)} fs-6 p-3 d-inline-block`}>
                                                    <i className={`bi ${orden.estadoEnvio === 'Pendiente' ? 'bi-clock' :
                                                            orden.estadoEnvio === 'Enviado' ? 'bi-truck' :
                                                                orden.estadoEnvio === 'Entregado' ? 'bi-check-circle' :
                                                                    'bi-x-circle'
                                                        } me-2`}></i>
                                                    {orden.estadoEnvio}
                                                </span>
                                            </div>
                                            <p className="text-muted text-center mb-0">
                                                <small>
                                                    {getEstadoDescripcion(orden.estadoEnvio)}
                                                </small>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm">
                                <div className="card-header" style={{ backgroundColor: '#87CEEB' }}>
                                    <h6 className="mb-0 fw-bold text-dark">
                                        <i className="bi bi-box-seam me-2"></i>
                                        Productos en la Orden
                                    </h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Código</th>
                                                    <th>Producto</th>
                                                    <th className="text-center">Cantidad</th>
                                                    <th className="text-end">Precio Unitario</th>
                                                    <th className="text-end">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orden.productos.map((producto, index) => (
                                                    <tr key={index}>
                                                        <td className="fw-semibold">{producto.codigo}</td>
                                                        <td>{producto.nombre}</td>
                                                        <td className="text-center">
                                                            <span className="badge bg-primary">{producto.cantidad}</span>
                                                        </td>
                                                        <td className="text-end">{formatCurrency(producto.precio)}</td>
                                                        <td className="text-end fw-bold">
                                                            {formatCurrency(producto.precio * producto.cantidad)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="4" className="text-end fw-bold fs-6">Total:</td>
                                                    <td className="text-end fw-bold text-primary fs-5">
                                                        {formatCurrency(orden.total)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ backgroundColor: '#dedd8ff5' }}>
                            {/* SOLO BOTÓN DESCARGAR BOLETA - SIN EDITAR ESTADO */}
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleDescargarBoleta}
                            >
                                <i className="bi bi-download me-2"></i>
                                Descargar Boleta
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showSelectorFormato && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#dedd8ff5' }}>
                                <h5 className="modal-title fw-bold text-dark">
                                    <i className="bi bi-download me-2"></i>
                                    Formato de Boleta
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCerrarSelector}></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted mb-3">Elige el formato para descargar la boleta:</p>
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-outline-primary text-start"
                                        onClick={() => handleSeleccionFormato('html')}
                                    >
                                        <i className="bi bi-file-earmark-text me-2"></i>
                                        <strong>HTML</strong>
                                        <br />
                                        <small className="text-muted">Para imprimir y mejor visualización</small>
                                    </button>
                                    <button
                                        className="btn btn-outline-success text-start"
                                        onClick={() => handleSeleccionFormato('csv')}
                                    >
                                        <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                                        <strong>CSV</strong>
                                        <br />
                                        <small className="text-muted">Para abrir en Excel</small>
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary text-start"
                                        onClick={() => handleSeleccionFormato('txt')}
                                    >
                                        <i className="bi bi-file-earmark-text me-2"></i>
                                        <strong>Texto Plano</strong>
                                        <br />
                                        <small className="text-muted">Compatible universal</small>
                                    </button>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ backgroundColor: '#dedd8ff5' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleCerrarSelector}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrdenModal;
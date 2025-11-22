import { formatCurrency } from '../../utils/vendedor/dashboardUtils';

const ProductoModal = ({ show, producto, onClose }) => {
    if (!show || !producto) return null;

    const getStockBadge = (stock, stockCritico) => {
        if (stock === 0) return 'bg-danger text-white';
        if (stock <= stockCritico) return 'bg-warning text-dark';
        return 'bg-success text-white';
    };

    const getCategoriaBadge = (categoria) => {
        const categoriasColors = {
            'Accesorios': 'bg-primary text-white',
            'Decoración': 'bg-success text-white',
            'Guías': 'bg-info text-white',
            'Juego De Mesa': 'bg-warning text-dark',
            'Mods Digitales': 'bg-secondary text-white',
            'Peluches': 'bg-danger text-white',
            'Polera Personalizada': 'bg-dark text-white'
        };
        return categoriasColors[categoria] || 'bg-secondary text-white';
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header" style={{ backgroundColor: '#dedd8ff5' }}>
                        <h5 className="modal-title fw-bold text-dark">
                            <i className="bi bi-box-seam me-2"></i>
                            Detalles del Producto: <span className="text-primary">{producto.codigo}</span>
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-header" style={{ backgroundColor: '#87CEEB' }}>
                                        <h6 className="mb-0 fw-bold text-dark">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Información del Producto
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-sm table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td className="fw-bold text-muted">Código:</td>
                                                    <td className="fw-semibold">{producto.codigo}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold text-muted">Nombre:</td>
                                                    <td className="fw-semibold">{producto.nombre}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold text-muted">Categoría:</td>
                                                    <td>
                                                        <span className={`badge ${getCategoriaBadge(producto.categoria)}`}>
                                                            {producto.categoria}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold text-muted">Precio:</td>
                                                    <td className="fw-bold text-primary fs-5">{formatCurrency(producto.precio)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-header" style={{ backgroundColor: '#87CEEB' }}>
                                        <h6 className="mb-0 fw-bold text-dark">
                                            <i className="bi bi-graph-up me-2"></i>
                                            Información de Stock
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-sm table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td className="fw-bold text-muted">Stock Actual:</td>
                                                    <td>
                                                        <span className={`badge ${getStockBadge(producto.stock, producto.stock_critico)} fs-6`}>
                                                            {producto.stock} unidades
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold text-muted">Stock Crítico:</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark fs-6">
                                                            {producto.stock_critico} unidades
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold text-muted">Estado:</td>
                                                    <td>
                                                        {producto.stock === 0 ? (
                                                            <span className="badge bg-danger text-white">Sin Stock</span>
                                                        ) : producto.stock <= producto.stock_critico ? (
                                                            <span className="badge bg-warning text-dark">Stock Crítico</span>
                                                        ) : (
                                                            <span className="badge bg-success text-white">Stock Normal</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-header" style={{ backgroundColor: '#87CEEB' }}>
                                <h6 className="mb-0 fw-bold text-dark">
                                    <i className="bi bi-card-text me-2"></i>
                                    Descripción del Producto
                                </h6>
                            </div>
                            <div className="card-body">
                                <p className="mb-0">{producto.descripcion}</p>
                            </div>
                        </div>

                        {producto.imagen && (
                            <div className="card border-0 shadow-sm mt-4">
                                <div className="card-header" style={{ backgroundColor: '#87CEEB' }}>
                                    <h6 className="mb-0 fw-bold text-dark">
                                        <i className="bi bi-image me-2"></i>
                                        Imagen del Producto
                                    </h6>
                                </div>
                                <div className="card-body text-center">
                                    <img
                                        src={producto.imagen}
                                        alt={producto.nombre}
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '300px', maxWidth: '100%' }}
                                        onError={(e) => {
                                            e.target.src = '/src/assets/admin/producto-default.png';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer" style={{ backgroundColor: '#dedd8ff5' }}>
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
    );
};

export default ProductoModal;
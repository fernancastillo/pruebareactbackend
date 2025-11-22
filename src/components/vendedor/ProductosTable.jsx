import { formatCurrency } from '../../utils/vendedor/dashboardUtils';

const ProductosTable = ({ productos, onEdit }) => {
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
        <div className="card shadow-sm border-0">
            <div className="card-header border-0 bg-transparent">
                <h6 className="m-0 fw-bold text-dark" style={{ fontFamily: "'Indie Flower', cursive" }}>
                    Lista de Productos
                </h6>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Stock Crítico</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((producto) => (
                                <tr key={producto.codigo}>
                                    <td>
                                        <strong>{producto.codigo}</strong>
                                    </td>
                                    <td>
                                        <div>
                                            <strong>{producto.nombre}</strong>
                                            <br />
                                            <small className="text-muted">{producto.descripcion}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getCategoriaBadge(producto.categoria)}`}>
                                            {producto.categoria}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{formatCurrency(producto.precio)}</strong>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStockBadge(producto.stock, producto.stock_critico)}`}>
                                            {producto.stock} unidades
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge bg-light text-dark">
                                            {producto.stock_critico}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => onEdit(producto)}
                                            title="Ver detalles del producto"
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {productos.length === 0 && (
                    <div className="text-center py-4">
                        <i className="bi bi-inbox fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No se encontraron productos</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductosTable;
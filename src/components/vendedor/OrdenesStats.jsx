import { formatCurrency } from '../../utils/vendedor/dashboardUtils';

const OrdenesStats = ({ estadisticas }) => {
    const statCards = [
        {
            title: 'Total Órdenes',
            value: estadisticas.totalOrdenes,
            icon: 'bi-cart-check',
            color: 'primary'
        },
        {
            title: 'Pendientes',
            value: estadisticas.pendientes,
            icon: 'bi-clock-history',
            color: 'warning'
        },
        {
            title: 'Enviadas',
            value: estadisticas.enviadas,
            icon: 'bi-truck',
            color: 'info'
        },
        {
            title: 'Entregadas',
            value: estadisticas.entregadas,
            icon: 'bi-check-circle',
            color: 'success'
        },
        {
            title: 'Canceladas',
            value: estadisticas.canceladas,
            icon: 'bi-x-circle',
            color: 'danger'
        },
        {
            title: 'Ingresos Totales',
            value: formatCurrency(estadisticas.ingresosTotales),
            icon: 'bi-currency-dollar',
            color: 'secondary'
        }
    ];

    return (
        <div className="row mb-4">
            {statCards.map((card, index) => (
                <div key={index} className="col-xl-2 col-md-4 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <div className={`text-${card.color} mb-3`}>
                                <i className={`bi ${card.icon} fs-1`}></i>
                            </div>
                            <h5 className="card-title fw-bold text-dark mb-1">{card.value}</h5>
                            <p className="card-text text-muted small">{card.title}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrdenesStats;
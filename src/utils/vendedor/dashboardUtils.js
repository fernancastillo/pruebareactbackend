// src/utils/vendedor/dashboardUtils.js
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0';
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(amount);
};

export const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';

    try {
        // Manejar diferentes formatos de fecha desde Oracle
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            // Intentar con formato de Oracle SQL Date
            const oracleDate = new Date(dateString.split(' ')[0]);
            if (!isNaN(oracleDate.getTime())) {
                return oracleDate.toLocaleDateString('es-CL');
            }
            return 'Fecha inválida';
        }

        return date.toLocaleDateString('es-CL');
    } catch (error) {
        console.error('Error formateando fecha:', dateString, error);
        return 'Error en fecha';
    }
};

export const getEstadoBadge = (estado) => {
    if (!estado) return 'bg-secondary';

    const estadoLower = estado.toLowerCase();
    const badgeClasses = {
        'entregado': 'entregado-custom text-dark',
        'pendiente': 'pendiente-custom text-dark',
        'enviado': 'enviado-custom text-dark',
        'cancelado': 'cancelado-custom text-dark',
        'procesando': 'bg-primary text-white'
    };
    return badgeClasses[estadoLower] || 'bg-secondary text-dark';
};

// Función auxiliar para validar datos desde Oracle
export const validateOracleData = (data) => {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
};
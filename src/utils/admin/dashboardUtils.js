// src/utils/admin/dashboardUtils.js
export const formatCurrency = (amount) => {
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
    'entregado': 'bg-success',
    'pendiente': 'bg-warning',
    'enviado': 'bg-info',
    'cancelado': 'bg-danger',
    'procesando': 'bg-primary'
  };
  return badgeClasses[estadoLower] || 'bg-secondary';
};

export const calculateTasaEntrega = (entregadas, total) => {
  return total > 0 ? Math.round((entregadas / total) * 100) : 0;
};

// Función auxiliar para validar datos desde Oracle
export const validateOracleData = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};
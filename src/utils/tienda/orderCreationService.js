import { orderService } from './orderService';

export const orderCreationService = {
  // Generar número de orden automático
  generateOrderNumber: async () => {
    const ordenes = await orderService.getAllOrders();
    
    if (ordenes.length === 0) {
      return 'SO1001';
    }

    // Encontrar el número más alto
    const orderNumbers = ordenes
      .map(order => order.numeroOrden)
      .filter(num => num && num.startsWith('SO'))
      .map(num => parseInt(num.replace('SO', '')))
      .filter(num => !isNaN(num));

    if (orderNumbers.length === 0) {
      return 'SO1001';
    }

    const lastNumber = Math.max(...orderNumbers);
    const newNumber = lastNumber + 1;
    
    return `SO${newNumber}`;
  },

  // Obtener fecha actual
  getCurrentDate: () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  },

  // Crear nueva orden
  createOrder: async (user, cartItems, total, discountCode = '', paymentData = null) => {
    const orderNumber = await orderCreationService.generateOrderNumber();
    
    const nuevaOrden = {
      numeroOrden: orderNumber,
      fecha: orderCreationService.getCurrentDate(),
      run: user.run || user.id,
      usuario: user.nombre || user.email,
      estadoEnvio: 'Pendiente',
      total: total,
      productos: cartItems.map(item => ({
        codigo: item.codigo,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precioOferta || item.precio,
        imagen: item.imagen
      })),
      descuentoAplicado: discountCode || '',
      metodoPago: paymentData?.paymentMethod || 'Tarjeta de Crédito',
      transaccionId: paymentData?.transactionId || '',
      fechaPago: orderCreationService.getCurrentDate()
    };

    return nuevaOrden;
  },

  // Guardar orden
  saveOrder: async (orden) => {
    try {
      const success = await orderService.createOrder(orden);
      if (success) {
        console.log('✅ Orden guardada exitosamente:', orden.numeroOrden);
      }
      return success;
    } catch (error) {
      console.error('❌ Error al guardar orden:', error);
      return false;
    }
  }
};

export default orderCreationService;
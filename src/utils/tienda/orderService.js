import { dataService } from '../dataService';

export const orderService = {
  // Obtener todas las órdenes desde la base de datos
  getAllOrders: async () => {
    try {
      const orders = await dataService.getOrdenes();
      console.log('🔍 TODAS LAS ÓRDENES DESDE BD:', orders);
      
      // Mostrar estructura de las primeras órdenes para diagnóstico
      if (orders.length > 0) {
        console.log('📋 ESTRUCTURA DE LAS ÓRDENES:');
        orders.slice(0, 3).forEach((order, index) => {
          console.log(`Orden ${index + 1}:`, {
            numeroOrden: order.numeroOrden,
            run: order.run,
            usuario: order.usuario,
            userId: order.userId,
            cliente: order.cliente,
            camposDisponibles: Object.keys(order)
          });
        });
      }
      
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      console.error('Error al obtener órdenes desde BD:', error);
      
      // Fallback a localStorage
      try {
        const localOrders = localStorage.getItem('app_ordenes');
        const parsedOrders = localOrders ? JSON.parse(localOrders) : [];
        console.log('Órdenes desde localStorage:', parsedOrders);
        return parsedOrders;
      } catch (localError) {
        console.error('Error al obtener órdenes desde localStorage:', localError);
        return [];
      }
    }
  },

  // Obtener órdenes de un usuario específico por RUN
  getUserOrders: async (userRun) => {
    try {
      console.log('🔍 Buscando órdenes para RUN:', userRun);
      
      if (!userRun) {
        console.error('RUN del usuario no proporcionado');
        return [];
      }

      const orders = await orderService.getAllOrders();
      
      console.log('🎯 BUSQUEDA DETALLADA:');
      let matchCount = 0;
      
      // Buscar órdenes que coincidan con el RUN del usuario
      const userOrders = orders.filter(order => {
        // Verificar diferentes formatos de RUN en la base de datos
        const runMatch = 
          order.run === userRun || 
          order.usuario === userRun ||
          order.userId === userRun ||
          order.cliente === userRun ||
          order.idUsuario === userRun ||
          order.runUsuario === userRun;
        
        // También verificar como número si es necesario
        const runAsNumberMatch = 
          order.run == userRun || // == para comparación flexible
          order.usuario == userRun ||
          order.userId == userRun;
        
        const matches = runMatch || runAsNumberMatch;
        
        if (matches) {
          matchCount++;
          console.log(`✅ ORDEN ENCONTRADA:`, {
            numeroOrden: order.numeroOrden,
            runEnBD: order.run,
            usuarioEnBD: order.usuario,
            userIdEnBD: order.userId,
            clienteEnBD: order.cliente
          });
        }
        
        return matches;
      });
      
      console.log(`📊 RESULTADO: ${matchCount} órdenes encontradas de ${orders.length} totales`);
      
      if (matchCount === 0) {
        console.log('❌ NO SE ENCONTRARON COINCIDENCIAS. Campos disponibles en las órdenes:');
        orders.slice(0, 2).forEach((order, index) => {
          console.log(`Orden ${index + 1} - Campos:`, Object.keys(order));
          console.log(`Orden ${index + 1} - Valores:`, {
            run: order.run,
            usuario: order.usuario, 
            userId: order.userId,
            cliente: order.cliente,
            idUsuario: order.idUsuario,
            runUsuario: order.runUsuario
          });
        });
      }
      
      return userOrders;
    } catch (error) {
      console.error('Error al obtener órdenes del usuario:', error);
      return [];
    }
  },

  // Obtener orden por número de orden
  getOrderByNumber: async (orderNumber) => {
    const orders = await orderService.getAllOrders();
    return orders.find(order => order.numeroOrden === orderNumber);
  },

  // Crear nueva orden
  createOrder: async (orderData) => {
    try {
      // Guardar en la base de datos
      const result = await dataService.addOrden(orderData);
      console.log('Orden guardada en BD:', result);
      
      // También guardar en localStorage como respaldo
      const orders = await orderService.getAllOrders();
      const newOrders = [...orders, orderData];
      localStorage.setItem('app_ordenes', JSON.stringify(newOrders));
      
      return true;
    } catch (error) {
      console.error('Error al crear orden en BD:', error);
      
      // Fallback a localStorage
      try {
        const orders = JSON.parse(localStorage.getItem('app_ordenes') || '[]');
        orders.push(orderData);
        localStorage.setItem('app_ordenes', JSON.stringify(orders));
        console.log('Orden guardada en localStorage como respaldo');
        return true;
      } catch (localError) {
        console.error('Error al guardar orden en localStorage:', localError);
        return false;
      }
    }
  },

  // Verificar si hay órdenes en el sistema
  checkOrdersExistence: async () => {
    const orders = await orderService.getAllOrders();
    return {
      exists: orders.length > 0,
      count: orders.length,
      sample: orders.length > 0 ? orders[0] : null
    };
  }
};
import { dataService } from '../dataService';

export const vendedorService = {
    // Obtener estadísticas del vendedor
    getEstadisticas: async () => {
        try {
            const [productos, ordenes] = await Promise.all([
                dataService.getProductos(),
                dataService.getOrdenes()
            ]);

            return {
                totalProductos: productos.length,
                totalOrdenes: ordenes.length,
                ordenesPendientes: ordenes.filter(orden =>
                    orden.estadoEnvio === 'Pendiente' || orden.estadoEnvio === 'Procesando'
                ).length,
                productosStockBajo: productos.filter(producto =>
                    producto.stock < 10
                ).length
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                totalProductos: 0,
                totalOrdenes: 0,
                ordenesPendientes: 0,
                productosStockBajo: 0
            };
        }
    },

    // Obtener órdenes recientes
    getOrdenesRecientes: async (limite = 5) => {
        try {
            const ordenes = await dataService.getOrdenes();
            return ordenes
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, limite);
        } catch (error) {
            console.error('Error obteniendo órdenes recientes:', error);
            return [];
        }
    },

    // Obtener productos con stock bajo
    getProductosStockBajo: async () => {
        try {
            const productos = await dataService.getProductos();
            return productos.filter(producto => producto.stock < 10);
        } catch (error) {
            console.error('Error obteniendo productos con stock bajo:', error);
            return [];
        }
    }
};
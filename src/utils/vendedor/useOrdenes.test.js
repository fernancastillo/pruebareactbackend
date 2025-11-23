import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrdenes } from './useOrdenes';

vi.mock('../dataService', () => ({
  dataService: {
    getOrdenes: vi.fn(),
    updateOrdenEstado: vi.fn(),
    updateOrden: vi.fn()
  }
}));

import { dataService } from '../dataService';

describe('useOrdenes', () => {
  const mockOrdenesBD = [
    {
      numeroOrden: 'ORD001',
      fecha: '2024-01-15',
      usuario: { run: '12345678-9', nombre: 'Juan Pérez' },
      estadoEnvio: 'Pendiente',
      total: 50000,
      detalles: [
        {
          cantidad: 2,
          producto: {
            codigo: 'PROD1',
            nombre: 'Producto 1',
            precio: 25000
          }
        }
      ]
    },
    {
      numeroOrden: 'ORD002',
      fecha: '2024-01-16',
      usuario: { run: '98765432-1', nombre: 'Ana García' },
      estadoEnvio: 'Enviado',
      total: 75000,
      detalles: [
        {
          cantidad: 1,
          producto: {
            codigo: 'PROD2',
            nombre: 'Producto 2',
            precio: 75000
          }
        }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería inicializar con estados por defecto', () => {
    dataService.getOrdenes.mockResolvedValue([]);

    const { result } = renderHook(() => useOrdenes());

    expect(result.current.ordenes).toEqual([]);
    expect(result.current.ordenesFiltradas).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.editingOrden).toBe(null);
    expect(result.current.showModal).toBe(false);
    expect(result.current.filtros).toEqual({
      numeroOrden: '',
      run: '',
      estado: '',
      fecha: ''
    });
  });

  it('debería cargar órdenes correctamente', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(dataService.getOrdenes).toHaveBeenCalledOnce();
    expect(result.current.ordenes).toHaveLength(2);
    expect(result.current.ordenes[0].numeroOrden).toBe('ORD001');
    expect(result.current.ordenes[0].run).toBe('12345678-9');
    expect(result.current.ordenes[0].estadoEnvio).toBe('Pendiente');
  });

  it('debería manejar error al cargar órdenes', async () => {
    dataService.getOrdenes.mockRejectedValue(new Error('Error de conexión'));

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar órdenes: Error de conexión');
    expect(result.current.ordenes).toEqual([]);
  });

  it('debería normalizar órdenes correctamente', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const ordenNormalizada = result.current.ordenes[0];
    expect(ordenNormalizada.numeroOrden).toBe('ORD001');
    expect(ordenNormalizada.run).toBe('12345678-9');
    expect(ordenNormalizada.estadoEnvio).toBe('Pendiente');
    expect(ordenNormalizada.total).toBe(50000);
    expect(ordenNormalizada.productos).toHaveLength(1);
    expect(ordenNormalizada.productos[0].codigo).toBe('PROD1');
    expect(ordenNormalizada.productos[0].nombre).toBe('Producto 1');
    expect(ordenNormalizada.productos[0].cantidad).toBe(2);
    expect(ordenNormalizada.productos[0].precio).toBe(25000);
  });

  it('debería manejar órdenes sin usuario', async () => {
    const ordenSinUsuario = {
      numeroOrden: 'ORD003',
      fecha: '2024-01-17',
      estadoEnvio: 'Pendiente',
      total: 30000,
      detalles: []
    };

    dataService.getOrdenes.mockResolvedValue([ordenSinUsuario]);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ordenes[0].run).toBe('');
    expect(result.current.ordenes[0].usuario).toBe(null);
  });

  it('debería filtrar órdenes por número de orden', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleFiltroChange({
        target: { name: 'numeroOrden', value: 'ORD001' }
      });
    });

    expect(result.current.ordenesFiltradas).toHaveLength(1);
    expect(result.current.ordenesFiltradas[0].numeroOrden).toBe('ORD001');
  });

  it('debería filtrar órdenes por RUN', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleFiltroChange({
        target: { name: 'run', value: '12345678-9' }
      });
    });

    expect(result.current.ordenesFiltradas).toHaveLength(1);
    expect(result.current.ordenesFiltradas[0].run).toBe('12345678-9');
  });

  it('debería filtrar órdenes por estado', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleFiltroChange({
        target: { name: 'estado', value: 'Enviado' }
      });
    });

    expect(result.current.ordenesFiltradas).toHaveLength(1);
    expect(result.current.ordenesFiltradas[0].estadoEnvio).toBe('Enviado');
  });

  it('debería filtrar órdenes por fecha', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleFiltroChange({
        target: { name: 'fecha', value: '2024-01-15' }
      });
    });

    expect(result.current.ordenesFiltradas).toHaveLength(1);
    expect(result.current.ordenesFiltradas[0].fecha).toBe('2024-01-15');
  });

  it('debería limpiar filtros correctamente', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleFiltroChange({
        target: { name: 'numeroOrden', value: 'ORD001' }
      });
    });

    expect(result.current.filtros.numeroOrden).toBe('ORD001');

    act(() => {
      result.current.handleLimpiarFiltros();
    });

    expect(result.current.filtros).toEqual({
      numeroOrden: '',
      run: '',
      estado: '',
      fecha: ''
    });
    expect(result.current.ordenesFiltradas).toHaveLength(2);
  });

  it('debería manejar edición de orden', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const ordenAEditar = result.current.ordenes[0];

    act(() => {
      result.current.handleEdit(ordenAEditar);
    });

    expect(result.current.editingOrden).toBe(ordenAEditar);
    expect(result.current.showModal).toBe(true);
  });

  it('debería cerrar modal correctamente', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleEdit(result.current.ordenes[0]);
    });

    expect(result.current.showModal).toBe(true);

    act(() => {
      result.current.handleCloseModal();
    });

    expect(result.current.editingOrden).toBe(null);
    expect(result.current.showModal).toBe(false);
  });

  it('debería calcular estadísticas correctamente', async () => {
    const ordenesConEstados = [
      { ...mockOrdenesBD[0], estadoEnvio: 'Pendiente', total: 50000 },
      { ...mockOrdenesBD[1], estadoEnvio: 'Enviado', total: 75000 },
      { numeroOrden: 'ORD003', estadoEnvio: 'Entregado', total: 100000 },
      { numeroOrden: 'ORD004', estadoEnvio: 'Cancelado', total: 25000 }
    ];

    dataService.getOrdenes.mockResolvedValue(ordenesConEstados);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.estadisticas.totalOrdenes).toBe(4);
    expect(result.current.estadisticas.pendientes).toBe(1);
    expect(result.current.estadisticas.enviadas).toBe(1);
    expect(result.current.estadisticas.entregadas).toBe(1);
    expect(result.current.estadisticas.canceladas).toBe(1);
    expect(result.current.estadisticas.ingresosTotales).toBe(100000);
  });

  it('debería refrescar datos correctamente', async () => {
    dataService.getOrdenes.mockResolvedValue(mockOrdenesBD);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(dataService.getOrdenes).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refreshData();
    });

    expect(dataService.getOrdenes).toHaveBeenCalledTimes(2);
  });

  it('debería manejar array vacío de órdenes', async () => {
    dataService.getOrdenes.mockResolvedValue([]);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ordenes).toEqual([]);
    expect(result.current.ordenesFiltradas).toEqual([]);
    expect(result.current.estadisticas.totalOrdenes).toBe(0);
  });

  it('debería manejar datos no array en normalizarOrdenes', async () => {
    dataService.getOrdenes.mockResolvedValue(null);

    const { result } = renderHook(() => useOrdenes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ordenes).toEqual([]);
  });
});
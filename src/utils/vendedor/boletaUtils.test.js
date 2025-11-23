import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generarBoletaOrden, generarBoletaCSV, generarBoletaTexto } from './boletaUtils';
import { formatCurrency, formatDate } from './dashboardUtils';

vi.mock('./dashboardUtils', () => ({
  formatCurrency: vi.fn(),
  formatDate: vi.fn()
}));

describe('boletaUtils', () => {
  const mockOrden = {
    numeroOrden: 'ORD001',
    fecha: '2024-01-15',
    run: '12345678-9',
    estadoEnvio: 'Pendiente',
    total: 50000,
    productos: [
      {
        codigo: 'PROD1',
        nombre: 'Producto Test 1',
        cantidad: 2,
        precio: 25000
      },
      {
        codigo: 'PROD2',
        nombre: 'Producto Test 2',
        cantidad: 1,
        precio: 30000
      }
    ]
  };

  let blobContent = '';

  beforeEach(() => {
    vi.clearAllMocks();
    
    formatCurrency.mockImplementation((amount) => `$${amount.toLocaleString('es-CL')}`);
    formatDate.mockImplementation((date) => new Date(date).toLocaleDateString('es-CL'));
    
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn()
    };
    
    global.document.createElement = vi.fn().mockReturnValue(mockLink);
    global.document.body.appendChild = vi.fn();
    global.document.body.removeChild = vi.fn();
    
    global.Blob = vi.fn().mockImplementation(function(content, options) {
      blobContent = content[0];
      return {
        size: content[0].length,
        type: options?.type || ''
      };
    });
  });

  describe('generarBoletaOrden', () => {
    it('debería generar boleta HTML exitosamente', () => {
      const result = generarBoletaOrden(mockOrden);
      
      expect(result).toBe(true);
      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('debería lanzar error si falla la generación', () => {
      global.URL.createObjectURL = vi.fn(() => { throw new Error('Error mock'); });
      
      expect(() => {
        generarBoletaOrden(mockOrden);
      }).toThrow('No se pudo generar la boleta en formato HTML');
    });

    it('debería incluir todos los datos de la orden en el HTML', () => {
      generarBoletaOrden(mockOrden);
      
      expect(blobContent).toContain(mockOrden.numeroOrden);
      expect(blobContent).toContain(mockOrden.run);
      expect(blobContent).toContain(mockOrden.estadoEnvio);
      expect(blobContent).toContain('JUNIMO STORE');
      expect(blobContent).toContain('VERSIÓN VENDEDOR');
    });

    it('debería manejar orden sin productos', () => {
      const ordenSinProductos = {
        ...mockOrden,
        productos: []
      };
      
      expect(() => {
        generarBoletaOrden(ordenSinProductos);
      }).not.toThrow();
    });
  });

  describe('generarBoletaCSV', () => {
    it('debería generar boleta CSV exitosamente', () => {
      const result = generarBoletaCSV(mockOrden);
      
      expect(result).toBe(true);
      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('debería lanzar error si falla la generación CSV', () => {
      global.URL.createObjectURL = vi.fn(() => { throw new Error('Error mock'); });
      
      expect(() => {
        generarBoletaCSV(mockOrden);
      }).toThrow('No se pudo generar la boleta en formato CSV');
    });

    it('debería incluir todos los datos en el CSV', () => {
      generarBoletaCSV(mockOrden);
      
      expect(blobContent).toContain(mockOrden.numeroOrden);
      expect(blobContent).toContain(mockOrden.run);
      expect(blobContent).toContain(mockOrden.estadoEnvio);
      expect(blobContent).toContain('JUNIMO STORE');
      expect(blobContent).toContain('VERSIÓN VENDEDOR');
      expect(blobContent).toContain('PROD1');
      expect(blobContent).toContain('PROD2');
    });

    it('debería incluir BOM para UTF-8 en CSV', () => {
      generarBoletaCSV(mockOrden);
      
      expect(blobContent.startsWith('\uFEFF')).toBe(true);
    });
  });

  describe('generarBoletaTexto', () => {
    it('debería generar boleta texto exitosamente', () => {
      const result = generarBoletaTexto(mockOrden);
      
      expect(result).toBe(true);
      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('debería lanzar error si falla la generación texto', () => {
      global.URL.createObjectURL = vi.fn(() => { throw new Error('Error mock'); });
      
      expect(() => {
        generarBoletaTexto(mockOrden);
      }).toThrow('No se pudo generar la boleta en formato texto');
    });

    it('debería incluir todos los datos en el texto', () => {
      generarBoletaTexto(mockOrden);
      
      expect(blobContent).toContain(mockOrden.numeroOrden);
      expect(blobContent).toContain(mockOrden.run);
      expect(blobContent).toContain(mockOrden.estadoEnvio);
      expect(blobContent).toContain('JUNIMO STORE');
      expect(blobContent).toContain('VERSIÓN VENDEDOR');
      expect(blobContent).toContain('PROD1');
      expect(blobContent).toContain('PROD2');
    });

    it('debería formatear correctamente los productos en texto', () => {
      generarBoletaTexto(mockOrden);
      
      expect(blobContent).toContain('• PROD1 - Producto Test 1');
      expect(blobContent).toContain('Cantidad: 2');
    });
  });

  describe('formatCurrency y formatDate', () => {
    it('debería usar formatCurrency para precios', () => {
      generarBoletaOrden(mockOrden);
      
      expect(formatCurrency).toHaveBeenCalledWith(25000);
      expect(formatCurrency).toHaveBeenCalledWith(30000);
      expect(formatCurrency).toHaveBeenCalledWith(50000);
    });

    it('debería usar formatDate para fechas', () => {
      generarBoletaOrden(mockOrden);
      
      expect(formatDate).toHaveBeenCalledWith(mockOrden.fecha);
    });
  });

  describe('Manejo de nombres de archivo', () => {
    it('debería usar el número de orden en el nombre del archivo HTML', () => {
      generarBoletaOrden(mockOrden);
      
      const mockLink = global.document.createElement();
      expect(mockLink.download).toBe('boleta_ORD001.html');
    });

    it('debería usar el número de orden en el nombre del archivo CSV', () => {
      generarBoletaCSV(mockOrden);
      
      const mockLink = global.document.createElement();
      expect(mockLink.download).toBe('boleta_ORD001.csv');
    });

    it('debería usar el número de orden en el nombre del archivo texto', () => {
      generarBoletaTexto(mockOrden);
      
      const mockLink = global.document.createElement();
      expect(mockLink.download).toBe('boleta_ORD001.txt');
    });
  });

  describe('Manejo de diferentes estados', () => {
    const estados = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado'];
    
    estados.forEach(estado => {
      it(`debería manejar estado ${estado} correctamente`, () => {
        const ordenConEstado = { ...mockOrden, estadoEnvio: estado };
        
        expect(() => {
          generarBoletaOrden(ordenConEstado);
        }).not.toThrow();
        
        expect(blobContent).toContain(estado);
        expect(blobContent).toContain(`estado-${estado.toLowerCase()}`);
      });
    });
  });

  describe('Tipos MIME correctos', () => {
    it('debería usar tipo MIME correcto para HTML', () => {
      generarBoletaOrden(mockOrden);
      
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.any(String)],
        { type: 'text/html' }
      );
    });

    it('debería usar tipo MIME correcto para CSV', () => {
      generarBoletaCSV(mockOrden);
      
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.any(String)],
        { type: 'text/csv;charset=utf-8' }
      );
    });

    it('debería usar tipo MIME correcto para texto', () => {
      generarBoletaTexto(mockOrden);
      
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.any(String)],
        { type: 'text/plain' }
      );
    });
  });
});
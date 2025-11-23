import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductosFiltros from './ProductosFiltros';

describe('ProductosFiltros', () => {
  // Datos de prueba
  const mockFiltros = {
    codigo: '',
    nombre: '',
    categoria: '',
    estadoStock: '',
    precioMin: '',
    precioMax: '',
    stockMin: '',
    ordenarPor: 'nombre'
  };

  const mockResultados = {
    filtrados: 5,
    totales: 10
  };

  const mockCategorias = ['Electrónicos', 'Ropa', 'Hogar', 'Deportes'];

  const mockOnFiltroChange = vi.fn();
  const mockOnLimpiarFiltros = vi.fn();

  const renderComponent = (props = {}) => {
    const defaultProps = {
      filtros: mockFiltros,
      onFiltroChange: mockOnFiltroChange,
      onLimpiarFiltros: mockOnLimpiarFiltros,
      resultados: mockResultados,
      categorias: mockCategorias
    };

    return render(<ProductosFiltros {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('debería renderizar todos los campos de filtro', () => {
      renderComponent();

      // Verificar que todos los campos estén presentes
      expect(screen.getByPlaceholderText('Ej: PROD001')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ej: Laptop Gamer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Todas las categorías')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Todos los estados')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ej: 10000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ej: 500000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ej: 5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Nombre (A-Z)')).toBeInTheDocument();
    });

    it('debería renderizar el botón de limpiar filtros', () => {
      renderComponent();

      const botonLimpiar = screen.getByText('Limpiar Filtros');
      expect(botonLimpiar).toBeInTheDocument();
      expect(botonLimpiar).toHaveClass('btn-outline-dark');
    });

    it('debería mostrar el contador de resultados', () => {
      renderComponent();

      expect(screen.getByText('5 de 10 productos encontrados')).toBeInTheDocument();
    });

    it('debería renderizar todas las categorías en el select', () => {
      renderComponent();

      // Verificar que todas las categorías estén en las opciones
      mockCategorias.forEach(categoria => {
        expect(screen.getByText(categoria)).toBeInTheDocument();
      });
    });
  });

  describe('Comportamiento de los Filtros', () => {
    it('debería llamar onFiltroChange cuando se cambia un campo de texto', () => {
      renderComponent();

      const inputCodigo = screen.getByPlaceholderText('Ej: PROD001');
      fireEvent.change(inputCodigo, { target: { value: 'PROD001', name: 'codigo' } });

      expect(mockOnFiltroChange).toHaveBeenCalledTimes(1);
    });

    it('debería llamar onFiltroChange cuando se cambia un select', () => {
      renderComponent();

      const selectCategoria = screen.getByDisplayValue('Todas las categorías');
      fireEvent.change(selectCategoria, { 
        target: { value: 'Electrónicos', name: 'categoria' } 
      });

      expect(mockOnFiltroChange).toHaveBeenCalledTimes(1);
    });

    it('debería llamar onLimpiarFiltros al hacer clic en el botón', () => {
      renderComponent();

      const botonLimpiar = screen.getByText('Limpiar Filtros');
      fireEvent.click(botonLimpiar);

      expect(mockOnLimpiarFiltros).toHaveBeenCalledTimes(1);
    });

  });

  describe('Opciones de los Selects', () => {
    it('debería tener todas las opciones de estado de stock', () => {
      renderComponent();

      // Verificar opciones de estado de stock
      expect(screen.getByText('Stock Normal')).toBeInTheDocument();
      expect(screen.getByText('Stock Crítico')).toBeInTheDocument();
      expect(screen.getByText('Sin Stock')).toBeInTheDocument();
    });

    it('debería tener todas las opciones de ordenamiento', () => {
      renderComponent();

      // Verificar opciones de ordenamiento - usar getAllByText para "Código"
      expect(screen.getByText('Nombre (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('Nombre (Z-A)')).toBeInTheDocument();
      expect(screen.getByText('Precio (Menor a Mayor)')).toBeInTheDocument();
      expect(screen.getByText('Precio (Mayor a Menor)')).toBeInTheDocument();
      expect(screen.getByText('Stock (Menor a Mayor)')).toBeInTheDocument();
      expect(screen.getByText('Stock (Mayor a Menor)')).toBeInTheDocument();
      
      // Para "Código" que aparece múltiples veces, verificar que existe al menos uno
      const elementosCodigo = screen.getAllByText('Código');
      expect(elementosCodigo.length).toBeGreaterThan(0);
    });
  });

  describe('Validaciones y Restricciones', () => {
    it('debería tener atributos min en campos numéricos', () => {
      renderComponent();

      const precioMin = screen.getByPlaceholderText('Ej: 10000');
      const precioMax = screen.getByPlaceholderText('Ej: 500000');
      const stockMin = screen.getByPlaceholderText('Ej: 5');

      expect(precioMin).toHaveAttribute('min', '0');
      expect(precioMax).toHaveAttribute('min', '0');
      expect(stockMin).toHaveAttribute('min', '0');
    });

    it('debería tener tipos correctos en los inputs', () => {
      renderComponent();

      expect(screen.getByPlaceholderText('Ej: PROD001')).toHaveAttribute('type', 'text');
      expect(screen.getByPlaceholderText('Ej: Laptop Gamer')).toHaveAttribute('type', 'text');
      expect(screen.getByPlaceholderText('Ej: 10000')).toHaveAttribute('type', 'number');
      expect(screen.getByPlaceholderText('Ej: 500000')).toHaveAttribute('type', 'number');
      expect(screen.getByPlaceholderText('Ej: 5')).toHaveAttribute('type', 'number');
    });
  });

  describe('Manejo de Props', () => {
    it('debería manejar array vacío de categorías', () => {
      renderComponent({ categorias: [] });

      // Debería renderizar sin errores
      expect(screen.getByText('Filtros de Búsqueda')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Todas las categorías')).toBeInTheDocument();
    });

    it('debería actualizar el contador cuando cambian los resultados', () => {
      const nuevosResultados = { filtrados: 2, totales: 8 };
      renderComponent({ resultados: nuevosResultados });

      expect(screen.getByText('2 de 8 productos encontrados')).toBeInTheDocument();
    });

    it('debería manejar valores vacíos en los filtros', () => {
      const filtrosVacios = {
        codigo: '',
        nombre: '',
        categoria: '',
        estadoStock: '',
        precioMin: '',
        precioMax: '',
        stockMin: '',
        ordenarPor: 'nombre'
      };

      renderComponent({ filtros: filtrosVacios });

      // Para inputs de texto - verificar que el value esté vacío
      const inputCodigo = screen.getByPlaceholderText('Ej: PROD001');
      const inputNombre = screen.getByPlaceholderText('Ej: Laptop Gamer');
      const inputPrecioMin = screen.getByPlaceholderText('Ej: 10000');
      const inputPrecioMax = screen.getByPlaceholderText('Ej: 500000');
      const inputStockMin = screen.getByPlaceholderText('Ej: 5');

      expect(inputCodigo).toHaveValue('');
      expect(inputNombre).toHaveValue('');
      expect(inputPrecioMin).toHaveValue(null); // Los number inputs retornan null cuando están vacíos
      expect(inputPrecioMax).toHaveValue(null);
      expect(inputStockMin).toHaveValue(null);
      
      // Para selects - verificar opciones por defecto
      expect(screen.getByDisplayValue('Todas las categorías')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Todos los estados')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Nombre (A-Z)')).toBeInTheDocument();
    });
  });

  describe('Accesibilidad', () => {
    it('debería tener labels asociados a los inputs', () => {
      renderComponent();

      // Verificar que todos los labels estén presentes
      // Usar getAllByText para labels que se repiten
      const labelsCodigo = screen.getAllByText('Código');
      expect(labelsCodigo.length).toBeGreaterThan(0);
      
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Categoría')).toBeInTheDocument();
      expect(screen.getByText('Estado de Stock')).toBeInTheDocument();
      expect(screen.getByText('Precio Mínimo')).toBeInTheDocument();
      expect(screen.getByText('Precio Máximo')).toBeInTheDocument();
      expect(screen.getByText('Stock Mínimo')).toBeInTheDocument();
      expect(screen.getByText('Ordenar por')).toBeInTheDocument();
    });

    it('debería tener placeholders descriptivos', () => {
      renderComponent();

      expect(screen.getByPlaceholderText('Ej: PROD001')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ej: Laptop Gamer')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ej: 10000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ej: 500000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ej: 5')).toBeInTheDocument();
    });

    
  });

  describe('Estructura del Componente', () => {
    it('debería aplicar los estilos CSS correctos', () => {
      renderComponent();

      // Verificar clases de Bootstrap
      const card = screen.getByText('Filtros de Búsqueda').closest('.card');
      expect(card).toHaveClass('shadow-sm', 'border-0', 'mb-4');

      // Verificar estilos inline
      expect(card).toHaveStyle('backgroundColor: #ffffff');
    });

    it('debería tener la estructura de grid correcta', () => {
      renderComponent();

      // Verificar que usa el sistema de grid de Bootstrap
      const rows = document.querySelectorAll('.row');
      expect(rows).toHaveLength(2); // Dos filas de filtros

      const columns = document.querySelectorAll('.col-md-3');
      expect(columns).toHaveLength(8); // 4 columnas por fila × 2 filas
    });
  });
});
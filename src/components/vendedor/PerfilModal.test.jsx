import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PerfilModal from './PerfilModal';

vi.mock('../../data/regiones_comunas.json', () => ({
  default: {
    regiones: [
      {
        id: 1,
        nombre: 'Metropolitana',
        comunas: ['Santiago', 'Providencia', 'Las Condes']
      },
      {
        id: 2,
        nombre: 'Valparaíso',
        comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué']
      }
    ]
  }
}));

describe('PerfilModal', () => {
  const mockUsuario = {
    run: '12345678-9',
    tipo: 'Cliente'
  };

  const mockFormData = {
    nombre: 'Juan',
    apellidos: 'Pérez',
    correo: 'juan@duoc.cl',
    telefono: '912345678',
    direccion: 'Calle Principal 123',
    region: '',
    comuna: '',
    fecha_nacimiento: '1990-01-01',
    password: '',
    confirmarPassword: ''
  };

  const mockOnClose = vi.fn();
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();

  const renderComponent = (props = {}) => {
    const defaultProps = {
      show: true,
      usuario: mockUsuario,
      formData: mockFormData,
      guardando: false,
      onClose: mockOnClose,
      onChange: mockOnChange,
      onSubmit: mockOnSubmit
    };

    return render(<PerfilModal {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debería renderizar cuando show es false', () => {
    renderComponent({ show: false });
    expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument();
  });

  it('debería renderizar el modal cuando show es true', () => {
    renderComponent();
    expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
  });

  it('debería mostrar información del usuario no editable', () => {
    renderComponent();
    expect(screen.getByText('12345678-9')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });

  it('debería mostrar campos editables con valores iniciales', () => {
    renderComponent();
    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('juan@duoc.cl')).toBeInTheDocument();
    expect(screen.getByDisplayValue('912345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Calle Principal 123')).toBeInTheDocument();
  });

  it('debería filtrar teléfono para solo números y máximo 9 dígitos', () => {
    renderComponent();
    const inputTelefono = screen.getByDisplayValue('912345678');
    fireEvent.change(inputTelefono, { target: { value: '9123abc456', name: 'telefono' } });
    expect(mockOnChange).toHaveBeenCalledWith({
      target: { name: 'telefono', value: '9123456' }
    });
  });

  it('debería actualizar comunas cuando se selecciona una región', async () => {
    renderComponent();
    const selectRegion = screen.getByDisplayValue('Seleccionar región...');
    fireEvent.change(selectRegion, { target: { value: 'Metropolitana' } });
    
    await waitFor(() => {
      expect(screen.getByText('Santiago')).toBeInTheDocument();
      expect(screen.getByText('Providencia')).toBeInTheDocument();
    });
  });


  it('debería mostrar/ocultar contraseña al hacer clic en el botón', () => {
    renderComponent({ 
      formData: { ...mockFormData, password: 'test123' } 
    });
    
    const passwordInput = screen.getByPlaceholderText('Dejar vacío para mantener la actual');
    const toggleButtons = screen.getAllByRole('button');
    const toggleButton = toggleButtons.find(button => 
      button.querySelector('i.bi-eye') || button.querySelector('i.bi-eye-slash')
    );
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('debería validar formulario correctamente al enviar', () => {
    renderComponent();
    const submitButton = screen.getByText('Guardar Cambios');
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  

  it('debería validar contraseñas coincidentes', () => {
    renderComponent({ 
      formData: { ...mockFormData, password: '123456', confirmarPassword: 'different' } 
    });
    
    const submitButton = screen.getByText('Guardar Cambios');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('debería validar fecha de nacimiento futura', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    renderComponent({ 
      formData: { ...mockFormData, fecha_nacimiento: futureDateString } 
    });
    
    const submitButton = screen.getByText('Guardar Cambios');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('La fecha de nacimiento no puede ser futura')).toBeInTheDocument();
  });

  it('debería validar edad mínima', () => {
    const recentDate = new Date();
    recentDate.setFullYear(recentDate.getFullYear() - 5);
    const recentDateString = recentDate.toISOString().split('T')[0];
    
    renderComponent({ 
      formData: { ...mockFormData, fecha_nacimiento: recentDateString } 
    });
    
    const submitButton = screen.getByText('Guardar Cambios');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Debe ser mayor de 10 años')).toBeInTheDocument();
  });

  it('debería llamar onClose al hacer clic en cancelar', () => {
    renderComponent();
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });


  it('debería validar región y comuna relacionadas', () => {
    renderComponent({ 
      formData: { ...mockFormData, comuna: 'Santiago', region: '' } 
    });
    
    const submitButton = screen.getByText('Guardar Cambios');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Debe seleccionar una región para la comuna elegida')).toBeInTheDocument();
  });

  it('debería manejar formulario con datos válidos', () => {
    renderComponent({
      formData: {
        ...mockFormData,
        nombre: 'Ana',
        apellidos: 'González',
        correo: 'ana@duoc.cl',
        direccion: 'Calle Valida 123',
        region: 'Metropolitana',
        comuna: 'Santiago'
      }
    });
    
    const submitButton = screen.getByText('Guardar Cambios');
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
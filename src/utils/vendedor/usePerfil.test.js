import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePerfil } from './usePerfil';

// Mocks de los servicios
vi.mock('../tienda/authService', () => ({
  authService: {
    getCurrentUser: vi.fn()
  }
}));

vi.mock('../admin/usuarioService', () => ({
  usuarioService: {
    getUsuarioByRun: vi.fn(),
    verificarEmailExistente: vi.fn(),
    updateUsuario: vi.fn(),
    hashPasswordSHA256: vi.fn()
  }
}));

import { authService } from '../tienda/authService';
import { usuarioService } from '../admin/usuarioService';

describe('usePerfil', () => {
  const mockUsuario = {
    run: '12345678-9',
    nombre: 'Juan',
    apellidos: 'Pérez García',
    correo: 'juan@example.com',
    telefono: '912345678',
    direccion: 'Calle Principal 123',
    comuna: 'Santiago',
    region: 'Metropolitana',
    fecha_nacimiento: '1990-01-01',
    tipo: 'Cliente',
    contrasenha: 'hashed_password_123'
  };

  const mockUsuarioActual = {
    id: '12345678-9',
    nombre: 'Juan',
    email: 'juan@example.com',
    type: 'Cliente',
    loginTime: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Inicialización', () => {
       it('debería cargar el perfil del usuario al inicializar', async () => {
      authService.getCurrentUser.mockReturnValue(mockUsuarioActual);
      usuarioService.getUsuarioByRun.mockResolvedValue(mockUsuario);

      const { result } = renderHook(() => usePerfil());

      // Verificar que empieza cargando
      expect(result.current.loading).toBe(true);

      // Esperar a que termine la carga
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(authService.getCurrentUser).toHaveBeenCalledOnce();
      expect(usuarioService.getUsuarioByRun).toHaveBeenCalledWith(mockUsuarioActual.id);
      expect(result.current.usuario).toEqual(mockUsuario);
      expect(result.current.formData).toEqual({
        nombre: 'Juan',
        apellidos: 'Pérez García',
        correo: 'juan@example.com',
        telefono: '912345678',
        direccion: 'Calle Principal 123',
        comuna: 'Santiago',
        region: 'Metropolitana',
        fecha_nacimiento: '1990-01-01',
        password: '',
        confirmarPassword: ''
      });
    });

    it('debería manejar error al cargar perfil', async () => {
      authService.getCurrentUser.mockReturnValue(mockUsuarioActual);
      usuarioService.getUsuarioByRun.mockRejectedValue(new Error('Error de base de datos'));

      const { result } = renderHook(() => usePerfil());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.mensaje).toEqual({
        tipo: 'error',
        texto: 'Error al cargar el perfil desde la base de datos'
      });
    });

    it('debería mostrar error si usuario no existe en BD', async () => {
      authService.getCurrentUser.mockReturnValue(mockUsuarioActual);
      usuarioService.getUsuarioByRun.mockResolvedValue(null);

      const { result } = renderHook(() => usePerfil());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.mensaje).toEqual({
        tipo: 'error',
        texto: 'Usuario no encontrado en la base de datos'
      });
    });
  });

  describe('handleChange', () => {
    it('debería actualizar formData correctamente', async () => {
      authService.getCurrentUser.mockReturnValue(mockUsuarioActual);
      usuarioService.getUsuarioByRun.mockResolvedValue(mockUsuario);

      const { result } = renderHook(() => usePerfil());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simular cambio en un campo
      act(() => {
        result.current.handleChange({
          target: {
            name: 'nombre',
            value: 'Carlos'
          }
        });
      });

      expect(result.current.formData.nombre).toBe('Carlos');
      expect(result.current.formData.apellidos).toBe('Pérez García'); // No cambió

      // Simular cambio en otro campo
      act(() => {
        result.current.handleChange({
          target: {
            name: 'telefono',
            value: '987654321'
          }
        });
      });

      expect(result.current.formData.telefono).toBe('987654321');
    });
  });

  describe('handleSubmit', () => {
    beforeEach(() => {
      authService.getCurrentUser.mockReturnValue(mockUsuarioActual);
      usuarioService.getUsuarioByRun.mockResolvedValue(mockUsuario);
      usuarioService.verificarEmailExistente.mockResolvedValue(false);
      usuarioService.updateUsuario.mockResolvedValue({ success: true });
      usuarioService.hashPasswordSHA256.mockResolvedValue('new_hashed_password');
    });

    it('debería actualizar perfil exitosamente sin cambiar email', async () => {
      const { result } = renderHook(() => usePerfil());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Cambiar algunos datos
      act(() => {
        result.current.handleChange({
          target: { name: 'nombre', value: 'Carlos' }
        });
        result.current.handleChange({
          target: { name: 'telefono', value: '987654321' }
        });
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn()
        });
      });

      expect(usuarioService.verificarEmailExistente).not.toHaveBeenCalled();
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith('12345678-9', {
        run: '12345678-9',
        nombre: 'Carlos',
        apellidos: 'Pérez García',
        correo: 'juan@example.com',
        telefono: 987654321,
        direccion: 'Calle Principal 123',
        comuna: 'Santiago',
        region: 'Metropolitana',
        fecha_nacimiento: '1990-01-01',
        tipo: 'Cliente',
        contrasenha: 'hashed_password_123'
      });

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth_user',
        expect.any(String)
      );

      expect(result.current.mensaje).toEqual({
        tipo: 'success',
        texto: 'Perfil actualizado correctamente'
      });

      expect(result.current.showModal).toBe(false);
      expect(result.current.formData.password).toBe('');
      expect(result.current.formData.confirmarPassword).toBe('');
    });

    it('debería actualizar perfil con nuevo email exitosamente', async () => {
      const { result } = renderHook(() => usePerfil());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Cambiar email
      act(() => {
        result.current.handleChange({
          target: { name: 'correo', value: 'nuevo@example.com' }
        });
      });

      usuarioService.verificarEmailExistente.mockResolvedValue(false);

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn()
        });
      });

      expect(usuarioService.verificarEmailExistente).toHaveBeenCalledWith('nuevo@example.com');
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith('12345678-9', {
        run: '12345678-9',
        nombre: 'Juan',
        apellidos: 'Pérez García',
        correo: 'nuevo@example.com',
        telefono: 912345678,
        direccion: 'Calle Principal 123',
        comuna: 'Santiago',
        region: 'Metropolitana',
        fecha_nacimiento: '1990-01-01',
        tipo: 'Cliente',
        contrasenha: 'hashed_password_123'
      });
    });

    it('debería actualizar perfil con nueva contraseña', async () => {
      const { result } = renderHook(() => usePerfil());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Cambiar contraseña
      act(() => {
        result.current.handleChange({
          target: { name: 'password', value: 'nuevaPassword123' }
        });
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn()
        });
      });

      expect(usuarioService.hashPasswordSHA256).toHaveBeenCalledWith('nuevaPassword123');
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith('12345678-9', {
        run: '12345678-9',
        nombre: 'Juan',
        apellidos: 'Pérez García',
        correo: 'juan@example.com',
        telefono: 912345678,
        direccion: 'Calle Principal 123',
        comuna: 'Santiago',
        region: 'Metropolitana',
        fecha_nacimiento: '1990-01-01',
        tipo: 'Cliente',
        contrasenha: 'new_hashed_password'
      });
    });

    it('debería mostrar error si el email ya existe', async () => {
      const { result } = renderHook(() => usePerfil());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Cambiar email
      act(() => {
        result.current.handleChange({
          target: { name: 'correo', value: 'existente@example.com' }
        });
      });

      usuarioService.verificarEmailExistente.mockResolvedValue(true);

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn()
        });
      });

      expect(result.current.mensaje).toEqual({
        tipo: 'error',
        texto: 'Ya existe un usuario con este email'
      });
      expect(usuarioService.updateUsuario).not.toHaveBeenCalled();
    });

    it('debería mostrar error si usuario no está autenticado', async () => {
      authService.getCurrentUser.mockReturnValue(null);

      const { result } = renderHook(() => usePerfil());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn()
        });
      });

      expect(result.current.mensaje).toEqual({
        tipo: 'error',
        texto: 'Usuario no autenticado'
      });
    });

    it('debería manejar error al actualizar perfil', async () => {
      const { result } = renderHook(() => usePerfil());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      usuarioService.updateUsuario.mockRejectedValue(new Error('Error de conexión'));

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn()
        });
      });

      expect(result.current.mensaje).toEqual({
        tipo: 'error',
        texto: 'Error de conexión'
      });
    });

  });


});
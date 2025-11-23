import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validarFormularioContacto,
  sanitizarDatosContacto,
  formatearTelefonoChileno,
  enviarFormularioContacto,
  guardarContactoLocal,
  validarContenidoMensaje
} from './contactoUtils';

describe('contactoUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
  });

  describe('validarFormularioContacto', () => {
    it('debería retornar objeto vacío para datos válidos', () => {
      const datosValidos = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '912345678',
        asunto: 'consulta',
        mensaje: 'Este es un mensaje de prueba con más de 10 caracteres'
      };

      const errores = validarFormularioContacto(datosValidos);

      expect(errores).toEqual({});
    });

    it('debería detectar nombre vacío', () => {
      const datos = {
        nombre: '',
        email: 'juan@example.com',
        asunto: 'consulta',
        mensaje: 'Mensaje válido'
      };

      const errores = validarFormularioContacto(datos);

      expect(errores.nombre).toBe('El nombre es obligatorio');
    });

    it('debería detectar email inválido', () => {
      const datos = {
        nombre: 'Juan Pérez',
        email: 'email-invalido',
        asunto: 'consulta',
        mensaje: 'Mensaje válido'
      };

      const errores = validarFormularioContacto(datos);

      expect(errores.email).toBe('El email no es válido');
    });

    it('debería detectar teléfono inválido', () => {
      const datos = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '123',
        asunto: 'consulta',
        mensaje: 'Mensaje válido'
      };

      const errores = validarFormularioContacto(datos);

      expect(errores.telefono).toBe('El teléfono debe tener 9 dígitos');
    });

    it('debería permitir teléfono vacío', () => {
      const datos = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '',
        asunto: 'consulta',
        mensaje: 'Mensaje válido'
      };

      const errores = validarFormularioContacto(datos);

      expect(errores.telefono).toBeUndefined();
    });

    it('debería detectar asunto vacío', () => {
      const datos = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        asunto: '',
        mensaje: 'Mensaje válido'
      };

      const errores = validarFormularioContacto(datos);

      expect(errores.asunto).toBe('Selecciona un asunto');
    });

    it('debería detectar mensaje muy corto', () => {
      const datos = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        asunto: 'consulta',
        mensaje: 'Corto'
      };

      const errores = validarFormularioContacto(datos);

      expect(errores.mensaje).toBe('El mensaje debe tener al menos 10 caracteres');
    });
  });

  describe('sanitizarDatosContacto', () => {
    it('debería trimear espacios', () => {
      const datosConEspacios = {
        nombre: '  Juan Pérez  ',
        email: '  juan@example.com  ',
        telefono: '  912345678  ',
        asunto: '  consulta  ',
        mensaje: '  Mensaje  '
      };

      const sanitizados = sanitizarDatosContacto(datosConEspacios);

      expect(sanitizados.nombre).toBe('Juan Pérez');
      expect(sanitizados.email).toBe('juan@example.com');
      expect(sanitizados.telefono).toBe('912345678');
      expect(sanitizados.asunto).toBe('consulta');
      expect(sanitizados.mensaje).toBe('Mensaje');
    });

    it('debería manejar teléfono vacío', () => {
      const datosSinTelefono = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '',
        asunto: 'consulta',
        mensaje: 'Mensaje'
      };

      const sanitizados = sanitizarDatosContacto(datosSinTelefono);

      expect(sanitizados.telefono).toBe('');
    });
  });

  describe('formatearTelefonoChileno', () => {
    it('debería formatear número chileno correctamente', () => {
      const telefono = '912345678';
      const formateado = formatearTelefonoChileno(telefono);

      expect(formateado).toBe('+56 9 1234 5678');
    });

    it('debería retornar string vacío para teléfono vacío', () => {
      const formateado = formatearTelefonoChileno('');

      expect(formateado).toBe('');
    });

    it('debería retornar string vacío para teléfono null/undefined', () => {
      expect(formatearTelefonoChileno(null)).toBe('');
      expect(formatearTelefonoChileno(undefined)).toBe('');
    });

  });

  describe('enviarFormularioContacto', () => {
    it('debería resolver correctamente', async () => {
      const datos = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        mensaje: 'Mensaje de prueba'
      };

      const consoleSpy = vi.spyOn(console, 'log');
      
      const resultado = await enviarFormularioContacto(datos);

      expect(resultado).toEqual({ ok: true });
      expect(consoleSpy).toHaveBeenCalledWith('📤 Enviando formulario...', datos);
      
      consoleSpy.mockRestore();
    });

    it('debería simular retardo', async () => {
      vi.useFakeTimers();
      
      const datos = { nombre: 'Test' };
      const promesa = enviarFormularioContacto(datos);

      vi.advanceTimersByTime(1500);
      
      const resultado = await promesa;
      expect(resultado).toEqual({ ok: true });
      
      vi.useRealTimers();
    });
  });

  describe('guardarContactoLocal', () => {
    it('debería guardar contacto en localStorage', () => {
      const mockContactos = [
        { nombre: 'Ana', email: 'ana@test.com', fecha: '2024-01-01' }
      ];
      
      global.localStorage.getItem.mockReturnValue(JSON.stringify(mockContactos));

      const nuevoContacto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        mensaje: 'Mensaje de prueba'
      };

      guardarContactoLocal(nuevoContacto);

      expect(global.localStorage.getItem).toHaveBeenCalledWith('contactos');
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'contactos',
        expect.stringContaining('Juan Pérez')
      );
    });


    it('debería agregar fecha automáticamente', () => {
      global.localStorage.getItem.mockReturnValue(null);

      const contacto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com'
      };

      guardarContactoLocal(contacto);

      const setItemCall = global.localStorage.setItem.mock.calls[0];
      const contactosGuardados = JSON.parse(setItemCall[1]);
      
      expect(contactosGuardados[0].fecha).toBeDefined();
      expect(new Date(contactosGuardados[0].fecha)).toBeInstanceOf(Date);
    });
  });

  describe('validarContenidoMensaje', () => {
    it('debería aprobar mensaje válido', () => {
      const mensaje = 'Hola, tengo una consulta sobre los productos';
      const resultado = validarContenidoMensaje(mensaje);

      expect(resultado.valido).toBe(true);
    });

    it('debería detectar palabras prohibidas', () => {
      const palabrasProhibidas = ['spam', 'publicidad', 'oferta', 'criptomonedas'];
      
      palabrasProhibidas.forEach(palabra => {
        const mensaje = `Este mensaje contiene ${palabra} no deseada`;
        const resultado = validarContenidoMensaje(mensaje);

        expect(resultado.valido).toBe(false);
      });
    });

    it('debería ser case insensitive', () => {
      const mensajes = [
        'SPAM no deseado',
        'Publicidad molesta',
        'Gran OFERTA',
        'CRIPTOMONEDAS'
      ];

      mensajes.forEach(mensaje => {
        const resultado = validarContenidoMensaje(mensaje);
        expect(resultado.valido).toBe(false);
      });
    });

    it('debería detectar palabras dentro de texto', () => {
      const mensaje = 'Hola, me interesa esta oferta especial que tienen';
      const resultado = validarContenidoMensaje(mensaje);

      expect(resultado.valido).toBe(false);
    });
  });

  describe('Integración entre funciones', () => {
    it('debería sanitizar y validar correctamente', () => {
      const datosCrudos = {
        nombre: '  <script>Juan</script>  ',
        email: 'juan@example.com',
        telefono: '912345678',
        asunto: 'consulta',
        mensaje: 'Mensaje válido con más de 10 caracteres'
      };

      const sanitizados = sanitizarDatosContacto(datosCrudos);
      const errores = validarFormularioContacto(sanitizados);

      expect(sanitizados.nombre).toBe('Juan');
      expect(errores).toEqual({});
    });

    it('debería detectar spam después de sanitizar', () => {
      const datosConSpam = {
        nombre: 'Juan',
        email: 'juan@example.com',
        telefono: '912345678',
        asunto: 'consulta',
        mensaje: '  <div>Gran oferta de criptomonedas</div>  '
      };

      const sanitizados = sanitizarDatosContacto(datosConSpam);
      const validacionSpam = validarContenidoMensaje(sanitizados.mensaje);

      expect(sanitizados.mensaje).toBe('Gran oferta de criptomonedas');
      expect(validacionSpam.valido).toBe(false);
    });
  });
});
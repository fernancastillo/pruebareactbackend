// src/utils/tienda/authService.js
import { saveLocalstorage, loadFromLocalstorage, deleteFromLocalstorage } from '../localstorageHelper';
import { dataService } from '../dataService'; // ✅ NUEVO IMPORT

const AUTH_KEY = 'auth_user';
const USER_TYPE_KEY = 'user_type';

export const authService = {
  login: async (email, password) => {
    try {
      console.log('🔐 LOGIN INICIADO - Email:', email);
      
      // ✅ BUSCAR EN LA BASE DE DATOS PRIMERO
      try {
        console.log('🔐 Buscando usuario en base de datos Oracle...');
        const usuarioDesdeBD = await dataService.getUsuarioByCorreo(email);
        
        if (usuarioDesdeBD && usuarioDesdeBD.contrasenha === password) {
          console.log('✅ USUARIO ENCONTRADO EN BD - Login exitoso');
          console.log('👤 Tipo de usuario BD:', usuarioDesdeBD.tipo);
          console.log('👤 Datos completos del usuario BD:', usuarioDesdeBD);
          
          // ✅ CORREGIDO: Normalizar el tipo de usuario
          const tipoUsuario = (() => {
            const tipo = (usuarioDesdeBD.tipo || '').toLowerCase();
            if (tipo === 'admin' || tipo === 'administrador') return 'Administrador';
            if (tipo === 'cliente') return 'Cliente';
            return usuarioDesdeBD.tipo;
          })();
          
          const userData = {
            id: usuarioDesdeBD.run,
            nombre: usuarioDesdeBD.nombre,
            apellido: usuarioDesdeBD.apellidos || '',
            email: usuarioDesdeBD.correo,
            type: tipoUsuario,
            loginTime: new Date().toISOString(),
            run: usuarioDesdeBD.run,
            direccion: usuarioDesdeBD.direccion,
            comuna: usuarioDesdeBD.comuna,
            region: usuarioDesdeBD.region
          };
          
          saveLocalstorage(AUTH_KEY, userData);
          saveLocalstorage(USER_TYPE_KEY, tipoUsuario);
          
          console.log('✅ Usuario guardado en sesión desde BD:', userData);
          
          const redirectTo = tipoUsuario === 'Administrador' ? '/admin/dashboard' : '/index';
          console.log('🔄 Redirigiendo a:', redirectTo);
          
          window.dispatchEvent(new Event('authStateChanged'));
          
          return {
            success: true,
            user: userData,
            redirectTo: redirectTo
          };
        }
      } catch (bdError) {
        console.warn('⚠️ Error buscando en BD, intentando con localStorage:', bdError);
      }
      
      // ✅ FALLBACK: BUSCAR EN LOCALSTORAGE (usuarios registrados)
      const USUARIOS_KEY = 'app_usuarios';
      const usuariosRegistrados = loadFromLocalstorage(USUARIOS_KEY) || [];
      console.log('🔐 Usuarios en localStorage:', usuariosRegistrados.length);
      
      const usuarioRegistrado = usuariosRegistrados.find(u => {
        const emailMatch = u.correo === email;
        const passwordMatch = u.contrasenha === password;
        console.log(`🔐 Verificando usuario: ${u.correo}, email match: ${emailMatch}, password match: ${passwordMatch}`);
        return emailMatch && passwordMatch;
      });
      
      console.log('🔐 Usuario encontrado en registro:', usuarioRegistrado ? 'Sí' : 'No');
      
      if (usuarioRegistrado) {
        console.log('✅ USUARIO ENCONTRADO EN REGISTRO - Login exitoso');
        
        const tipoUsuario = (() => {
          const tipo = (usuarioRegistrado.tipo || '').toLowerCase();
          if (tipo === 'admin' || tipo === 'administrador') return 'Administrador';
          if (tipo === 'cliente') return 'Cliente';
          return usuarioRegistrado.tipo;
        })();
        
        const userData = {
          id: usuarioRegistrado.run,
          nombre: usuarioRegistrado.nombre,
          apellido: usuarioRegistrado.apellidos || '',
          email: usuarioRegistrado.correo,
          type: tipoUsuario,
          loginTime: new Date().toISOString(),
          run: usuarioRegistrado.run,
          direccion: usuarioRegistrado.direccion,
          comuna: usuarioRegistrado.comuna,
          region: usuarioRegistrado.region
        };
        
        saveLocalstorage(AUTH_KEY, userData);
        saveLocalstorage(USER_TYPE_KEY, tipoUsuario);
        
        console.log('✅ Usuario guardado en sesión:', userData);
        
        const redirectTo = tipoUsuario === 'Administrador' ? '/admin/dashboard' : '/index';
        console.log('🔄 Redirigiendo a:', redirectTo);
        
        window.dispatchEvent(new Event('authStateChanged'));
        
        return {
          success: true,
          user: userData,
          redirectTo: redirectTo
        };
      }
      
      console.log('❌ USUARIO NO ENCONTRADO - Login fallido');
      return {
        success: false,
        error: 'Email o contraseña incorrectos'
      };
      
    } catch (error) {
      console.error('💥 Error en login:', error);
      return {
        success: false,
        error: 'Error del servidor, intenta más tarde'
      };
    }
  },

  logout: () => {
    deleteFromLocalstorage(AUTH_KEY);
    deleteFromLocalstorage(USER_TYPE_KEY);
    
    window.dispatchEvent(new Event('authStateChanged'));
    
    window.location.href = '/index';
  },

  isAuthenticated: () => {
    return loadFromLocalstorage(AUTH_KEY) !== null;
  },

  getCurrentUser: () => {
    return loadFromLocalstorage(AUTH_KEY);
  },

  getUserType: () => {
    return loadFromLocalstorage(USER_TYPE_KEY);
  },

  isAdmin: () => {
    const userType = loadFromLocalstorage(USER_TYPE_KEY);
    return (userType || '').toLowerCase() === 'admin' || (userType || '').toLowerCase() === 'administrador';
  },

  isClient: () => {
    const userType = loadFromLocalstorage(USER_TYPE_KEY);
    console.log('🔍 Verificando si es cliente - userType:', userType);
    return userType === 'Cliente';
  },

  emailExiste: async (email) => {
    try {
      // ✅ PRIMERO VERIFICAR EN BD
      const usuarioBD = await dataService.getUsuarioByCorreo(email);
      if (usuarioBD) return true;
    } catch (error) {
      console.warn('⚠️ Error verificando email en BD:', error);
    }
    
    // ✅ FALLBACK: VERIFICAR EN LOCALSTORAGE
    const USUARIOS_KEY = 'app_usuarios';
    const usuariosRegistrados = loadFromLocalstorage(USUARIOS_KEY) || [];
    return usuariosRegistrados.some(usuario => usuario.correo === email);
  },

  notifyAuthChange: () => {
    window.dispatchEvent(new Event('authStateChanged'));
  }
};
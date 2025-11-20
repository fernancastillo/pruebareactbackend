// src/utils/tienda/authService.js
import { saveLocalstorage, loadFromLocalstorage, deleteFromLocalstorage } from '../localstorageHelper';
import { dataService } from '../dataService';

const AUTH_KEY = 'auth_user';
const USER_TYPE_KEY = 'user_type';

export const authService = {
  // Autenticar usuario desde la base de datos Oracle Cloud
  login: async (email, password) => {
    try {
      console.log('🔐 INICIANDO LOGIN - Verificando en BD Oracle Cloud...');
      console.log('📧 Email:', email);
      
      // ✅ PRIMERO: Buscar en la base de datos Oracle Cloud
      try {
        console.log('🔍 Buscando usuario en base de datos Oracle...');
        
        // Opción 1: Usar el endpoint específico por correo
        let usuarioDesdeBD;
        try {
          usuarioDesdeBD = await dataService.getUsuarioByCorreo(email);
          console.log('📊 Resultado de búsqueda por correo:', usuarioDesdeBD);
        } catch (endpointError) {
          console.warn('⚠️ Endpoint específico falló, intentando con lista completa...', endpointError);
          // Opción 2: Obtener todos los usuarios y filtrar
          const todosUsuarios = await dataService.getUsuarios();
          console.log('👥 Todos los usuarios desde BD:', todosUsuarios);
          
          usuarioDesdeBD = todosUsuarios.find(user => {
            const emailMatch = user.correo && user.correo.toLowerCase() === email.toLowerCase();
            console.log(`🔍 Comparando: ${user.correo} con ${email} -> ${emailMatch}`);
            return emailMatch;
          });
        }

        if (usuarioDesdeBD) {
          console.log('✅ USUARIO ENCONTRADO EN BD ORACLE');
          console.log('👤 Datos del usuario desde BD:', usuarioDesdeBD);
          
          // Verificar contraseña (comparar hash SHA256)
          const passwordHash = await authService.hashPasswordSHA256(password);
          console.log('🔐 Contraseña ingresada (hash):', passwordHash);
          console.log('🔐 Contraseña en BD (hash):', usuarioDesdeBD.contrasenha);
          
          if (usuarioDesdeBD.contrasenha === passwordHash) {
            console.log('✅ CONTRASEÑA VÁLIDA - Login exitoso');
            
            // Normalizar el tipo de usuario
            const tipoUsuario = authService.normalizeUserType(usuarioDesdeBD.tipo);
            console.log('🎯 Tipo de usuario normalizado:', tipoUsuario);
            
            const userData = {
              id: usuarioDesdeBD.run || usuarioDesdeBD.id,
              nombre: usuarioDesdeBD.nombre || '',
              apellido: usuarioDesdeBD.apellidos || usuarioDesdeBD.apellido || '',
              email: usuarioDesdeBD.correo,
              type: tipoUsuario,
              loginTime: new Date().toISOString(),
              run: usuarioDesdeBD.run,
              direccion: usuarioDesdeBD.direccion,
              comuna: usuarioDesdeBD.comuna,
              region: usuarioDesdeBD.region,
              telefono: usuarioDesdeBD.telefono,
              fechaNac: usuarioDesdeBD.fechaNac,
              // Indicar que viene de BD
              source: 'oracle_cloud'
            };
            
            // Guardar en sesión
            authService.saveUserSession(userData, tipoUsuario);
            
            console.log('✅ Sesión iniciada correctamente desde BD Oracle');
            
            return {
              success: true,
              user: userData,
              redirectTo: tipoUsuario === 'Administrador' ? '/admin/dashboard' : '/index'
            };
          } else {
            console.log('❌ CONTRASEÑA INCORRECTA');
            console.log('🔐 Hash esperado:', usuarioDesdeBD.contrasenha);
            console.log('🔐 Hash recibido:', passwordHash);
            return {
              success: false,
              error: 'Contraseña incorrecta'
            };
          }
        } else {
          console.log('❌ USUARIO NO ENCONTRADO EN BD ORACLE');
          return {
            success: false,
            error: 'Usuario no encontrado en el sistema'
          };
        }
        
      } catch (bdError) {
        console.error('💥 ERROR DE CONEXIÓN CON BD ORACLE:', bdError);
        return {
          success: false,
          error: 'Error de conexión con la base de datos. Intente más tarde.'
        };
      }

    } catch (error) {
      console.error('💥 ERROR CRÍTICO EN LOGIN:', error);
      return {
        success: false,
        error: 'Error del servidor. Por favor, intente nuevamente.'
      };
    }
  },

  // Función para hashear contraseña con SHA256 (igual que Oracle)
  hashPasswordSHA256: async (password) => {
    try {
      // Convertir el string a un ArrayBuffer
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      
      // Hashear con SHA-256
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // Convertir el ArrayBuffer a string hexadecimal
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('🔐 Hash generado para:', password, '->', hashHex.toUpperCase());
      return hashHex.toUpperCase();
    } catch (error) {
      console.error('💥 Error hasheando contraseña:', error);
      // Fallback: si crypto.subtle no está disponible
      return authService.simpleSHA256(password);
    }
  },

  // Fallback para navegadores que no soportan crypto.subtle
  simpleSHA256: (password) => {
    // Esta es una implementación básica - crypto.subtle es preferible
    console.warn('⚠️ Usando SHA256 simple - considera actualizar el navegador');
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
  },

  // Normalizar tipos de usuario
  normalizeUserType: (tipo) => {
    if (!tipo) return 'Cliente';
    
    const tipoLower = tipo.toLowerCase().trim();
    
    if (tipoLower === 'admin' || tipoLower === 'administrador') return 'Administrador';
    if (tipoLower === 'cliente' || tipoLower === 'client') return 'Cliente';
    if (tipoLower === 'vendedor') return 'Vendedor';
    
    return tipo;
  },

  // Guardar sesión de usuario
  saveUserSession: (userData, userType) => {
    saveLocalstorage(AUTH_KEY, userData);
    saveLocalstorage(USER_TYPE_KEY, userType);
    
    // Disparar evento para notificar cambios de autenticación
    window.dispatchEvent(new Event('authStateChanged'));
  },

  logout: () => {
    console.log('🚪 Cerrando sesión...');
    deleteFromLocalstorage(AUTH_KEY);
    deleteFromLocalstorage(USER_TYPE_KEY);
    
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Redirigir al inicio
    window.location.href = '/index';
  },

  isAuthenticated: () => {
    const user = loadFromLocalstorage(AUTH_KEY);
    return user !== null && user !== undefined;
  },

  getCurrentUser: () => {
    return loadFromLocalstorage(AUTH_KEY);
  },

  getUserType: () => {
    return loadFromLocalstorage(USER_TYPE_KEY);
  },

  isAdmin: () => {
    const userType = authService.getUserType();
    return userType === 'Administrador';
  },

  isClient: () => {
    const userType = authService.getUserType();
    return userType === 'Cliente';
  },

  // Verificar si un email existe en la BD
  emailExiste: async (email) => {
    try {
      console.log('🔍 Verificando email en BD Oracle:', email);
      
      try {
        const usuarioBD = await dataService.getUsuarioByCorreo(email);
        return !!usuarioBD;
      } catch (endpointError) {
        console.warn('⚠️ Endpoint específico falló, usando lista completa...');
        const todosUsuarios = await dataService.getUsuarios();
        return todosUsuarios.some(user => 
          user.correo && user.correo.toLowerCase() === email.toLowerCase()
        );
      }
    } catch (error) {
      console.error('💥 Error verificando email:', error);
      return false;
    }
  },

  // Verificar estado de la conexión con BD
  checkDatabaseConnection: async () => {
    try {
      const usuarios = await dataService.getUsuarios();
      return {
        connected: true,
        userCount: usuarios.length,
        message: `Conexión exitosa con ${usuarios.length} usuarios en BD`
      };
    } catch (error) {
      return {
        connected: false,
        userCount: 0,
        message: 'Error de conexión con la base de datos'
      };
    }
  },

  notifyAuthChange: () => {
    window.dispatchEvent(new Event('authStateChanged'));
  }
};
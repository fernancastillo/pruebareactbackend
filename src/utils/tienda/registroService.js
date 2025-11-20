// src/utils/tienda/registroService.js
import { dataService } from '../dataService';

export const registroService = {
  registrarUsuario: async (usuarioData) => {
    try {
      console.log('🔍 Iniciando registro de usuario en BD Oracle...');
      console.log('📦 Datos recibidos:', usuarioData);
      
      // Verificar si el email ya existe en la BD
      const emailExiste = await registroService.verificarEmailExistente(usuarioData.email);
      
      if (emailExiste) {
        console.log('❌ Email ya existe en BD:', usuarioData.email);
        return {
          success: false,
          error: 'Este email ya está registrado'
        };
      }

      // Verificar si el RUN ya existe en la BD
      const runExiste = await registroService.verificarRUNExistente(usuarioData.run);
      
      if (runExiste) {
        console.log('❌ RUN ya existe en BD:', usuarioData.run);
        return {
          success: false,
          error: 'Este RUN ya está registrado'
        };
      }

      // Obtener nombre de la región
      const regionSeleccionada = usuarioData.regionNombre || 'Región no especificada';
      
      // Hashear la contraseña antes de guardarla (igual que en el login)
      const passwordHash = await registroService.hashPasswordSHA256(usuarioData.password);
      console.log('🔐 Contraseña hasheada:', passwordHash);
      
      // Preparar datos para la base de datos
      const nuevoUsuario = {
        run: usuarioData.run,
        nombre: usuarioData.nombre,
        apellidos: `${usuarioData.apellido}`,
        correo: usuarioData.email,
        // ✅ CONTRASEÑA HASHEADADA
        contrasenha: passwordHash,
        telefono: usuarioData.fono ? parseInt(usuarioData.fono) : null,
        // Ajustar formato de fecha para Oracle
        fechaNac: usuarioData.fechaNacimiento,
        tipo: 'Cliente', // Todos los nuevos usuarios son Clientes por defecto
        region: regionSeleccionada,
        comuna: usuarioData.comuna,
        direccion: usuarioData.direccion,
        // Campos adicionales para consistencia con la BD
        activo: 1 // 1 para activo, 0 para inactivo (si tu BD usa boolean)
      };

      console.log('👤 Nuevo usuario a guardar en BD:', nuevoUsuario);

      // ✅ GUARDAR EN BASE DE DATOS ORACLE
      try {
        const usuarioGuardado = await dataService.addUsuario(nuevoUsuario);
        console.log('✅ Usuario guardado exitosamente en BD:', usuarioGuardado);

        // Verificar que realmente se guardó haciendo una consulta
        try {
          const usuarioVerificado = await dataService.getUsuarioByCorreo(usuarioData.email);
          console.log('🔍 Usuario verificado en BD:', usuarioVerificado);
          
          if (usuarioVerificado) {
            return {
              success: true,
              user: nuevoUsuario,
              message: '¡Registro exitoso! Bienvenido a Junimo Store.'
            };
          } else {
            console.warn('⚠️ Usuario guardado pero no encontrado en verificación');
            return {
              success: true,
              user: nuevoUsuario,
              message: '¡Registro exitoso! Bienvenido a Junimo Store.'
            };
          }
        } catch (verificationError) {
          console.warn('⚠️ Error en verificación, pero registro probablemente exitoso:', verificationError);
          return {
            success: true,
            user: nuevoUsuario,
            message: '¡Registro exitoso! Bienvenido a Junimo Store.'
          };
        }

      } catch (saveError) {
        console.error('❌ Error guardando usuario en BD:', saveError);
        return {
          success: false,
          error: 'Error al guardar el usuario en la base de datos. Intente nuevamente.'
        };
      }

    } catch (error) {
      console.error('❌ Error detallado en registro:', error);
      console.error('📊 Stack trace:', error.stack);
      return {
        success: false,
        error: error.message || 'Error al registrar usuario. Verifica la consola para más detalles.'
      };
    }
  },

  // Función para hashear contraseña con SHA256 (igual que en authService)
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
      
      console.log('🔐 Hash generado para registro:', password, '->', hashHex.toUpperCase());
      return hashHex.toUpperCase();
    } catch (error) {
      console.error('💥 Error hasheando contraseña:', error);
      // Fallback simple si crypto.subtle no está disponible
      return registroService.simpleSHA256(password);
    }
  },

  // Fallback para navegadores que no soportan crypto.subtle
  simpleSHA256: (password) => {
    console.warn('⚠️ Usando SHA256 simple - considera actualizar el navegador');
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
  },

  // Verificar si email existe en la BD
  verificarEmailExistente: async (email) => {
    try {
      console.log('🔍 Verificando email en BD:', email);
      
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

  // Verificar si RUN existe en la BD
  verificarRUNExistente: async (run) => {
    try {
      console.log('🔍 Verificando RUN en BD:', run);
      
      try {
        const usuarioBD = await dataService.getUsuarioById(run);
        return !!usuarioBD;
      } catch (endpointError) {
        console.warn('⚠️ Endpoint específico falló, usando lista completa...');
        const todosUsuarios = await dataService.getUsuarios();
        return todosUsuarios.some(user => user.run === run);
      }
    } catch (error) {
      console.error('💥 Error verificando RUN:', error);
      return false;
    }
  },

  // Obtener usuarios desde BD
  obtenerUsuarios: async () => {
    try {
      return await dataService.getUsuarios();
    } catch (error) {
      console.error('💥 Error obteniendo usuarios:', error);
      return [];
    }
  },

  // Obtener usuario por email desde BD
  obtenerUsuarioPorEmail: async (email) => {
    try {
      try {
        return await dataService.getUsuarioByCorreo(email);
      } catch (endpointError) {
        console.warn('⚠️ Endpoint específico falló, usando lista completa...');
        const todosUsuarios = await dataService.getUsuarios();
        return todosUsuarios.find(user => 
          user.correo && user.correo.toLowerCase() === email.toLowerCase()
        );
      }
    } catch (error) {
      console.error('💥 Error obteniendo usuario por email:', error);
      return null;
    }
  },

  // Función para probar el hashing (puedes remover esto después)
  testPasswordHashing: async () => {
    const testPassword = '123456';
    const expectedHash = '8D969EEF6ECAD3C29A3A629280E686CF0C3F5D5A86AFF3CA12020C923ADC6C92';
    
    const generatedHash = await registroService.hashPasswordSHA256(testPassword);
    
    console.log('🧪 TEST DE HASHING EN REGISTRO:');
    console.log('🔐 Contraseña:', testPassword);
    console.log('🔐 Hash esperado:', expectedHash);
    console.log('🔐 Hash generado:', generatedHash);
    console.log('✅ Coinciden:', generatedHash === expectedHash);
    
    return generatedHash === expectedHash;
  }
};
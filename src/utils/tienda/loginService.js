import { authService } from './authService';

export const useLoginLogic = () => {
  const handleLogin = async (email, password) => {
    try {
      // Verificar conexión con BD primero
      const dbStatus = await authService.checkDatabaseConnection();
      if (!dbStatus.connected) {
        return {
          success: false,
          error: 'Error de conexión con el servidor. Intente más tarde.'
        };
      }

      const result = await authService.login(email, password);

      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado al iniciar sesión. Por favor, intente nuevamente.'
      };
    }
  };

  const getRedirectPath = (userType) => {
    return authService.getRedirectPath(userType);
  };

  const checkExistingAuth = (navigate) => {
    if (authService.isAuthenticated()) {
      const userType = authService.getUserType();
      const redirectTo = getRedirectPath(userType);

      navigate(redirectTo, { replace: true });
      return true;
    }
    return false;
  };

  return {
    handleLogin,
    getRedirectPath,
    checkExistingAuth
  };
};

export const loginValidations = {
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    return password && password.length >= 6;
  },

  validateForm: (email, password) => {
    const errors = [];

    if (!email) {
      errors.push('El email es requerido');
    } else if (!loginValidations.validateEmail(email)) {
      errors.push('El formato del email no es válido');
    }

    if (!password) {
      errors.push('La contraseña es requerida');
    } else if (!loginValidations.validatePassword(password)) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    return errors;
  }
};
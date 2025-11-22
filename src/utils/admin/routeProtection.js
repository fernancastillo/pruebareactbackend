import { authService } from '../tienda/authService';

/**
 * Verifica si el usuario puede acceder al admin
 * @returns {boolean} true si puede acceder, false si no
 */
export const canAccessAdmin = () => {
  if (!authService.isAuthenticated()) {
    return false;
  }

  const currentUser = authService.getCurrentUser();

  // Verificar múltiples tipos de admin
  const userType = currentUser?.tipo || currentUser?.type || '';
  const isAdmin = userType === 'Admin' ||
    userType === 'Administrador' ||
    userType === 'admin' ||
    userType === 'administrador';

  return isAdmin;
};

/**
 * Redirige según el tipo de usuario
 * @returns {string} ruta a la que debe redirigir
 */
export const getRedirectRoute = () => {
  if (!authService.isAuthenticated()) {
    return '/login';
  }

  const currentUser = authService.getCurrentUser();
  const userType = currentUser?.tipo || currentUser?.type || '';
  const isAdmin = userType === 'Admin' ||
    userType === 'Administrador' ||
    userType === 'admin' ||
    userType === 'administrador';

  if (!isAdmin) {
    return '/index';
  }

  return null; // No redirigir, puede acceder
};

/**
 * Hook para protección de rutas (opcional - para usar en componentes)
 */
export const useAdminAccess = () => {
  const canAccess = canAccessAdmin();
  const redirectTo = getRedirectRoute();

  return {
    canAccess,
    redirectTo,
    isAuthenticated: authService.isAuthenticated(),
    isAdmin: canAccess
  };
};
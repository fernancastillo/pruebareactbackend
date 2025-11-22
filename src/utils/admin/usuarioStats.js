export const calcularEstadisticasUsuarios = (usuarios, ordenes = []) => {
  const totalUsuarios = usuarios.length;
  const totalClientes = usuarios.filter(u => u.tipo === 'Cliente').length;
  const totalVendedores = usuarios.filter(u => u.tipo === 'Vendedor').length;
  const totalAdmins = usuarios.filter(u => u.tipo === 'Admin').length;
  const usuariosConCompras = usuarios.filter(u => u.totalCompras > 0).length;

  let totalIngresos = 0;
  try {
    const storedOrdenes = localStorage.getItem('app_ordenes');
    if (storedOrdenes) {
      const todasLasOrdenes = JSON.parse(storedOrdenes);
      totalIngresos = todasLasOrdenes
        .filter(orden => orden.estadoEnvio === 'Entregado' || orden.estado === 'Entregado')
        .reduce((sum, orden) => sum + orden.total, 0);
    } else {
      totalIngresos = usuarios.reduce((sum, usuario) => sum + usuario.totalGastado, 0);
    }
  } catch (error) {
    totalIngresos = usuarios.reduce((sum, usuario) => sum + usuario.totalGastado, 0);
  }

  const clientes = usuarios.filter(u => u.tipo === 'Cliente');
  const usuarioTop = clientes.reduce((max, usuario) =>
    usuario.totalGastado > max.totalGastado ? usuario : max,
    { totalGastado: -1, nombre: 'Ninguno' }
  );

  return {
    totalUsuarios,
    totalClientes,
    totalVendedores,
    totalAdmins,
    usuariosConCompras,
    totalIngresos,
    usuarioTop: usuarioTop.totalGastado > 0 ? usuarioTop : null
  };
};

export const aplicarFiltrosUsuarios = (usuarios, filtros) => {
  let filtered = [...usuarios];

  if (!Array.isArray(usuarios)) {
    return [];
  }

  if (filtros.run && filtros.run.trim() !== '') {
    const runBuscado = filtros.run.trim();
    filtered = filtered.filter(usuario => {
      const runUsuario = usuario?.run?.toString() || '';
      return runUsuario.includes(runBuscado);
    });
  }

  if (filtros.nombre && filtros.nombre.trim() !== '') {
    const nombreBuscado = filtros.nombre.trim().toLowerCase();
    filtered = filtered.filter(usuario => {
      const nombreUsuario = usuario?.nombre?.toLowerCase() || '';
      const apellidosUsuario = usuario?.apellidos?.toLowerCase() || '';
      return nombreUsuario.includes(nombreBuscado) ||
        apellidosUsuario.includes(nombreBuscado);
    });
  }

  if (filtros.email && filtros.email.trim() !== '') {
    const emailBuscado = filtros.email.trim().toLowerCase();
    filtered = filtered.filter(usuario => {
      const emailUsuario = usuario?.correo?.toLowerCase() || '';
      return emailUsuario.includes(emailBuscado);
    });
  }

  if (filtros.tipo && filtros.tipo.trim() !== '') {
    filtered = filtered.filter(usuario =>
      usuario?.tipo === filtros.tipo
    );
  }

  return filtered;
};
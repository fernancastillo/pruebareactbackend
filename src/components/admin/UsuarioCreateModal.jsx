import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import regionesComunasData from '../../data/regiones_comunas.json';

const UsuarioCreateModal = ({ show, usuario, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    run: '',
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
    comuna: '',
    region: '',
    tipo: 'Cliente',
    fecha_nacimiento: '',
    password: '',
    confirmarPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [comunasFiltradas, setComunasFiltradas] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (usuario) {
      // Modo edición
      setFormData({
        run: usuario.run || '',
        nombre: usuario.nombre || '',
        apellidos: usuario.apellidos || '',
        correo: usuario.correo || usuario.email || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        comuna: usuario.comuna || '',
        region: usuario.region || '',
        tipo: usuario.tipo || 'Cliente',
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        password: '', // No mostrar contraseña en edición por seguridad
        confirmarPassword: ''
      });

      // Si hay región seleccionada, cargar sus comunas
      if (usuario.region) {
        const regionEncontrada = regionesComunasData.regiones.find(
          r => r.nombre === usuario.region
        );
        if (regionEncontrada) {
          setComunasFiltradas(regionEncontrada.comunas);
        }
      }
    } else {
      // Modo creación - resetear formulario
      setFormData({
        run: '',
        nombre: '',
        apellidos: '',
        correo: '',
        telefono: '',
        direccion: '',
        comuna: '',
        region: '',
        tipo: 'Cliente',
        fecha_nacimiento: '',
        password: '',
        confirmarPassword: ''
      });
      setComunasFiltradas([]);
      setErrors({});
      setSubmitError('');
    }
  }, [usuario, show]);

  // Función para validar RUN con algoritmo módulo 11
  const validarRUN = (run) => {
    if (!run.trim()) return 'El RUN es requerido';

    // Solo números, sin puntos ni dígito verificador
    if (!/^\d+$/.test(run)) {
      return 'El RUN debe contener solo números (sin puntos ni guión)';
    }

    // ✅ Entre 8 y 9 caracteres (sin dígito verificador)
    if (run.length < 8 || run.length > 9) {
      return 'El RUN debe tener entre 8 y 9 dígitos';
    }

    return '';
  };

  // Función para validar email con dominios específicos
  const validarEmail = (email) => {
    if (!email.trim()) return 'El email es requerido';

    const dominiosPermitidos = ['gmail.com', 'duoc.cl', 'profesor.duoc.cl'];
    const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@(${dominiosPermitidos.join('|')})$`);

    if (!regex.test(email)) {
      return `El email debe ser de uno de estos dominios: ${dominiosPermitidos.join(', ')}`;
    }

    return '';
  };

  // Función para validar teléfono (opcional)
  const validarTelefono = (telefono) => {
    if (!telefono || telefono.trim() === '') return ''; // Teléfono es opcional

    // Remover todos los caracteres que no sean números
    const soloNumeros = telefono.replace(/\D/g, '');

    // Validar que tenga exactamente 9 dígitos y empiece con 9
    if (soloNumeros.length !== 9) {
      return 'El teléfono debe tener 9 dígitos';
    }

    if (!soloNumeros.startsWith('9')) {
      return 'El teléfono debe empezar con 9';
    }

    return '';
  };

  // Función para validar nombre y apellidos
  const validarNombre = (nombre) => {
    if (!nombre.trim()) return 'El nombre es requerido';
    if (nombre.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
    return '';
  };

  const validarApellidos = (apellidos) => {
    if (!apellidos.trim()) return 'Los apellidos son requeridos';
    if (apellidos.trim().length < 3) return 'Los apellidos deben tener al menos 3 caracteres';
    return '';
  };

  // Función para validar dirección (OBLIGATORIA)
  const validarDireccion = (direccion) => {
    if (!direccion.trim()) return 'La dirección es obligatoria';

    if (direccion.trim().length < 5) {
      return 'La dirección debe tener al menos 5 caracteres';
    }

    if (direccion.trim().length > 100) {
      return 'La dirección no puede tener más de 100 caracteres';
    }

    return '';
  };

  // Función para validar contraseña (6-10 caracteres)
  const validarPassword = (password) => {
    if (!password.trim()) return 'La contraseña es requerida';
    if (password.length < 6 || password.length > 10) {
      return 'La contraseña debe tener entre 6 y 10 caracteres';
    }
    return '';
  };

  // Función para validar confirmación de contraseña
  const validarConfirmarPassword = (password, confirmarPassword) => {
    if (!confirmarPassword.trim()) return 'Debes confirmar la contraseña';
    if (password !== confirmarPassword) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  };

  // Función para calcular edad exacta
  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    // Ajustar si aún no ha pasado el mes de cumpleaños este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  };

  // FUNCIÓN VALIDATEFORM
  const validateForm = () => {
    const newErrors = {};

    // Validar RUN
    const errorRUN = validarRUN(formData.run);
    if (errorRUN) newErrors.run = errorRUN;

    // Validar nombre
    const errorNombre = validarNombre(formData.nombre);
    if (errorNombre) newErrors.nombre = errorNombre;

    // Validar apellidos
    const errorApellidos = validarApellidos(formData.apellidos);
    if (errorApellidos) newErrors.apellidos = errorApellidos;

    // Validar email
    const errorEmail = validarEmail(formData.correo);
    if (errorEmail) newErrors.correo = errorEmail;

    // Validar teléfono (solo si se ingresó)
    if (formData.telefono && formData.telefono.trim() !== '') {
      const errorTelefono = validarTelefono(formData.telefono);
      if (errorTelefono) newErrors.telefono = errorTelefono;
    }

    // ✅ Validar dirección (OBLIGATORIA)
    const errorDireccion = validarDireccion(formData.direccion);
    if (errorDireccion) newErrors.direccion = errorDireccion;

    // Validar región y comuna (si se selecciona una, debe seleccionar la otra)
    if (formData.region && !formData.comuna) {
      newErrors.comuna = 'Debe seleccionar una comuna para la región elegida';
    }
    if (formData.comuna && !formData.region) {
      newErrors.region = 'Debe seleccionar una región para la comuna elegida';
    }

    // Validar fecha de nacimiento
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const edad = calcularEdad(formData.fecha_nacimiento);

      if (edad < 10) {
        newErrors.fecha_nacimiento = 'El usuario debe ser mayor de 10 años';
      }

      // Validar que no sea una fecha futura
      const fechaNac = new Date(formData.fecha_nacimiento);
      const hoy = new Date();
      if (fechaNac > hoy) {
        newErrors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura';
      }
    }

    // Validar contraseña (solo en creación, no en edición)
    if (!usuario) {
      const errorPassword = validarPassword(formData.password);
      if (errorPassword) newErrors.password = errorPassword;

      const errorConfirmarPassword = validarConfirmarPassword(formData.password, formData.confirmarPassword);
      if (errorConfirmarPassword) newErrors.confirmarPassword = errorConfirmarPassword;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para formatear RUN mientras se escribe (solo números)
  const handleRunChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    setFormData(prev => ({
      ...prev,
      run: value
    }));

    if (errors.run) {
      setErrors(prev => ({
        ...prev,
        run: ''
      }));
    }
  };

  // Función para manejar cambio de región
  const handleRegionChange = (e) => {
    const regionSeleccionada = e.target.value;

    setFormData(prev => ({
      ...prev,
      region: regionSeleccionada,
      comuna: '' // Resetear comuna cuando cambia la región
    }));

    // Filtrar comunas según la región seleccionada
    if (regionSeleccionada) {
      const regionEncontrada = regionesComunasData.regiones.find(
        r => r.nombre === regionSeleccionada
      );
      if (regionEncontrada) {
        setComunasFiltradas(regionEncontrada.comunas);
      } else {
        setComunasFiltradas([]);
      }
    } else {
      setComunasFiltradas([]);
    }

    // Limpiar errores
    if (errors.region) {
      setErrors(prev => ({
        ...prev,
        region: ''
      }));
    }
  };

  // Función para manejar cambio de comuna
  const handleComunaChange = (e) => {
    const comunaSeleccionada = e.target.value;

    setFormData(prev => ({
      ...prev,
      comuna: comunaSeleccionada
    }));

    // Limpiar errores
    if (errors.comuna) {
      setErrors(prev => ({
        ...prev,
        comuna: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Limpiar error general al cambiar cualquier campo
    if (submitError) {
      setSubmitError('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('📝 Iniciando validación del formulario...');

    if (validateForm()) {
      console.log('✅ Formulario válido, procediendo con guardado...');
      console.log('📦 Datos del formulario:', {
        ...formData,
        password: '***', // No mostrar contraseña en logs
        confirmarPassword: '***'
      });

      try {
        setLoading(true);
        setSubmitError('');

        // ✅ CORREGIDO: Enviar la contraseña del campo password
        const usuarioData = {
          run: parseInt(formData.run), // ✅ Asegurar que sea número
          nombre: formData.nombre.trim(),
          apellidos: formData.apellidos.trim(),
          correo: formData.correo.trim(),
          telefono: formData.telefono ? parseInt(formData.telefono) : null,
          direccion: formData.direccion.trim(),
          comuna: formData.comuna || '',
          region: formData.region || '',
          tipo: formData.tipo,
          fecha_nacimiento: formData.fecha_nacimiento,
          contrasenha: formData.password // ✅ ENVIAR LA CONTRASEÑA DEL CAMPO PASSWORD
        };

        console.log('Enviando datos de usuario (contraseña del campo password):', {
          ...usuarioData,
          contrasenha: '***' // No mostrar contraseña en logs
        });

        await onSave(usuarioData);

      } catch (error) {
        console.error('💥 Error guardando usuario:', error);
        setSubmitError(error.message || 'Error al guardar el usuario');
      } finally {
        setLoading(false);
      }
    } else {
      console.log('❌ Formulario inválido, errores:', errors);
    }
  };

  if (!show) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header
        closeButton
        className="border-3 border-dark"
        style={{
          backgroundColor: '#87CEEB',
        }}
      >
        <Modal.Title className="fw-bold text-center w-100" style={{ color: '#000000' }}>
          <span style={{ fontFamily: "'Indie Flower', cursive", fontSize: '1.8rem' }}>
            <i className="bi bi-person-plus me-2"></i>
            {usuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          backgroundColor: '#87CEEB',
        }}
      >
        {submitError && (
          <Alert
            variant="danger"
            className="mb-3 border-3 border-dark rounded-3"
            style={{
              backgroundColor: '#FFB6C1',
              color: '#000000',
              fontWeight: '600'
            }}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {submitError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: '#000000' }}>
                  RUN *
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`form-control border-3 border-dark rounded-3 ${errors.run ? 'is-invalid' : ''}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    fontFamily: "'Lato', sans-serif"
                  }}
                  name="run"
                  value={formData.run}
                  onChange={handleRunChange}
                  placeholder="Ej: 123456789"
                  disabled={!!usuario} // No permitir modificar RUN en edición
                  maxLength={9}
                />
                {errors.run && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.run}</div>}
                <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Solo números, sin puntos ni dígito verificador (8-9 dígitos)
                </Form.Text>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: '#000000' }}>
                  Tipo de Usuario *
                </Form.Label>
                <Form.Select
                  className={`form-select border-3 border-dark rounded-3 ${errors.tipo ? 'is-invalid' : ''}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    fontFamily: "'Lato', sans-serif"
                  }}
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  <option value="Cliente">Cliente</option>
                  <option value="Vendedor">Vendedor</option>
                  <option value="Admin">Administrador</option>
                </Form.Select>
                {errors.tipo && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.tipo}</div>}
                <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Selecciona el rol del usuario en el sistema
                </Form.Text>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: '#000000' }}>
                  Nombre *
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`form-control border-3 border-dark rounded-3 ${errors.nombre ? 'is-invalid' : ''}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    fontFamily: "'Lato', sans-serif"
                  }}
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Ana María"
                  minLength={3}
                  required
                />
                {errors.nombre && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.nombre}</div>}
                <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Mínimo 3 caracteres
                </Form.Text>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: '#000000' }}>
                  Apellidos *
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`form-control border-3 border-dark rounded-3 ${errors.apellidos ? 'is-invalid' : ''}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    fontFamily: "'Lato', sans-serif"
                  }}
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: González Pérez"
                  minLength={3}
                  required
                />
                {errors.apellidos && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.apellidos}</div>}
                <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Mínimo 3 caracteres
                </Form.Text>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold" style={{ color: '#000000' }}>
              Email *
            </Form.Label>
            <Form.Control
              type="email"
              className={`form-control border-3 border-dark rounded-3 ${errors.correo ? 'is-invalid' : ''}`}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontFamily: "'Lato', sans-serif"
              }}
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="Ej: usuario@gmail.com"
              required
            />
            {errors.correo && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.correo}</div>}
            <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
              Dominios permitidos: gmail.com, duoc.cl, profesor.duoc.cl
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold" style={{ color: '#000000' }}>
              Teléfono
            </Form.Label>
            <Form.Control
              type="text"
              className={`form-control border-3 border-dark rounded-3 ${errors.telefono ? 'is-invalid' : ''}`}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontFamily: "'Lato', sans-serif"
              }}
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 912345678"
            />
            {errors.telefono && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.telefono}</div>}
            <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
              Opcional. Si se ingresa, debe empezar con 9 y tener exactamente 9 dígitos
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold" style={{ color: '#000000' }}>
              Fecha de Nacimiento *
            </Form.Label>
            <Form.Control
              type="date"
              className={`form-control border-3 border-dark rounded-3 ${errors.fecha_nacimiento ? 'is-invalid' : ''}`}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontFamily: "'Lato', sans-serif"
              }}
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required
            />
            {errors.fecha_nacimiento && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.fecha_nacimiento}</div>}
            <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
              El usuario debe ser mayor de 10 años
            </Form.Text>
          </Form.Group>

          {/* DIRECCIÓN OBLIGATORIA */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold" style={{ color: '#000000' }}>
              Dirección *
            </Form.Label>
            <Form.Control
              type="text"
              className={`form-control border-3 border-dark rounded-3 ${errors.direccion ? 'is-invalid' : ''}`}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontFamily: "'Lato', sans-serif"
              }}
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Av. Principal 123"
              minLength={5}
              maxLength={100}
              required
            />
            {errors.direccion && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.direccion}</div>}
            <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
              Entre 5 y 100 caracteres
            </Form.Text>
          </Form.Group>

          <div className="row">
            {/* REGIÓN PRIMERO */}
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: '#000000' }}>
                  Región
                </Form.Label>
                <Form.Select
                  className={`form-select border-3 border-dark rounded-3 ${errors.region ? 'is-invalid' : ''}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    fontFamily: "'Lato', sans-serif"
                  }}
                  name="region"
                  value={formData.region}
                  onChange={handleRegionChange}
                >
                  <option value="">Seleccionar región...</option>
                  {regionesComunasData.regiones.map(region => (
                    <option key={region.id} value={region.nombre}>
                      {region.nombre}
                    </option>
                  ))}
                </Form.Select>
                {errors.region && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.region}</div>}
              </Form.Group>
            </div>

            {/* COMUNA DESPUÉS */}
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: '#000000' }}>
                  Comuna
                </Form.Label>
                <Form.Select
                  className={`form-select border-3 border-dark rounded-3 ${errors.comuna ? 'is-invalid' : ''}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    fontFamily: "'Lato', sans-serif"
                  }}
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleComunaChange}
                  disabled={!formData.region}
                >
                  <option value="">Seleccionar comuna...</option>
                  {comunasFiltradas.map(comuna => (
                    <option key={comuna} value={comuna}>
                      {comuna}
                    </option>
                  ))}
                </Form.Select>
                {errors.comuna && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.comuna}</div>}
                <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {!formData.region ? 'Primero selecciona una región' : `${comunasFiltradas.length} comunas disponibles`}
                </Form.Text>
              </Form.Group>
            </div>
          </div>

          {/* CAMPOS DE CONTRASEÑA - Solo en creación o si el usuario quiere cambiarla */}
          {!usuario && (
            <>
              <h6
                className="mb-3 fw-bold mt-4"
                style={{
                  color: '#000000',
                  fontFamily: "'Indie Flower', cursive",
                  fontSize: '1.3rem'
                }}
              >
                Seguridad
              </h6>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold" style={{ color: '#000000' }}>
                      Contraseña *
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        className={`form-control border-3 border-dark rounded-3 ${errors.password ? 'is-invalid' : ''}`}
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#000000',
                          fontFamily: "'Lato', sans-serif"
                        }}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Entre 6 y 10 caracteres"
                        minLength={6}
                        maxLength={10}
                        required
                      />
                      <Button
                        variant="outline-dark"
                        className="border-3 border-dark rounded-3"
                        style={{
                          backgroundColor: '#dedd8ff5',
                          color: '#000000'
                        }}
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </Button>
                    </InputGroup>
                    {errors.password && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.password}</div>}
                    <Form.Text className="text-muted" style={{ fontFamily: "'Lato', sans-serif" }}>
                      La contraseña debe tener entre 6 y 10 caracteres
                    </Form.Text>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold" style={{ color: '#000000' }}>
                      Confirmar Contraseña *
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control border-3 border-dark rounded-3 ${errors.confirmarPassword ? 'is-invalid' : ''}`}
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#000000',
                          fontFamily: "'Lato', sans-serif"
                        }}
                        name="confirmarPassword"
                        value={formData.confirmarPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        required
                      />
                      <Button
                        variant="outline-dark"
                        className="border-3 border-dark rounded-3"
                        style={{
                          backgroundColor: '#dedd8ff5',
                          color: '#000000'
                        }}
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </Button>
                    </InputGroup>
                    {errors.confirmarPassword && <div className="invalid-feedback" style={{ fontFamily: "'Lato', sans-serif" }}>{errors.confirmarPassword}</div>}
                  </Form.Group>
                </div>
              </div>
            </>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="rounded-pill px-4 py-2 border-3 border-dark fw-bold"
              style={{
                backgroundColor: '#dedd8ff5',
                color: '#000000',
                transition: 'all 0.3s ease',
                fontFamily: "'Lato', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(222, 221, 143, 0.6)';
                e.target.style.backgroundColor = '#FFD700';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#dedd8ff5';
              }}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="rounded-pill px-4 py-2 border-3 border-dark fw-bold"
              style={{
                backgroundColor: '#dedd8ff5',
                color: '#000000',
                transition: 'all 0.3s ease',
                fontFamily: "'Lato', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(222, 221, 143, 0.6)';
                e.target.style.backgroundColor = '#FFD700';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#dedd8ff5';
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  {usuario ? 'Actualizar Usuario' : 'Crear Usuario'}
                </>
              )}
            </Button>
          </div>

          {/* Mensaje de campos obligatorios */}
          <div className="text-center mt-3">
            <p
              style={{
                color: '#000000',
                fontFamily: "'Lato', sans-serif",
                fontWeight: '500',
                fontSize: '0.9rem'
              }}
            >
              <span style={{ color: 'red' }}>*</span> Campos obligatorios
            </p>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UsuarioCreateModal;
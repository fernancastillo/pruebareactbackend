import { useState, useEffect } from 'react';
import { authService } from '../tienda/authService';
import { usuarioService } from '../admin/usuarioService'; // ← Cambiar esta línea

export const usePerfil = () => {
    const [usuario, setUsuario] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            setLoading(true);
            const usuarioActual = authService.getCurrentUser();

            if (usuarioActual) {
                const usuarioCompleto = await usuarioService.getUsuarioByRun(usuarioActual.id);

                if (usuarioCompleto) {
                    setUsuario(usuarioCompleto);
                    setFormData({
                        nombre: usuarioCompleto.nombre || '',
                        apellidos: usuarioCompleto.apellidos || '',
                        correo: usuarioCompleto.correo || '',
                        telefono: usuarioCompleto.telefono || '',
                        direccion: usuarioCompleto.direccion || '',
                        comuna: usuarioCompleto.comuna || '',
                        region: usuarioCompleto.region || '',
                        fecha_nacimiento: usuarioCompleto.fecha_nacimiento || '',
                        password: '',
                        confirmarPassword: ''
                    });
                } else {
                    setMensaje({ tipo: 'error', texto: 'Usuario no encontrado en la base de datos' });
                }
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al cargar el perfil desde la base de datos' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setGuardando(true);
        try {
            const usuarioActual = authService.getCurrentUser();
            if (!usuarioActual || !usuario) {
                throw new Error('Usuario no autenticado');
            }

            if (formData.correo && formData.correo !== usuario.correo) {
                const emailExistente = await usuarioService.verificarEmailExistente(formData.correo);
                if (emailExistente) {
                    throw new Error('Ya existe un usuario con este email');
                }
            }

            const datosActualizados = {
                run: usuario.run,
                nombre: formData.nombre.trim(),
                apellidos: formData.apellidos.trim(),
                correo: formData.correo.trim(),
                telefono: formData.telefono ? parseInt(formData.telefono.replace(/\s/g, '')) : null,
                direccion: formData.direccion.trim(),
                comuna: formData.comuna || '',
                region: formData.region || '',
                fecha_nacimiento: formData.fecha_nacimiento || '',
                tipo: usuario.tipo, // No se puede cambiar el tipo
                contrasenha: formData.password && formData.password.trim()
                    ? await usuarioService.hashPasswordSHA256(formData.password)
                    : usuario.contrasenha
            };

            await usuarioService.updateUsuario(usuario.run, datosActualizados);

            const usuarioActualizado = await usuarioService.getUsuarioByRun(usuario.run);
            setUsuario(usuarioActualizado);

            const userData = {
                id: usuarioActualizado.run,
                nombre: usuarioActualizado.nombre,
                email: usuarioActualizado.correo,
                type: usuarioActualizado.tipo,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('auth_user', JSON.stringify(userData));

            setFormData(prev => ({
                ...prev,
                password: '',
                confirmarPassword: ''
            }));

            setShowModal(false);
            setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente' });

            setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);

        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al actualizar el perfil' });
        } finally {
            setGuardando(false);
        }
    };

    return {
        usuario,
        formData,
        loading,
        guardando,
        mensaje,
        showModal,
        handleChange,
        handleSubmit,
        setMensaje,
        cargarPerfil,
        setShowModal
    };
};
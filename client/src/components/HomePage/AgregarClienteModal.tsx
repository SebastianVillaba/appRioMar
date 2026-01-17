import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Select,
    TextField,
    Typography,
    IconButton,
    Divider,
    CircularProgress
} from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SaveIcon from '@mui/icons-material/Save';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from "../../services/api";

interface NuevoCliente {
    rucCedula: string;
    dv: string;
    nombre: string;
    apellido: string;
    direccion: string;
    referencia: string;
    fechaAniversario: string;
    grupo: number;
    celular: string;
    telefono: string;
    email: string;
    geolocalizacion: string;
}

interface AgregarClienteModalProps {
    open: boolean;
    onClose: () => void;
    onGuardar: (cliente: NuevoCliente) => void;
}

const AgregarClienteModal = ({ open, onClose, onGuardar }: AgregarClienteModalProps) => {
    const [formData, setFormData] = useState<NuevoCliente>({
        rucCedula: '',
        dv: '',
        nombre: '',
        apellido: '',
        direccion: '',
        referencia: '',
        fechaAniversario: '',
        grupo: 1,
        celular: '',
        telefono: '',
        email: '',
        geolocalizacion: ''
    });

    // Estados para geolocalización
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [latitude, setLatitude] = useState<string>('');
    const [longitude, setLongitude] = useState<string>('');

    const [grupoCliente, setGrupoCliente] = useState<{ idGrupoCliente: number, nombreGrupoCliente: string }[]>([]);

    const [errors, setErrors] = useState<Partial<Record<keyof NuevoCliente, string>>>({});

    useEffect(() => {
        const getGrupoCliente = async () => {
            const response = await api.get('/cliente/getGrupoCliente');
            setGrupoCliente(response.data);
        };
        getGrupoCliente();
    }, []);

    // Actualizar geolocalizacion cuando cambian las coordenadas
    useEffect(() => {
        if (latitude && longitude) {
            setFormData(prev => ({
                ...prev,
                geolocalizacion: `${latitude},${longitude}`
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                geolocalizacion: ''
            }));
        }
    }, [latitude, longitude]);

    const handleChange = (field: keyof NuevoCliente, value: string | number) => {
        // Convertir a mayúsculas si es string (excepto email)
        const processedValue = typeof value === 'string' && field !== 'email'
            ? value.toUpperCase()
            : value;

        setFormData(prev => ({
            ...prev,
            [field]: processedValue
        }));
        // Limpiar error al modificar el campo
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validarFormulario = (): boolean => {
        const nuevosErrores: Partial<Record<keyof NuevoCliente, string>> = {};

        if (!formData.rucCedula.trim()) {
            nuevosErrores.rucCedula = 'El RUC o Cédula es obligatorio! Revise...';
        }
        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre es obligatorio! Revise...';
        }
        if (!formData.apellido.trim()) {
            nuevosErrores.apellido = 'El apellido es obligatorio! Revise...';
        }
        if (!formData.direccion.trim()) {
            nuevosErrores.direccion = 'La dirección es obligatoria! Revise...';
        }
        if (!formData.referencia.trim()) {
            nuevosErrores.referencia = 'La referencias es obligatoria! Revise...';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nuevosErrores.email = 'El email es inválido! Revise...';
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleGuardar = () => {
        if (validarFormulario()) {
            onGuardar(formData);
            handleLimpiarYCerrar();
        }
    };

    const handleLimpiarYCerrar = () => {
        setFormData({
            rucCedula: '',
            dv: '',
            nombre: '',
            apellido: '',
            direccion: '',
            referencia: '',
            fechaAniversario: '',
            grupo: 1,
            celular: '',
            telefono: '',
            email: '',
            geolocalizacion: ''
        });
        setErrors({});
        setLatitude('');
        setLongitude('');
        onClose();
    };

    // Obtener ubicación actual del usuario
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('La geolocalización no está soportada en este navegador.');
            return;
        }

        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                setLatitude(lat.toFixed(6));
                setLongitude(lng.toFixed(6));
                setLoadingLocation(false);
            },
            (error) => {
                console.error('Error obteniendo ubicación:', error);
                let errorMessage = 'Error al obtener la ubicación.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permiso de ubicación denegado. Por favor, habilite el acceso a la ubicación.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Información de ubicación no disponible.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
                        break;
                }
                alert(errorMessage);
                setLoadingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Generar URL del mapa estático para preview
    const getMapPreviewUrl = () => {
        if (latitude && longitude) {
            return `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(longitude) - 0.005}%2C${parseFloat(latitude) - 0.005}%2C${parseFloat(longitude) + 0.005}%2C${parseFloat(latitude) + 0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`;
        }
        return null;
    };

    return (
        <Modal
            open={open}
            onClose={handleLimpiarYCerrar}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: { xs: 1, sm: 2 }
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '550px' },
                    maxHeight: { xs: '95vh', sm: '90vh' },
                    overflowY: 'auto',
                    borderRadius: { xs: 2, sm: 3 },
                    outline: 'none'
                }}
            >
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: { xs: 2, sm: 3 },
                    background: 'linear-gradient(135deg, #D4A017 0%, #F4C430 100%)',
                    borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0' }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonAddIcon sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                                color: 'white',
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                            }}
                        >
                            Nuevo Cliente
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleLimpiarYCerrar}
                        sx={{
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Contenido del formulario */}
                <Box sx={{
                    padding: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    {/* Sección: Identificación */}
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontSize: '0.75rem'
                        }}
                    >
                        Identificación
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 2
                        }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            label="RUC / Cédula *"
                            value={formData.rucCedula}
                            onChange={(e) => handleChange('rucCedula', e.target.value)}
                            error={!!errors.rucCedula}
                            helperText={errors.rucCedula}
                            autoComplete="off"
                            sx={{ flex: 3 }}
                        />
                        <TextField
                            size="small"
                            label="DV"
                            value={formData.dv}
                            onChange={(e) => handleChange('dv', e.target.value)}
                            error={!!errors.dv}
                            helperText={errors.dv}
                            autoComplete="off"
                            sx={{ flex: 1 }}
                        />
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Nombre y Apellido*"
                            value={formData.nombre}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                            error={!!errors.nombre}
                            helperText={errors.nombre}
                            autoComplete="off"
                        />
                        {/* <TextField
                            fullWidth
                            size="small"
                            label="Apellido *"
                            value={formData.apellido}
                            onChange={(e) => handleChange('apellido', e.target.value)}
                            error={!!errors.apellido}
                            helperText={errors.apellido}
                            autoComplete="off"
                        /> */}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Sección: Datos Adicionales */}
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontSize: '0.75rem'
                        }}
                    >
                        Datos Adicionales
                    </Typography>

                    <TextField
                        fullWidth
                        size="small"
                        label="Dirección"
                        value={formData.direccion}
                        onChange={(e) => handleChange('direccion', e.target.value)}
                        autoComplete="off"
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Referencia"
                        value={formData.referencia}
                        onChange={(e) => handleChange('referencia', e.target.value)}
                        autoComplete="off"
                    />

                    <Divider sx={{ my: 1 }} />

                    {/* Sección: Geolocalización */}
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontSize: '0.75rem'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: '1rem' }} />
                            Ubicación del Cliente
                        </Box>
                    </Typography>

                    {/* Botón de ubicación actual */}
                    <Button
                        variant="outlined"
                        startIcon={loadingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />}
                        onClick={handleGetCurrentLocation}
                        disabled={loadingLocation}
                        fullWidth
                        sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            py: 1.5,
                            '&:hover': {
                                borderColor: '#1565c0',
                                backgroundColor: 'rgba(25, 118, 210, 0.04)'
                            }
                        }}
                    >
                        {loadingLocation ? 'Obteniendo ubicación...' : 'Obtener Ubicación Actual'}
                    </Button>

                    {/* Campos de coordenadas */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Latitud"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="-25.263700"
                            autoComplete="off"
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Longitud"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="-57.575900"
                            autoComplete="off"
                        />
                    </Box>

                    {/* Preview del mapa */}
                    {latitude && longitude && (
                        <Box sx={{
                            width: '100%',
                            height: '150px',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid #e0e0e0'
                        }}>
                            <iframe
                                title="Ubicación del cliente"
                                src={getMapPreviewUrl() || ''}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                            />
                        </Box>
                    )}

                    {/* Mostrar coordenadas seleccionadas */}
                    {formData.geolocalizacion && (
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                backgroundColor: '#e8f5e9',
                                padding: '8px 12px',
                                borderRadius: 1,
                                color: '#2e7d32'
                            }}
                        >
                            <LocationOnIcon sx={{ fontSize: '1rem' }} />
                            Coordenadas guardadas: {formData.geolocalizacion}
                        </Typography>
                    )}

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Fecha Aniversario"
                            type="date"
                            value={formData.fechaAniversario}
                            onChange={(e) => handleChange('fechaAniversario', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Grupo</InputLabel>
                            <Select
                                value={formData.grupo}
                                label="Grupo"
                                onChange={(e) => handleChange('grupo', e.target.value as number)}
                            >
                                {grupoCliente.map((grupo) => (
                                    <MenuItem key={grupo.idGrupoCliente} value={grupo.idGrupoCliente}>
                                        {grupo.nombreGrupoCliente}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Sección: Contacto */}
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontSize: '0.75rem'
                        }}
                    >
                        Contacto
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Nro. Celular"
                            value={formData.celular}
                            onChange={(e) => handleChange('celular', e.target.value)}
                            autoComplete="off"
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Nro. Teléfono"
                            value={formData.telefono}
                            onChange={(e) => handleChange('telefono', e.target.value)}
                            autoComplete="off"
                        />
                    </Box>

                    <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                        autoComplete="off"
                    />

                    {/* Botones de acción */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        mt: 2,
                        flexDirection: { xs: 'column-reverse', sm: 'row' },
                        justifyContent: 'flex-end'
                    }}>
                        <Button
                            variant="outlined"
                            onClick={handleLimpiarYCerrar}
                            sx={{
                                color: '#666',
                                borderColor: '#ccc',
                                '&:hover': {
                                    borderColor: '#999',
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleGuardar}
                            sx={{
                                background: 'linear-gradient(135deg, #D4A017 0%, #F4C430 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #C49515 0%, #E3B32E 100%)'
                                }
                            }}
                        >
                            Guardar Cliente
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Modal>
    );
};

export default AgregarClienteModal;

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
    Grid
} from "@mui/material";
import { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SaveIcon from '@mui/icons-material/Save';

interface NuevoCliente {
    rucCedula: string;
    dv: number | null;
    nombre: string;
    apellido: string;
    direccion: string;
    fechaAniversario: string;
    grupo: number;
    celular: string;
    telefono: string;
    email: string;
}

interface AgregarClienteModalProps {
    open: boolean;
    onClose: () => void;
    onGuardar: (cliente: NuevoCliente) => void;
}

// Opciones de grupo (puedes modificar según tu backend)
const gruposCliente = [
    { id: 1, nombre: 'General' },
    { id: 2, nombre: 'VIP' },
    { id: 3, nombre: 'Mayorista' },
    { id: 4, nombre: 'Minorista' }
];

const AgregarClienteModal = ({ open, onClose, onGuardar }: AgregarClienteModalProps) => {
    const [formData, setFormData] = useState<NuevoCliente>({
        rucCedula: '',
        dv: null,
        nombre: '',
        apellido: '',
        direccion: '',
        fechaAniversario: '',
        grupo: 1,
        celular: '',
        telefono: '',
        email: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof NuevoCliente, string>>>({});

    const handleChange = (field: keyof NuevoCliente, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
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
            nuevosErrores.rucCedula = 'RUC/Cédula es requerido';
        }
        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'Nombre es requerido';
        }
        if (!formData.apellido.trim()) {
            nuevosErrores.apellido = 'Apellido es requerido';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nuevosErrores.email = 'Email inválido';
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
            dv: null,
            nombre: '',
            apellido: '',
            direccion: '',
            fechaAniversario: '',
            grupo: 1,
            celular: '',
            telefono: '',
            email: ''
        });
        setErrors({});
        onClose();
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
                            flexDirection: 'row'
                        }} 
                    >
                        <Grid container spacing={2}>
                            <Grid item size={9}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="RUC / Cédula *"
                                    value={formData.rucCedula}
                                    onChange={(e) => handleChange('rucCedula', e.target.value)}
                                    error={!!errors.rucCedula}
                                    helperText={errors.rucCedula}
                                    autoComplete="off"
                                />
                            </Grid>
                            <Grid item size={3}>
                                <TextField
                                    size="small"
                                    label="DV"
                                    value={formData.dv}
                                    onChange={(e) => handleChange('dv', e.target.value)}
                                    error={!!errors.dv}
                                    helperText={errors.dv}
                                    autoComplete="off"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Nombre *"
                            value={formData.nombre}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                            error={!!errors.nombre}
                            helperText={errors.nombre}
                            autoComplete="off"
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Apellido *"
                            value={formData.apellido}
                            onChange={(e) => handleChange('apellido', e.target.value)}
                            error={!!errors.apellido}
                            helperText={errors.apellido}
                            autoComplete="off"
                        />
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
                                {gruposCliente.map((grupo) => (
                                    <MenuItem key={grupo.id} value={grupo.id}>
                                        {grupo.nombre}
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

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export interface PedidoPendiente {
    idPedidoCliente: number;
    cliente: string;
    fechaEntrega: string;
    totalPedido: number;
    nombreVendedor: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onFacturar: (pedido: PedidoPendiente) => void;
    loadingFacturar: boolean;
}

export default function PedidosPendientesModal({ open, onClose, onFacturar, loadingFacturar }: Props) {
    const [pedidos, setPedidos] = useState<PedidoPendiente[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoPendiente | null>(null);

    // Cargar pedidos al abrir el modal
    useEffect(() => {
        if (open) {
            cargarPedidos();
            setPedidoSeleccionado(null);
        }
    }, [open]);

    const cargarPedidos = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/producto/consultaPedidosPendientes');
            setPedidos(response.data);
        } catch (err) {
            console.error('Error al cargar pedidos pendientes:', err);
            setError('Error al cargar los pedidos pendientes.');
            setPedidos([]);
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha: string) => {
        try {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-PY', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return fecha;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                color: 'white',
                fontWeight: 'bold'
            }}>
                <AssignmentIcon />
                Pedidos Pendientes
            </DialogTitle>

            <DialogContent sx={{ p: 2, mt: 1 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" textAlign="center" sx={{ py: 2 }}>
                        {error}
                    </Typography>
                ) : pedidos.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                        No hay pedidos pendientes.
                    </Typography>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        {pedidos.map((pedido) => {
                            const isSelected = pedidoSeleccionado?.idPedidoCliente === pedido.idPedidoCliente;
                            return (
                                <Card
                                    key={pedido.idPedidoCliente}
                                    variant="outlined"
                                    onClick={() => setPedidoSeleccionado(pedido)}
                                    sx={{
                                        cursor: 'pointer',
                                        border: isSelected ? '2px solid #1976D2' : '1px solid #e0e0e0',
                                        backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: isSelected ? '#e3f2fd' : '#f5f5f5',
                                            borderColor: '#1976D2'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ padding: '12px !important' }}>
                                        {/* Nombre del cliente */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                            <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="body1" fontWeight="bold">
                                                {pedido.cliente}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ my: 0.5 }} />

                                        {/* Fecha y vendedor */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Entrega: {formatearFecha(pedido.fechaEntrega)}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Vendedor: {pedido.nombreVendedor}
                                            </Typography>
                                        </Box>

                                        {/* Total */}
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                                            <Typography variant="body1" fontWeight="bold" color="primary">
                                                Total: {pedido.totalPedido.toLocaleString()} Gs.
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button onClick={onClose} color="inherit" disabled={loadingFacturar}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={() => pedidoSeleccionado && onFacturar(pedidoSeleccionado)}
                    disabled={!pedidoSeleccionado || loadingFacturar}
                    sx={{
                        background: 'linear-gradient(135deg, #28a745 0%, #34c759 100%)',
                        fontWeight: 'bold',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #218838 0%, #2dbe50 100%)'
                        }
                    }}
                >
                    {loadingFacturar ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Facturar Pedido'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

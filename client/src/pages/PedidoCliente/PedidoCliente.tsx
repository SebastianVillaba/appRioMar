import {
    Box,
    Container,
    TextField,
    IconButton,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Drawer,
    Fab,
    Divider,
    Badge,
    InputAdornment,
    CircularProgress,
    FormControl,
    FormLabel,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api from '../../services/api';
import CantidadModal from '../../components/HomePage/CantidadModal';
import AgregarClienteModal from '../../components/HomePage/AgregarClienteModal';
import { useUser } from '../../hooks/useUser';
import type { Producto, ItemCarrito, Cliente } from '../Home/HomePage';
import type { AgregarTmpDetVenta } from '../../types/venta.types';

export default function PedidoCliente() {
    // ============================================
    // DATOS DE USUARIO
    // ============================================
    const { idVendedor, logout } = useUser();
    const navigate = useNavigate();

    const ID_CONFIG = 3;
    const ID_VENDEDOR = idVendedor;
    const TIPO_PRECIO = 1;

    // ============================================
    // ESTADOS
    // ============================================

    // Búsqueda de productos
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loadingProducto, setLoadingProducto] = useState(false);
    const [errorProducto, setErrorProducto] = useState('');
    const [productosEncontrados, setProductosEncontrados] = useState<Producto[]>([]);

    // Fecha del pedido
    const [fechaPedido, setFechaPedido] = useState<string>('');

    // Modal de cantidad
    const [modalOpen, setModalOpen] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

    // Carrito
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);

    // Cliente
    const [clienteSearchTerm, setClienteSearchTerm] = useState('');
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [loadingCliente, setLoadingCliente] = useState(false);
    const [errorCliente, setErrorCliente] = useState('');
    const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);

    // Modal de agregar cliente
    const [modalAgregarClienteOpen, setModalAgregarClienteOpen] = useState(false);

    // Dialog de confirmación de pedido
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [orderLoading, setOrderLoading] = useState<boolean>(false);

    // ============================================
    // CARGAR CARRITO DESDE DB
    // ============================================
    const cargarCarritoDesdeDB = async () => {
        if (!ID_VENDEDOR) return;
        try {
            const response = await api.get(`/producto/consultaDetFacturacionTmp?idConfig=${ID_CONFIG}&idVendedor=${ID_VENDEDOR}`);
            setCarrito(response.data);
        } catch (err) {
            console.error('Error al cargar carrito:', err);
        }
    };

    const limpiarCarrito = async () => {
        if (!ID_VENDEDOR) return;
        try {
            await api.post(`/producto/limpiarDetFacturacionTmp_producto?idConfig=${ID_CONFIG}&idVendedor=${ID_VENDEDOR}`);
            setCarrito([]);
        } catch (err) {
            console.error('Error al limpiar carrito:', err);
        }
    };

    useEffect(() => {
        if (idVendedor) {
            limpiarCarrito();
        }
    }, [idVendedor]);

    // ============================================
    // HANDLERS - PRODUCTOS
    // ============================================

    /**
     * Busca productos por nombre o código via API
     */
    const handleBuscarProducto = async (): Promise<void> => {
        if (!searchTerm.trim()) {
            setErrorProducto('Por favor, ingrese un valor para la búsqueda por nombre o código');
            setProductosEncontrados([]);
            return;
        }
        setLoadingProducto(true);
        setErrorProducto('');
        setProductosEncontrados([]);

        try {
            const response = await api.get(`/producto/getProducto?busqueda=${encodeURIComponent(searchTerm)}`);
            setProductosEncontrados(response.data);
        } catch (err) {
            console.error('Error al buscar el producto:', err);
            setErrorProducto('Error al buscar el producto.');
            setProductosEncontrados([]);
        } finally {
            setLoadingProducto(false);
        }
    };

    /**
     * Abre el modal de cantidad para el producto seleccionado
     */
    const handleSeleccionarProducto = (producto: Producto): void => {
        setProductoSeleccionado(producto);
        setModalOpen(true);
    };

    /**
     * Agrega el producto al carrito via API
     */
    const handleAgregarAlCarrito = async (cantidad: number, cantidadAcomodato: number): Promise<void> => {
        if (!productoSeleccionado) return;

        if (!ID_VENDEDOR) {
            alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
            logout();
            navigate('/login');
            return;
        }

        // Validar stock
        if (!productoSeleccionado.idStock || productoSeleccionado.idStock <= 0) {
            alert('Este producto no tiene stock existente o es menor a 0. No se puede agregar al detalle.');
            setModalOpen(false);
            setProductoSeleccionado(null);
            return;
        }

        try {
            const datosAgregar: AgregarTmpDetVenta = {
                idConfig: ID_CONFIG,
                idVendedor: ID_VENDEDOR,
                idItem: productoSeleccionado.idProducto,
                idStock: productoSeleccionado.idStock,
                cantidad: cantidad,
                tipoPrecio: TIPO_PRECIO,
                tienePrecio: false,
                precioNuevo: productoSeleccionado.precio,
                cantidadComodato: cantidadAcomodato
            };

            await api.post('/producto/agregarDetFacturacionTmp_producto', datosAgregar);

            // Recargar el carrito desde la base de datos
            await cargarCarritoDesdeDB();
        } catch (err) {
            console.error('Error al agregar producto al carrito:', err);
            alert('Error al agregar el producto. Intente nuevamente.');
        }

        // Limpiar búsqueda de productos
        setSearchTerm('');
        setProductosEncontrados([]);
        setProductoSeleccionado(null);
    };

    // ============================================
    // HANDLERS - CARRITO
    // ============================================

    /**
     * Elimina un item del carrito via API
     */
    const handleEliminarDelCarrito = async (item: ItemCarrito): Promise<void> => {
        try {
            await api.post(`/producto/eliminarDetFacturacionTmp_producto?nro=${item.nro}&idVendedor=${ID_VENDEDOR}&idConfig=${ID_CONFIG}`);

            if (item.cantidadComodato > 0) {
                await api.post(`/producto/eliminarDetFacturacionTmp_producto_comodato?nro=${item.nro}&idVendedor=${ID_VENDEDOR}&idConfig=${ID_CONFIG}`);
            }

            await cargarCarritoDesdeDB();
        } catch (err) {
            console.error('Error al eliminar producto del carrito:', err);
            alert('Error al eliminar el producto. Intente nuevamente.');
        }
    };

    /**
     * Calcula el total del carrito
     */
    const calcularTotal = (): number => {
        return carrito.reduce((total, item) => total + (item.subtotal || item.precioDescuento * item.cantidad), 0);
    };

    /**
     * Cuenta el total de items en el carrito
     */
    const getTotalCartItems = (): number => {
        return carrito.reduce((total, item) => total + item.cantidad, 0);
    };

    // ============================================
    // HANDLERS - CLIENTE (en modal de confirmación)
    // ============================================

    /**
     * Busca clientes por nombre o documento
     */
    const handleBuscarCliente = async (): Promise<void> => {
        if (!clienteSearchTerm.trim()) {
            setErrorCliente('Por favor, ingrese el nombre o documento del cliente.');
            return;
        }
        setLoadingCliente(true);
        setErrorCliente('');
        setClientesEncontrados([]);

        try {
            const response = await api.get(`/cliente/getCliente?busqueda=${encodeURIComponent(clienteSearchTerm)}`);
            setClientesEncontrados(response.data);
        } catch (err) {
            console.error('Error al buscar el cliente:', err);
            setErrorCliente('Error al buscar el cliente.');
            setClientesEncontrados([]);
        } finally {
            setLoadingCliente(false);
        }
    };

    /**
     * Selecciona un cliente encontrado
     */
    const handleSeleccionarCliente = (cliente: Cliente): void => {
        setClienteSeleccionado(cliente);
        setClientesEncontrados([]);
        setClienteSearchTerm('');
    };

    // ============================================
    // HANDLERS - PEDIDO
    // ============================================

    /**
     * Abre el diálogo de confirmación
     */
    const handleConfirmOrder = (): void => {
        setConfirmDialogOpen(true);
    };

    /// ============================================
    /// FUNCIONES DE AYUDA
    /// ============================================
    const validarFecha = (fecha: string) => {
        const fechaActual = new Date();
        const fechaPedido = new Date(fecha);
        if (fechaPedido < fechaActual) {
            return false;
        }
        return true;
    }

    /**
     * Procesa el pedido
     * TODO: Implementar lógica de guardar pedido del cliente (trabajar juntos después)
     */
    const handlePlaceOrder = async (): Promise<void> => {
        if (!clienteSeleccionado) {
            alert('Por favor, seleccione un cliente.');
            return;
        }

        if (!ID_VENDEDOR) {
            alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
            logout();
            navigate('/login');
            return;
        }

        if (carrito.length === 0) {
            alert('Por favor, agregue al menos un producto.');
            return;
        }

        setOrderLoading(true);

        try {
            const pedidoData = {
                idConfig: ID_CONFIG,
                idCliente: clienteSeleccionado.idCliente,
                ruc: clienteSeleccionado.ruc || '',
                cliente: clienteSeleccionado.nombre,
                totalVenta: calcularTotal(),
                totalDescuento: 0,
                idUsuarioAlta: 1,
                idVendedor: ID_VENDEDOR,
                fecha: fechaPedido.split('-').reverse().join('/'),
                tipoPrecio: TIPO_PRECIO
            };

            const response = await api.post('/producto/guardarPedidoCliente', pedidoData);

            if (response.data.success) {
                alert(`¡Pedido realizado con éxito!\nCliente: ${clienteSeleccionado.nombre}\nTotal: Gs. ${calcularTotal().toLocaleString()}\nPedido #${response.data.idPedidoCliente}`);

                // Limpiar estado
                setCarrito([]);
                setClienteSeleccionado(null);
                setClienteSearchTerm('');
                setConfirmDialogOpen(false);
                setCartDrawerOpen(false);
            } else {
                alert('Error: No se pudo guardar el pedido correctamente.');
            }
        } catch (error) {
            console.error('Error al realizar el pedido:', error);
            alert('Error al realizar el pedido. Por favor, intente nuevamente.');
        } finally {
            setOrderLoading(false);
        }
    };

    /**
     * Cierra el dialog de confirmación y limpia estados de cliente
     */
    const handleCloseConfirmDialog = (): void => {
        setConfirmDialogOpen(false);
        setClienteSeleccionado(null);
        setClienteSearchTerm('');
        setClientesEncontrados([]);
        setErrorCliente('');
    };

    // ============================================
    //                  RENDER
    // ============================================
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #eff3fdff 0%, #e8f0fe 100%)',
                pb: 10,
            }}
        >
            <Container maxWidth="lg" sx={{ pt: 2 }}>
                {/* ============================================
                                BARRA DE BÚSQUEDA
                    ============================================ */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                        px: { xs: 1, sm: 2 },
                    }}
                >
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar productos por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleBuscarProducto();
                            }
                        }}
                        autoComplete="off"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleBuscarProducto}
                                        edge="end"
                                        color="primary"
                                        disabled={loadingProducto}
                                    >
                                        {loadingProducto ? <CircularProgress size={20} /> : <SearchIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            maxWidth: 600,
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Box>

                {/* Error de búsqueda */}
                {errorProducto && (
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography color="error" variant="body2">
                            {errorProducto}
                        </Typography>
                    </Box>
                )}

                {/* ============================================
                                LISTADO DE PRODUCTOS
                    ============================================ */}
                <Grid container spacing={2}>
                    {productosEncontrados.map((producto) => (
                        <Grid
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                            key={producto.idProducto}
                        >
                            <Card
                                elevation={3}
                                onClick={() => handleSeleccionarProducto(producto)}
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            minHeight: '3em',
                                        }}
                                    >
                                        {producto.nombreMercaderia}
                                    </Typography>
                                    {producto.codigo && (
                                        <Typography variant="caption" color="text.secondary">
                                            Código: {producto.codigo}
                                        </Typography>
                                    )}
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        Gs. {producto.precio.toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Mensaje cuando no hay resultados */}
                {searchTerm.trim() && !loadingProducto && productosEncontrados.length === 0 && !errorProducto && (
                    <Box sx={{ textAlign: 'center', mt: 4, py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            No se encontraron productos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Intenta con otra búsqueda
                        </Typography>
                    </Box>
                )}
            </Container>

            {/* ============================================
                        FAB - BOTÓN FLOTANTE DEL CARRITO
                ============================================ */}
            <Fab
                color="primary"
                aria-label="carrito"
                onClick={() => setCartDrawerOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                }}
            >
                <Badge badgeContent={getTotalCartItems()} color="error" max={99}>
                    <ShoppingCartIcon />
                </Badge>
            </Fab>

            {/* ============================================
                        MODAL DE CANTIDAD (CantidadModal)
                ============================================ */}
            <CantidadModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setProductoSeleccionado(null);
                }}
                onConfirm={handleAgregarAlCarrito}
                productoNombre={productoSeleccionado?.nombreMercaderia || ''}
            />

            {/* ============================================
                        DRAWER - CARRITO DE COMPRAS
                ============================================ */}
            <Drawer
                anchor="right"
                open={cartDrawerOpen}
                onClose={() => setCartDrawerOpen(false)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 400 } },
                }}
            >
                <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header del Drawer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Mi Carrito ({getTotalCartItems()})
                        </Typography>
                        <IconButton onClick={() => setCartDrawerOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Divider />

                    {/* Lista de Items del Carrito */}
                    <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
                        {carrito.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <ShoppingCartIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                                <Typography color="text.secondary">El carrito está vacío</Typography>
                            </Box>
                        ) : (
                            carrito.map((item) => (
                                <Card key={item.idDetTmp} variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {item.nombreServicio}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Precio unitario: {item.precioDescuento.toLocaleString()}
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            Cantidad: {item.cantidad}
                                                        </Typography>
                                                        {item.cantidadComodato > 0 && (
                                                            <Typography variant="body2" fontWeight="bold">
                                                                Comodato: {item.cantidadComodato}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Typography variant="body1" fontWeight="bold" color="primary">
                                                        {(item.subtotal || item.precioDescuento * item.cantidad).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleEliminarDelCarrito(item)}
                                                sx={{ ml: 1 }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </Box>

                    {/* Footer del Drawer - Total y Botón */}
                    {carrito.length > 0 && (
                        <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Total:
                                </Typography>
                                <Typography variant="h5" color="primary" fontWeight="bold">
                                    Gs. {calcularTotal().toLocaleString()}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={handleConfirmOrder}
                                sx={{
                                    bgcolor: '#dc3545',
                                    '&:hover': { bgcolor: '#c82333' },
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                Hacer Pedido
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>

            {/* ==============================================================
                    DIALOG - CONFIRMACIÓN DE PEDIDO (con búsqueda de cliente)
                ============================================================== */}
            <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Confirmar Pedido
                        <IconButton onClick={handleCloseConfirmDialog}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {/* Resumen del pedido */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Total de productos: {getTotalCartItems()}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            Total: Gs. {calcularTotal().toLocaleString()}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Sección de búsqueda de cliente */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                                Cliente
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<PersonAddIcon />}
                            onClick={() => setModalAgregarClienteOpen(true)}
                            sx={{
                                background: 'linear-gradient(135deg, #D4A017 0%, #F4C430 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                padding: { xs: '4px 8px', sm: '6px 12px' },
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #C49515 0%, #E3B32E 100%)'
                                }
                            }}
                        >
                            Nuevo
                        </Button>
                    </Box>

                    {!clienteSeleccionado ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Buscar cliente por nombre o documento"
                                size="small"
                                value={clienteSearchTerm}
                                onChange={(e) => setClienteSearchTerm(e.target.value)}
                                autoComplete="off"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleBuscarCliente();
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleBuscarCliente}
                                disabled={loadingCliente}
                                sx={{ backgroundColor: '#28a745' }}
                            >
                                {loadingCliente ? <CircularProgress size={24} color="inherit" /> : 'Buscar Cliente'}
                            </Button>
                            {errorCliente && (
                                <Typography color="error" variant="body2">
                                    {errorCliente}
                                </Typography>
                            )}

                            {/* Resultados de búsqueda de clientes */}
                            {clientesEncontrados.length > 0 && (
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    mt: 1,
                                    height: '200px',
                                    minHeight: '200px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    padding: 1,
                                    backgroundColor: '#fafafa',
                                    position: 'relative',
                                    flexShrink: 0
                                }}>
                                    <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                        sx={{
                                            position: 'sticky',
                                            top: 0,
                                            backgroundColor: '#fafafa',
                                            zIndex: 1,
                                            paddingBottom: 0.5
                                        }}
                                    >
                                        Resultados ({clientesEncontrados.length}):
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                        flexGrow: 1
                                    }}>
                                        {clientesEncontrados.map((cliente) => (
                                            <Card
                                                key={cliente.idCliente}
                                                variant="outlined"
                                                sx={{
                                                    backgroundColor: '#f8f9fa',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <CardContent sx={{ padding: '12px !important' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight="bold"
                                                                sx={{
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                {cliente.nombre}
                                                            </Typography>
                                                            {cliente.ruc && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Cédula: {cliente.ruc}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={() => handleSeleccionarCliente(cliente)}
                                                            sx={{
                                                                backgroundColor: '#28a745',
                                                                flexShrink: 0,
                                                                ml: 1
                                                            }}
                                                        >
                                                            Seleccionar
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box sx={{
                            backgroundColor: '#e8f5e9',
                            padding: 2,
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Box>
                                <Typography variant="body1" fontWeight="bold">
                                    {clienteSeleccionado.nombre}
                                </Typography>
                                {clienteSeleccionado.ruc && (
                                    <Typography variant="body2" color="text.secondary">
                                        Cédula: {clienteSeleccionado.ruc}
                                    </Typography>
                                )}
                            </Box>
                            <Button
                                size="small"
                                onClick={() => {
                                    setClienteSeleccionado(null);
                                    setClienteSearchTerm('');
                                    setClientesEncontrados([]);
                                }}
                            >
                                Cambiar
                            </Button>
                        </Box>
                    )}
                    <FormControl sx={{ mt: 2 }}>
                        <FormLabel sx={{ fontSize: '2.5vh' }}>Fecha del pedido</FormLabel>
                        <TextField
                            type="date"
                            value={fechaPedido}
                            onChange={(e) => setFechaPedido(e.target.value)}
                            error={!validarFecha(fechaPedido)}
                            helperText={!validarFecha(fechaPedido) ? 'La fecha del pedido no puede ser menor a la fecha actual.' : ''}
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseConfirmDialog} disabled={orderLoading}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePlaceOrder}
                        disabled={orderLoading || !clienteSeleccionado}
                        sx={{ bgcolor: '#28a745', '&:hover': { bgcolor: '#238b3aff' } }}
                    >
                        {orderLoading ? 'Procesando...' : 'Confirmar Pedido'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==============================================================
                                MODAL DE AGREGAR CLIENTE
                ============================================================== */}
            <AgregarClienteModal
                open={modalAgregarClienteOpen}
                onClose={() => setModalAgregarClienteOpen(false)}
                onGuardar={async (clienteData) => {
                    try {
                        const fechaAniversarioPorDefecto = clienteData.fechaAniversario || '1990-01-01';

                        const response = await api.post('/cliente/crearCliente', {
                            idUsuarioAlta: 1,
                            cliente: {
                                nombre: clienteData.nombre,
                                apellido: clienteData.apellido || '',
                                ruc: clienteData.rucCedula,
                                dv: clienteData.dv || '',
                                direccion: clienteData.direccion || '',
                                referencia: clienteData.referencia || '',
                                fechaAniversario: fechaAniversarioPorDefecto,
                                celular: clienteData.celular || '',
                                telefono: clienteData.telefono || '',
                                email: clienteData.email || '',
                                idGrupoCliente: clienteData.grupo,
                                geologalizacion: clienteData.geolocalizacion || ''
                            }
                        });

                        if (response.data.success === false) {
                            alert(`Error al guardar cliente: ${response.data.message}`);
                            return;
                        }

                        // Si el backend devuelve el cliente creado, lo seleccionamos automáticamente
                        if (response.data.data && response.data.data.length > 0) {
                            const nuevoCliente = response.data.data[0];
                            setClienteSeleccionado({
                                idCliente: nuevoCliente.idCliente,
                                nombre: `${clienteData.nombre} ${clienteData.apellido || ''}`.trim(),
                                ruc: clienteData.rucCedula,
                                direccion: clienteData.direccion || ''
                            });
                        }

                        alert('Cliente guardado exitosamente!');
                        setModalAgregarClienteOpen(false);
                    } catch (error: unknown) {
                        console.error('Error al guardar cliente:', error);
                        const axiosError = error as { response?: { data?: { message?: string; success?: boolean } } };
                        if (axiosError.response?.data?.message) {
                            alert(`Error: ${axiosError.response.data.message}`);
                        } else {
                            alert('Error al guardar el cliente. Por favor, intente nuevamente.');
                        }
                    }
                }}
            />
        </Box>
    );
}

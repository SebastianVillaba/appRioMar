import {
    Box,
    Container,
    TextField,
    IconButton,
    Grid,
    Card,
    CardContent,
    CardMedia,
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
} from '@mui/material';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

// ============================================
// INTERFACES
// ============================================
interface Product {
    id: string;
    nombre: string;
    precio: string;
    imagen: string;
}

interface ProductWrapper {
    producto: Product;
}

interface CartItem {
    producto: Product;
    cantidad: number;
}

// ============================================
// MOCK DATA - TODO: Replace with API call
// ============================================
const MOCK_PRODUCTS: ProductWrapper[] = [
    { producto: { id: '1', nombre: 'AGUA MINERAL 20LTS', precio: '20.000', imagen: 'https://salemmaonline.com.py/products/2198102536010.jpg?v=5' } },
    { producto: { id: '2', nombre: 'DISPENSER DE BIDON', precio: '85.000', imagen: 'https://clasicdn.paraguay.com/pictures/2021/01/19/1750040/6721961L.webp' } },
    { producto: { id: '3', nombre: 'AGUA MINERAL 10LTS', precio: '12.000', imagen: 'https://via.placeholder.com/150' } },
    { producto: { id: '4', nombre: 'BIDON RECARGA 20LTS', precio: '8.000', imagen: 'https://via.placeholder.com/150' } },
    { producto: { id: '5', nombre: 'VASO DESCARTABLE x100', precio: '15.000', imagen: 'https://via.placeholder.com/150' } },
    { producto: { id: '6', nombre: 'DISPENSER FRIO/CALIENTE', precio: '250.000', imagen: 'https://via.placeholder.com/150' } },
];

export default function PedidoCliente() {
    // ============================================
    // ESTADOS
    // ============================================
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredProducts, setFilteredProducts] = useState<ProductWrapper[]>(MOCK_PRODUCTS);

    // Estado para el modal de añadir producto
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productDialogOpen, setProductDialogOpen] = useState<boolean>(false);
    const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(1);

    // Estado del carrito
    const [carrito, setCarrito] = useState<CartItem[]>([]);
    const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);

    // Estado para el dialog de confirmación de pedido
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [orderLoading, setOrderLoading] = useState<boolean>(false);

    // ============================================
    // HANDLERS
    // ============================================

    /**
     * Busca productos por nombre
     * TODO: Replace with API call
     */
    const handleSearch = async (): Promise<void> => {
        // TODO: Replace with API call
        // const response = await api.get(`/productos/search?q=${searchTerm}`);
        // setFilteredProducts(response.data);

        if (!searchTerm.trim()) {
            setFilteredProducts(MOCK_PRODUCTS);
            return;
        }

        const filtered = MOCK_PRODUCTS.filter((item) =>
            item.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    /**
     * Abre el modal para seleccionar cantidad
     */
    const handleProductClick = (producto: Product): void => {
        setSelectedProduct(producto);
        setCantidadSeleccionada(1);
        setProductDialogOpen(true);
    };

    /**
     * Añade el producto seleccionado al carrito
     * TODO: Replace with API call
     */
    const handleAddToCart = async (): Promise<void> => {
        if (!selectedProduct) return;

        // TODO: Replace with API call
        // await api.post('/carrito/add', { productoId: selectedProduct.id, cantidad: cantidadSeleccionada });

        const existingItem = carrito.find((item) => item.producto.id === selectedProduct.id);

        if (existingItem) {
            setCarrito(
                carrito.map((item) =>
                    item.producto.id === selectedProduct.id
                        ? { ...item, cantidad: item.cantidad + cantidadSeleccionada }
                        : item
                )
            );
        } else {
            setCarrito([...carrito, { producto: selectedProduct, cantidad: cantidadSeleccionada }]);
        }

        setProductDialogOpen(false);
        setSelectedProduct(null);
        setCantidadSeleccionada(1);
    };

    /**
     * Modifica la cantidad de un item en el carrito
     */
    const handleUpdateCartItemQuantity = (productoId: string, cambio: number): void => {
        setCarrito(
            carrito.map((item) => {
                if (item.producto.id === productoId) {
                    const nuevaCantidad = item.cantidad + cambio;
                    return { ...item, cantidad: Math.max(1, nuevaCantidad) };
                }
                return item;
            })
        );
    };

    /**
     * Elimina un item del carrito
     */
    const handleRemoveFromCart = (productoId: string): void => {
        setCarrito(carrito.filter((item) => item.producto.id !== productoId));
    };

    /**
     * Calcula el total del carrito
     */
    const calcularTotal = (): number => {
        return carrito.reduce((total, item) => {
            const precio = parseInt(item.producto.precio.replace(/\./g, ''), 10);
            return total + precio * item.cantidad;
        }, 0);
    };

    /**
     * Formatea un número como precio
     */
    const formatPrecio = (precio: number): string => {
        return precio.toLocaleString('es-PY');
    };

    /**
     * Abre el diálogo de confirmación
     */
    const handleConfirmOrder = (): void => {
        setConfirmDialogOpen(true);
    };

    /**
     * Procesa el pedido
     * TODO: Replace with API call
     */
    const handlePlaceOrder = async (): Promise<void> => {
        setOrderLoading(true);

        try {
            // TODO: Replace with API call
            // const orderData = {
            //   items: carrito.map(item => ({
            //     productoId: item.producto.id,
            //     cantidad: item.cantidad,
            //     precioUnitario: item.producto.precio
            //   })),
            //   total: calcularTotal()
            // };
            // await api.post('/pedidos/crear', orderData);

            // Simulamos un delay de red
            await new Promise((resolve) => setTimeout(resolve, 1000));

            alert('¡Pedido realizado con éxito!');

            // Limpiar estado
            setCarrito([]);
            setConfirmDialogOpen(false);
            setCartDrawerOpen(false);
        } catch (error) {
            console.error('Error al realizar el pedido:', error);
            alert('Error al realizar el pedido. Por favor, intente nuevamente.');
        } finally {
            setOrderLoading(false);
        }
    };

    /**
     * Cuenta el total de items en el carrito
     */
    const getTotalCartItems = (): number => {
        return carrito.reduce((total, item) => total + item.cantidad, 0);
    };

    // ============================================
    // RENDER
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
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleSearch} edge="end" color="primary">
                                        <SearchIcon />
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

                {/* ============================================
            LISTADO DE PRODUCTOS
            ============================================ */}
                <Grid container spacing={2}>
                    {filteredProducts.map((item) => (
                        <Grid
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                            key={item.producto.id}
                        >
                            <Card
                                elevation={3}
                                onClick={() => handleProductClick(item.producto)}
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="150"
                                    image={item.producto.imagen}
                                    alt={item.producto.nombre}
                                    sx={{ objectFit: 'cover' }}
                                />
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
                                        {item.producto.nombre}
                                    </Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        Gs. {item.producto.precio}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Mensaje cuando no hay resultados */}
                {filteredProducts.length === 0 && (
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
          DIALOG - SELECCIONAR CANTIDAD
          ============================================ */}
            <Dialog
                open={productDialogOpen}
                onClose={() => setProductDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Añadir al carrito
                        <IconButton onClick={() => setProductDialogOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedProduct && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Box
                                component="img"
                                src={selectedProduct.imagen}
                                alt={selectedProduct.nombre}
                                sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, mb: 2 }}
                            />
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {selectedProduct.nombre}
                            </Typography>
                            <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                                Gs. {selectedProduct.precio}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3, gap: 2 }}>
                                <IconButton
                                    onClick={() => setCantidadSeleccionada(Math.max(1, cantidadSeleccionada - 1))}
                                    disabled={cantidadSeleccionada <= 1}
                                    sx={{ bgcolor: 'grey.200', '&:hover': { bgcolor: 'grey.300' } }}
                                >
                                    <RemoveIcon />
                                </IconButton>
                                <Typography variant="h4" fontWeight="bold" sx={{ minWidth: 60, textAlign: 'center' }}>
                                    {cantidadSeleccionada}
                                </Typography>
                                <IconButton
                                    onClick={() => setCantidadSeleccionada(cantidadSeleccionada + 1)}
                                    sx={{ bgcolor: 'grey.200', '&:hover': { bgcolor: 'grey.300' } }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleAddToCart}
                        sx={{
                            bgcolor: '#28a745',
                            '&:hover': { bgcolor: '#218838' },
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                        }}
                    >
                        Añadir al Carrito
                    </Button>
                </DialogActions>
            </Dialog>

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
                                <Card key={item.producto.id} variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box
                                                component="img"
                                                src={item.producto.imagen}
                                                alt={item.producto.nombre}
                                                sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="bold" noWrap>
                                                    {item.producto.nombre}
                                                </Typography>
                                                <Typography variant="body2" color="primary" fontWeight="bold">
                                                    Gs. {item.producto.precio}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleUpdateCartItemQuantity(item.producto.id, -1)}
                                                            disabled={item.cantidad <= 1}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 24, textAlign: 'center' }}>
                                                            {item.cantidad}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleUpdateCartItemQuantity(item.producto.id, 1)}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveFromCart(item.producto.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
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
                                    Gs. {formatPrecio(calcularTotal())}
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

            {/* ============================================
          DIALOG - CONFIRMACIÓN DE PEDIDO
          ============================================ */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirmar Pedido</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Total de productos: {getTotalCartItems()}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            Total: {formatPrecio(calcularTotal())}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmDialogOpen(false)} disabled={orderLoading}>
                        Cancelar 
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePlaceOrder}
                        disabled={orderLoading}
                        sx={{ bgcolor: '#28a745', '&:hover': { bgcolor: '#238b3aff' } }}
                    >
                        {orderLoading ? 'Procesando...' : 'Confirmar Pedido'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

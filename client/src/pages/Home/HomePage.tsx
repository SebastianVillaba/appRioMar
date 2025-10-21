import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  IconButton, 
  Radio, 
  RadioGroup, 
  TextField, 
  Typography 
} from '@mui/material';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';

interface Cliente {
  id: number;
  nombre: string;
  documento?: string;
}

interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stock?: number;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export default function HomePage() {
  // Estados para Cliente
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState("");

  // Estados para Productos
  const [productoSearchTerm, setProductoSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("1"); // 1: nombre, 2: código
  const [loadingProducto, setLoadingProducto] = useState(false);
  const [errorProducto, setErrorProducto] = useState("");
  const [productosEncontrados, setProductosEncontrados] = useState<Producto[]>([]);

  // Estados para Carrito
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loadingFacturacion, setLoadingFacturacion] = useState(false);

  // Búsqueda de Cliente
  const handleBuscarCliente = async () => {
    if (!clienteSearchTerm.trim()) {
      setErrorCliente("Por favor, ingrese el nombre o documento del cliente.");
      return;
    }
    setLoadingCliente(true);
    setErrorCliente("");

    try {
      // TODO: Aquí iría la lógica del pedido al backend
      // const response = await fetch(`/api/clientes/buscar?q=${clienteSearchTerm}`);
      // const data = await response.json();
      
      // Simulación temporal
      setTimeout(() => {
        setClienteSeleccionado({
          id: 1,
          nombre: clienteSearchTerm,
          documento: "12345678"
        });
        setLoadingCliente(false);
      }, 500);
    } catch (err) {
      setErrorCliente('Error al buscar el cliente.');
      setLoadingCliente(false);
    }
  };

  // Búsqueda de Productos
  const handleBuscarProducto = async () => {
    if (!productoSearchTerm.trim()) {
      setErrorProducto(`Por favor, ingrese un valor para la búsqueda por ${searchType === '1' ? 'nombre' : 'código'}.`);
      setProductosEncontrados([]);
      return;
    }
    setLoadingProducto(true);
    setErrorProducto("");
    setProductosEncontrados([]);

    try {
      // TODO: Aquí iría la lógica del pedido al backend
      // const response = await fetch(`/api/productos/buscar?tipo=${searchType}&q=${productoSearchTerm}`);
      // const data = await response.json();
      
      // Simulación temporal
      setTimeout(() => {
        setProductosEncontrados([
          { id: 1, nombre: productoSearchTerm, codigo: "PROD001", precio: 1500, stock: 10 },
          { id: 2, nombre: `${productoSearchTerm} Premium`, codigo: "PROD002", precio: 2000, stock: 5 }
        ]);
        setLoadingProducto(false);
      }, 500);
    } catch (err) {
      setErrorProducto('Error al buscar el producto.');
      setLoadingProducto(false);
    }
  };

  // Agregar producto al carrito
  const handleAgregarAlCarrito = (producto: Producto) => {
    const itemExistente = carrito.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item => 
        item.producto.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }]);
    }
    
    // Limpiar búsqueda de productos
    setProductoSearchTerm("");
    setProductosEncontrados([]);
  };

  // Modificar cantidad en carrito
  const handleCambiarCantidad = (productoId: number, cambio: number) => {
    setCarrito(carrito.map(item => {
      if (item.producto.id === productoId) {
        const nuevaCantidad = item.cantidad + cambio;
        return { ...item, cantidad: Math.max(1, nuevaCantidad) };
      }
      return item;
    }));
  };

  // Eliminar del carrito
  const handleEliminarDelCarrito = (productoId: number) => {
    setCarrito(carrito.filter(item => item.producto.id !== productoId));
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  };

  // Finalizar facturación
  const handleFinalizarFacturacion = async () => {
    if (!clienteSeleccionado) {
      alert("Por favor, seleccione un cliente.");
      return;
    }
    if (carrito.length === 0) {
      alert("Por favor, agregue al menos un producto.");
      return;
    }

    setLoadingFacturacion(true);

    try {
      // TODO: Aquí iría la lógica para enviar la factura al backend
      // const response = await fetch('/api/facturas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     clienteId: clienteSeleccionado.id,
      //     items: carrito.map(item => ({
      //       productoId: item.producto.id,
      //       cantidad: item.cantidad,
      //       precio: item.producto.precio
      //     })),
      //     total: calcularTotal()
      //   })
      // });

      setTimeout(() => {
        alert(`Factura generada exitosamente!\nCliente: ${clienteSeleccionado.nombre}\nTotal: $${calcularTotal().toFixed(2)}`);
        // Limpiar todo
        setClienteSeleccionado(null);
        setClienteSearchTerm("");
        setCarrito([]);
        setLoadingFacturacion(false);
      }, 1000);
    } catch (err) {
      alert('Error al generar la factura.');
      setLoadingFacturacion(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
      padding: '1rem',
      paddingBottom: '5rem',
      overflow: 'auto'
    }}>
      <Box sx={{ 
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {/* SECCIÓN 1: BÚSQUEDA DE CLIENTE */}
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Cliente
              </Typography>
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
                  autoComplete='off'
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
                  {clienteSeleccionado.documento && (
                    <Typography variant="body2" color="text.secondary">
                      Doc: {clienteSeleccionado.documento}
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  onClick={() => {
                    setClienteSeleccionado(null);
                    setClienteSearchTerm("");
                  }}
                >
                  Cambiar
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* SECCIÓN 2: BÚSQUEDA DE PRODUCTOS */}
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ShoppingCartIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Agregar Productos
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={searchType === '1' ? "Buscar por nombre del producto" : "Buscar por código del producto"}
                size="small"
                value={productoSearchTerm}
                onChange={(e) => setProductoSearchTerm(e.target.value)}
                autoComplete='off'
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBuscarProducto();
                  }
                }}
              />

              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  sx={{ justifyContent: 'center' }}
                >
                  <FormControlLabel value="1" control={<Radio size="small" />} label="Nombre" />
                  <FormControlLabel value="2" control={<Radio size="small" />} label="Código" />
                </RadioGroup>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                onClick={handleBuscarProducto}
                disabled={loadingProducto}
                sx={{ backgroundColor: '#007bff' }}
              >
                {loadingProducto ? <CircularProgress size={24} color="inherit" /> : 'Buscar Producto'}
              </Button>

              {errorProducto && (
                <Typography color="error" variant="body2">
                  {errorProducto}
                </Typography>
              )}

              {/* Resultados de búsqueda de productos */}
              {productosEncontrados.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Resultados:
                  </Typography>
                  {productosEncontrados.map((producto) => (
                    <Card key={producto.id} variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                      <CardContent sx={{ padding: '12px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {producto.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Código: {producto.codigo}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              ${producto.precio.toFixed(2)}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleAgregarAlCarrito(producto)}
                            sx={{ backgroundColor: '#28a745' }}
                          >
                            Agregar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* SECCIÓN 3: CARRITO DE PRODUCTOS */}
        {carrito.length > 0 && (
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ReceiptIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Productos Seleccionados ({carrito.length})
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {carrito.map((item) => (
                  <Card key={item.producto.id} variant="outlined">
                    <CardContent sx={{ padding: '12px !important' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {item.producto.nombre}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleEliminarDelCarrito(item.producto.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          Precio unitario: ${item.producto.precio.toFixed(2)}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleCambiarCantidad(item.producto.id, -1)}
                              disabled={item.cantidad <= 1}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body1" fontWeight="bold" sx={{ minWidth: '40px', textAlign: 'center' }}>
                              {item.cantidad}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleCambiarCantidad(item.producto.id, 1)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="body1" fontWeight="bold" color="primary">
                            ${(item.producto.precio * item.cantidad).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    TOTAL:
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    ${calcularTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* BOTÓN DE FINALIZAR FACTURACIÓN */}
        {carrito.length > 0 && clienteSeleccionado && (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleFinalizarFacturacion}
            disabled={loadingFacturacion}
            sx={{ 
              backgroundColor: '#dc3545',
              padding: '16px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#c82333'
              }
            }}
          >
            {loadingFacturacion ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'FINALIZAR FACTURACIÓN'
            )}
          </Button>
        )}
      </Box>
    </Box>
  );
}

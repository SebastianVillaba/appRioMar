import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Divider, 
  IconButton, 
  TextField, 
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel 
} from '@mui/material';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FacturaCompleteExample from '../../examples/FacturaCompleteExample';
import { crearDatosFactura, generarNumeroFactura, useTicketService } from '../../services';
import api from '../../services/api';
import CantidadModal from '../../components/HomePage/CantidadModal';
import type { Venta, TipoVenta } from '../../types/venta.types';

interface Cliente {
  idCliente: number;
  nombre: string;
  ruc?: string;
  direccion: string;
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
  cantidadAcomodato: number;
}

export default function HomePage() {
  // Estados para Cliente
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState("");
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);

  // Estados para Productos
  const [productoSearchTerm, setProductoSearchTerm] = useState("");
  const [loadingProducto, setLoadingProducto] = useState(false);
  const [errorProducto, setErrorProducto] = useState("");
  const [productosEncontrados, setProductosEncontrados] = useState<Producto[]>([]);

  // Estados para Carrito
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loadingFacturacion, setLoadingFacturacion] = useState(false);

  // Estados para el modal de cantidad
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Hook para el ticket
  const { generarTicket, loading, error } = useTicketService();
  const [success, setSuccess] = useState(false);

  // Estado para tipo de venta
  const [tipoVenta, setTipoVenta] = useState<number>(1); // Default: Contado
  
  // Opciones de tipo de venta
  const tiposVenta: TipoVenta[] = [
    { id: 1, nombre: 'Contado' },
    { id: 2, nombre: 'Crédito' }
  ];

  // Datos de ejemplo
    const items: ItemFactura[] = [
        {
            codigo: 1001,
            mercaderia: "Laptop HP 15.6\" Core i5",
            precio: 3500000,
            cantidad: 1,
            porcentajeImpuesto: 10,
            subtotal: 3500000
        },
        {
            codigo: 1002,
            mercaderia: "Mouse Inalámbrico Logitech",
            precio: 150000,
            cantidad: 2,
            porcentajeImpuesto: 10,
            subtotal: 300000
        },
        {
            codigo: 1003,
            mercaderia: "Cable HDMI 2m",
            precio: 50000,
            cantidad: 1,
            porcentajeImpuesto: 5,
            subtotal: 50000
        }
    ];

    // Crear datos de factura con cálculos automáticos
    const datosFactura = crearDatosFactura({
        // Datos de la empresa
        nombreFantasia: "TechStore Paraguay",
        empresaContable: "TechStore S.A.",
        ruc: "80012345-6",
        direccion: "Av. Mariscal López 1234, Asunción",
        telefono: "021-555-1234",
        rubro: "Venta de equipos informáticos",

        // Datos de la venta
        fechaHora: new Date(),
        cliente: "Juan Pérez González",
        rucCliente: "4567890-1",
        direccionCliente: "Calle España 567, Fernando de la Mora",
        telefonoCliente: "0981-123456",
        vendedor: "María González",
        formaVenta: "Contado",
        tipoFactura: "Contado",
        timbrado: "15789456",
        fechaInicioVigencia: new Date("2024-01-01"),
        nroFactura: generarNumeroFactura(1, 1, 456),

        // Items
        items: items
    });

    const handleImprimir = async () => {
        setSuccess(false);
        try {
            await generarTicket(datosFactura);
            setSuccess(true);
            
            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error al imprimir:', err);
        }
    };

  // Búsqueda de Cliente
  const handleBuscarCliente = async () => {
    if (!clienteSearchTerm.trim()) {
      setErrorCliente("Por favor, ingrese el nombre o documento del cliente.");
      return;
    }
    setLoadingCliente(true);
    setErrorCliente("");
    setClientesEncontrados([]);

    try {
      const response = await api.get(`/cliente/getCliente?busqueda=${encodeURIComponent(clienteSearchTerm)}`);
      const clientes = response.data;
      console.log(clientes);
      setClientesEncontrados(clientes);
    } catch (err) {
      console.error('Error al buscar el cliente:', err);
      setErrorCliente('Error al buscar el cliente.');
      setClientesEncontrados([]);
    } finally {
      setLoadingCliente(false);
    }
  };

  // Seleccionar cliente
  const handleSeleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setClientesEncontrados([]);
    setClienteSearchTerm("");
  };

  // Búsqueda de Productos
  const handleBuscarProducto = async () => {
    if (!productoSearchTerm.trim()) {
      setErrorProducto(`Por favor, ingrese un valor para la búsqueda por nombre o código`);
      setProductosEncontrados([]);
      return;
    }
    setLoadingProducto(true);
    setErrorProducto("");
    setProductosEncontrados([]);

    try {
      const response = await api.get(`/producto/getProducto?busqueda=${encodeURIComponent(productoSearchTerm)}`);
      const productos = response.data;
      console.log(productos);
      setProductosEncontrados(productos);
    } catch (err) {
      console.error('Error al buscar el producto:', err);
      setErrorProducto('Error al buscar el producto.');
      setProductosEncontrados([]);
    } finally {
      setLoadingProducto(false);
    }
  };

  // Abrir modal para seleccionar cantidades
  const handleSeleccionarProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setModalOpen(true);
  };

  // Agregar producto al carrito con cantidades
  const handleAgregarAlCarrito = (cantidad: number, cantidadAcomodato: number) => {
    if (!productoSeleccionado) return;

    const itemExistente = carrito.find(item => item.producto.id === productoSeleccionado.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item => 
        item.producto.id === productoSeleccionado.id 
          ? { 
              ...item, 
              cantidad: item.cantidad + cantidad,
              cantidadAcomodato: item.cantidadAcomodato + cantidadAcomodato
            }
          : item
      ));
    } else {
      setCarrito([...carrito, { 
        producto: productoSeleccionado, 
        cantidad, 
        cantidadAcomodato 
      }]);
    }
    
    // Limpiar búsqueda de productos
    setProductoSearchTerm("");
    setProductosEncontrados([]);
    setProductoSeleccionado(null);
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
      // Preparar datos de la venta según la interfaz Venta
      const ventaData: Venta = {
        idConfig: 3, // Constante para dispositivos web
        idPersonaJur: 1, // Constante
        idSucursal: 1, 
        idCliente: clienteSeleccionado.idCliente,
        idTipoVenta: tipoVenta,
        ruc: clienteSeleccionado.ruc || '',
        cliente: clienteSeleccionado.nombre,
        totalVenta: calcularTotal(),
        totalDescuento: 0, 
        idUsuarioAlta: 1, 
        timbrado: '', 
        dsuc: '', 
        dcaja: '', 
        facturam: '', 
        idVendedor: 1, 
        fecha: '',
        tipoPrecio: 1, 
        imprimir: true,
        imp: true,
        unSoloItem: false
      };

      const response = await api.post('/producto/finalizarVenta', ventaData);
      
      alert(`Factura generada exitosamente!\nCliente: ${clienteSeleccionado.nombre}\nTotal: ${calcularTotal().toLocaleString()}`);
      
      // Limpiar todo
      setClienteSeleccionado(null);
      setClienteSearchTerm("");
      setCarrito([]);
      setTipoVenta(1); // Reset a Contado
    } catch (err) {
      console.error('Error al finalizar venta:', err);
      alert('Error al generar la factura. Por favor, intente nuevamente.');
    } finally {
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

                {/* Resultados de búsqueda de clientes */}
                {clientesEncontrados.length > 0 && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1, 
                    mt: 1,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    padding: 1
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Resultados ({clientesEncontrados.length}):
                    </Typography>
                    {clientesEncontrados.map((cliente) => (
                      <Card key={cliente.idCliente} variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                        <CardContent sx={{ padding: '12px !important' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
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
                              sx={{ backgroundColor: '#28a745' }}
                            >
                              Seleccionar
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
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
                      Cedula: {clienteSeleccionado.ruc}
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  onClick={() => {
                    setClienteSeleccionado(null);
                    setClienteSearchTerm("");
                    setClientesEncontrados([]);
                  }}
                >
                  Cambiar
                </Button>
              </Box>
              )
            }
          </CardContent>
        </Card>

        {/* SECCIÓN 2: TIPO DE VENTA */}
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ReceiptIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Tipo de Venta
              </Typography>
            </Box>

            <FormControl fullWidth size="small">
              <InputLabel id="tipo-venta-label">Tipo de Venta</InputLabel>
              <Select
                labelId="tipo-venta-label"
                id="tipo-venta-select"
                value={tipoVenta}
                label="Tipo de Venta"
                onChange={(e) => setTipoVenta(e.target.value as number)}
              >
                {tiposVenta.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* SECCIÓN 3: BÚSQUEDA DE PRODUCTOS */}
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
                placeholder="Buscar producto por nombre o código"
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
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1, 
                  mt: 1,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  padding: 1
                }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Resultados ({productosEncontrados.length}):
                  </Typography>
                  {productosEncontrados.map((producto) => (
                    <Card key={producto.id} variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                      <CardContent sx={{ padding: '12px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {producto.nombreMercaderia}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Código: {producto.codigo}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              {producto.precio.toLocaleString()}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleSeleccionarProducto(producto)}
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

        {/* SECCIÓN 4: CARRITO DE PRODUCTOS */}
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
                            {item.producto.nombreMercaderia}
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
                          Precio unitario: {item.producto.precio.toLocaleString()}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          Acomodato: {item.cantidadAcomodato}
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
                            {(item.producto.precio * item.cantidad).toLocaleString()}
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
                    {calcularTotal().toLocaleString()}
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

      {/* Modal de Cantidad */}
      <CantidadModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setProductoSeleccionado(null);
        }}
        onConfirm={handleAgregarAlCarrito}
        productoNombre={productoSeleccionado?.nombreMercaderia || ''}
      />
    </Box>
  );
}

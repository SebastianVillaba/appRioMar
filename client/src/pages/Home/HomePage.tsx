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
import { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api from '../../services/api';
import CantidadModal from '../../components/HomePage/CantidadModal';
import AgregarClienteModal from '../../components/HomePage/AgregarClienteModal';
import { useUser } from '../../hooks/useUser';
import type { Venta, TipoVenta, AgregarTmpDetVenta } from '../../types/venta.types';
import { generarTicket } from '../../services/ticketService.example';

interface Cliente {
  idCliente: number;
  nombre: string;
  ruc?: string;
  direccion: string;
}

interface Producto {
  idProducto: number;
  nombreMercaderia: string;
  nombreServicio?: string;
  codigo: string;
  precio: number;
  cantidad?: number;
  idStock: number | null;
}

interface ItemCarrito {
  idDetTmp: number;
  nro: number;
  nombreServicio: string;
  cantidad: number;
  cantidadComodato: number;
  precio: number;
  precioDescuento: number;
  subtotal: number;
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

  // Estado para modal de agregar cliente
  const [modalAgregarClienteOpen, setModalAgregarClienteOpen] = useState(false);

  // Estado para tipo de venta
  const [tipoVenta, setTipoVenta] = useState<number>(1); // Default: Contado

  // Opciones de tipo de venta
  const tiposVenta: TipoVenta[] = [
    { id: 1, nombre: 'Contado' },
    { id: 2, nombre: 'Crédito' }
  ];

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

  // Datos del usuario desde el estado global
  const { idVendedor } = useUser();

  // Constantes de configuración
  const ID_CONFIG = 3;
  const ID_VENDEDOR = idVendedor || 1; // Usa el del estado global o 1 como fallback
  const TIPO_PRECIO = 1;

  // Cargar carrito desde la base de datos
  const cargarCarritoDesdeDB = async () => {
    try {
      const response = await api.get(`/producto/consultaDetFacturacionTmp?idConfig=${ID_CONFIG}&idVendedor=${ID_VENDEDOR}`);
      console.log(response.data);
      setCarrito(response.data);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
    }
  };

  // Cargar carrito al montar el componente
  useEffect(() => {
    cargarCarritoDesdeDB();
  }, []);

  const handleImprimirFactura = async (idFacturacion: number, tieneComodato: boolean) => {
    try {
      const response = await api.get(`/factura/imprimir/${idFacturacion}`);
      if (response.data.success) {
        const datosFactura = response.data.data;
        console.log("Estos son los datos de la factura: ", datosFactura);

        // Si tiene comodato, obtener los datos adicionales
        if (tieneComodato) {
          try {
            const comodatoResponse = await api.get(`/factura/comodato/${idFacturacion}`);
            if (comodatoResponse.data.success) {
              datosFactura.comodato = comodatoResponse.data.data;
              console.log("Datos de comodato: ", datosFactura.comodato);
            }
          } catch (comodatoError) {
            console.error('Error al obtener datos de comodato:', comodatoError);
            // Continuar con la impresión sin comodato
          }
        }

        generarTicket(datosFactura);
      }
    } catch (error) {
      console.error('Error al obtener datos de la factura:', error);
    }
  };

  // Agregar producto al carrito con cantidades (llama al backend)
  const handleAgregarAlCarrito = async (cantidad: number, cantidadAcomodato: number) => {
    if (!productoSeleccionado) return;

    // Validar que el producto tenga stock disponible
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

      console.log(datosAgregar);


      await api.post('/producto/agregarDetFacturacionTmp_producto', datosAgregar);

      // Recargar el carrito desde la base de datos
      await cargarCarritoDesdeDB();

    } catch (err) {
      console.error('Error al agregar producto al carrito:', err);
      alert('Error al agregar el producto. Intente nuevamente.');
    }

    // Limpiar búsqueda de productos
    setProductoSearchTerm("");
    setProductosEncontrados([]);
    setProductoSeleccionado(null);
  };

  // Eliminar del carrito - llama al backend
  const handleEliminarDelCarrito = async (nro: number) => {
    try {
      await api.post(`/producto/eliminarDetFacturacionTmp_producto?nro=${nro}&idVendedor=${ID_VENDEDOR}`);
      // Recargar el carrito desde la base de datos
      await cargarCarritoDesdeDB();
    } catch (err) {
      console.error('Error al eliminar producto del carrito:', err);
      alert('Error al eliminar el producto. Intente nuevamente.');
    }
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.subtotal || item.precioDescuento * item.cantidad), 0);
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
      // Los campos timbrado, dsuc, dcaja, facturam, imprimir, imp, unSoloItem
      // ahora son manejados por el backend usando getFacturaActual
      const ventaData: Venta = {
        idConfig: ID_CONFIG,
        idPersonaJur: 1,
        idSucursal: 1,
        idCliente: clienteSeleccionado.idCliente,
        idTipoVenta: tipoVenta,
        ruc: clienteSeleccionado.ruc || '',
        cliente: clienteSeleccionado.nombre,
        totalVenta: calcularTotal(),
        totalDescuento: 0,
        idUsuarioAlta: 1,
        idVendedor: ID_VENDEDOR,
        fecha: new Date().toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        tipoPrecio: TIPO_PRECIO
      };

      //await handleImprimirFactura(32);

      const response = await api.post('/producto/finalizarVenta', ventaData);

      if (response.data.success && response.data.idFacturacion) {
        // Obtener datos de factura e imprimir (incluye comodato si existe)
        await handleImprimirFactura(response.data.idFacturacion, response.data.tieneComodato);

        alert(`Factura generada exitosamente!\nCliente: ${clienteSeleccionado.nombre}\nTotal: ${calcularTotal().toLocaleString()}`);

        // Limpiar todo
        setClienteSeleccionado(null);
        setClienteSearchTerm("");
        setCarrito([]);
        setTipoVenta(1); // Reset a Contado
      } else {
        alert('Error: No se pudo generar la factura correctamente.');
      }

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

                {/* Resultados de búsqueda de clientes - Contenedor con altura fija */}
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

              {/* Resultados de búsqueda de productos - Contenedor con altura fija */}
              {productosEncontrados.length > 0 && (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  mt: 1,
                  height: '250px',
                  minHeight: '250px',
                  maxHeight: '250px',
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
                    Resultados ({productosEncontrados.length}):
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    flexGrow: 1
                  }}>
                    {productosEncontrados.map((producto) => (
                      <Card
                        key={producto.idProducto}
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
                              sx={{
                                backgroundColor: '#28a745',
                                flexShrink: 0,
                                ml: 1
                              }}
                            >
                              Agregar
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
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
                  <Card key={item.idDetTmp} variant="outlined">
                    <CardContent sx={{ padding: '12px !important' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {item.nombreServicio}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleEliminarDelCarrito(item.nro)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                          Precio unitario: {item.precioDescuento}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'column' }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: '40px', textAlign: 'center' }}>
                              Facturacion: {item.cantidad}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: '40px', textAlign: 'center' }}>
                              Comodato: {item.cantidadComodato}
                            </Typography>
                          </Box>

                          <Typography variant="body1" fontWeight="bold" color="primary">
                            {(item.subtotal || item.precioDescuento * item.cantidad).toLocaleString()}
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

      {/* Modal de Agregar Cliente */}
      <AgregarClienteModal
        open={modalAgregarClienteOpen}
        onClose={() => setModalAgregarClienteOpen(false)}
        onGuardar={async (clienteData) => {
          try {
            console.log(clienteData);;

            const response = await api.post('/cliente/crearCliente', {
              idUsuarioAlta: 1,
              cliente: {
                nombre: clienteData.nombre,
                apellido: clienteData.apellido,
                ruc: clienteData.rucCedula,
                dv: clienteData.dv || '',
                direccion: clienteData.direccion || '',
                referencia: clienteData.referencia || '',
                fechaAniversario: clienteData.fechaAniversario || '',
                celular: clienteData.celular || '',
                telefono: clienteData.telefono || '',
                email: clienteData.email || '',
                idGrupoCliente: clienteData.grupo,
                geologalizacion: clienteData.geolocalizacion || ''
              }
            });

            console.log('Cliente creado:', response.data);

            // Si el backend devuelve el cliente creado, lo seleccionamos automáticamente
            if (response.data && response.data.length > 0) {
              const nuevoCliente = response.data[0];
              setClienteSeleccionado({
                idCliente: nuevoCliente.idCliente,
                nombre: `${clienteData.nombre} ${clienteData.apellido}`,
                ruc: clienteData.rucCedula,
                direccion: clienteData.direccion || ''
              });
            }

            alert('Cliente guardado exitosamente!');
            setModalAgregarClienteOpen(false);
          } catch (error) {
            console.error('Error al guardar cliente:', error);
            alert('Error al guardar el cliente. Por favor, intente nuevamente.');
          }
        }}
      />
    </Box>
  );
}

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  AccessTime as TimeIcon,
  GpsFixed as GpsIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocketTracking } from '../../hooks/useSocketTracking';
import { EstadoConexion } from '../../components/Tracking/EstadoConexion';
import axios from 'axios';

// Icono personalizado para la ubicación del usuario
const iconoUsuario = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * Página de tracking personal para choferes
 * Mobile-first: optimizada para dispositivos móviles
 */
export const MiTracking: React.FC = () => {
  const [trackingActivo, setTrackingActivo] = useState(false);
  const [ultimoEnvio, setUltimoEnvio] = useState<Date | null>(null);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const {
    ubicacion,
    error: errorGeo,
    cargando: cargandoGeo,
    permisosDenegados,
    iniciarTracking: iniciarGeo,
    detenerTracking: detenerGeo
  } = useGeolocation();

  const {
    conectado,
    estadoConexion,
    error: errorSocket,
    conectar,
    desconectar,
    enviarUbicacion,
    identificarseComoChofer
  } = useSocketTracking();

  // Conectar al Socket.io al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      conectar(token);
    }

    return () => {
      desconectar();
    };
  }, [conectar, desconectar]);

  // Identificarse como chofer cuando se conecte
  useEffect(() => {
    if (conectado) {
      identificarseComoChofer();
    }
  }, [conectado, identificarseComoChofer]);

  // Enviar ubicación cada 10 segundos cuando tracking está activo
  useEffect(() => {
    if (!trackingActivo || !ubicacion || !conectado) {
      return;
    }

    const intervalo = setInterval(() => {
      enviarUbicacionAlServidor();
    }, 10000); // 10 segundos

    // Enviar inmediatamente la primera vez
    enviarUbicacionAlServidor();

    return () => clearInterval(intervalo);
  }, [trackingActivo, ubicacion, conectado]);

  const enviarUbicacionAlServidor = useCallback(async () => {
    if (!ubicacion) return;

    try {
      // Enviar vía Socket.io
      enviarUbicacion({
        userId: 0, // Se obtiene del token en el backend
        lat: ubicacion.latitude,
        lng: ubicacion.longitude,
        velocidad: ubicacion.velocidad,
        timestamp: new Date()
      });

      // También guardar en BD vía API REST (backup)
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await axios.post(
        `${API_URL}/api/tracking/ubicacion`,
        {
          lat: ubicacion.latitude,
          lng: ubicacion.longitude,
          velocidad: ubicacion.velocidad,
          precision: ubicacion.precision
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUltimoEnvio(new Date());
      setErrorApi(null);
    } catch (error) {
      console.error('Error al enviar ubicación:', error);
      setErrorApi('Error al enviar ubicación al servidor');
    }
  }, [ubicacion, enviarUbicacion]);

  const handleToggleTracking = async () => {
    if (trackingActivo) {
      // Detener tracking
      detenerGeo();
      setTrackingActivo(false);

      // Actualizar estado en el servidor
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        await axios.put(
          `${API_URL}/api/tracking/estado`,
          { activo: false },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } catch (error) {
        console.error('Error al actualizar estado:', error);
      }
    } else {
      // Iniciar tracking
      iniciarGeo();
      setTrackingActivo(true);

      // Actualizar estado en el servidor
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        await axios.put(
          `${API_URL}/api/tracking/estado`,
          { activo: true },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } catch (error) {
        console.error('Error al actualizar estado:', error);
      }
    }
  };

  const formatearVelocidad = (vel?: number): string => {
    if (vel === undefined || vel === null) return 'N/A';
    const kmh = vel * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  };

  const formatearTiempoDesde = (fecha: Date | null): string => {
    if (!fecha) return 'Nunca';
    
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);

    if (diff < 10) return 'Justo ahora';
    if (diff < 60) return `Hace ${diff} segundos`;
    return `Hace ${Math.floor(diff / 60)} minutos`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 3
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 0,
          mb: 2
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
          Mi Tracking
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Control de ubicación en tiempo real
        </Typography>
      </Paper>

      <Box sx={{ px: 2 }}>
        {/* Estado de conexión */}
        <Box sx={{ mb: 2 }}>
          <EstadoConexion
            estado={estadoConexion}
            ultimaActualizacion={ultimoEnvio || undefined}
            onReconectar={() => {
              const token = localStorage.getItem('token');
              if (token) conectar(token);
            }}
          />
        </Box>

        {/* Alertas de error */}
        {errorSocket && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error de conexión: {errorSocket}
          </Alert>
        )}

        {errorGeo && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error de geolocalización: {errorGeo}
          </Alert>
        )}

        {errorApi && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorApi}
          </Alert>
        )}

        {permisosDenegados && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Los permisos de geolocalización fueron denegados. Por favor, habilítalos en la configuración de tu navegador.
          </Alert>
        )}

        {/* Control de tracking */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Control de Tracking
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={trackingActivo}
                    onChange={handleToggleTracking}
                    disabled={cargandoGeo || permisosDenegados}
                    color="success"
                  />
                }
                label={trackingActivo ? 'Activo' : 'Inactivo'}
              />
            </Box>

            <Button
              variant="contained"
              color={trackingActivo ? 'error' : 'success'}
              fullWidth
              size="large"
              onClick={handleToggleTracking}
              disabled={cargandoGeo || permisosDenegados}
              startIcon={trackingActivo ? <GpsIcon /> : <LocationIcon />}
            >
              {trackingActivo ? 'Detener Tracking' : 'Iniciar Tracking'}
            </Button>
          </CardContent>
        </Card>

        {/* Información de ubicación */}
        {ubicacion && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ubicación Actual
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Coordenadas
                    </Typography>
                    <Typography variant="body1">
                      {ubicacion.latitude.toFixed(6)}, {ubicacion.longitude.toFixed(6)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Velocidad
                    </Typography>
                    <Typography variant="body1">
                      {formatearVelocidad(ubicacion.velocidad)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Último envío
                    </Typography>
                    <Typography variant="body1">
                      {formatearTiempoDesde(ultimoEnvio)}
                    </Typography>
                  </Box>
                </Box>

                {ubicacion.precision && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GpsIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Precisión GPS
                      </Typography>
                      <Typography variant="body1">
                        ±{ubicacion.precision.toFixed(0)} metros
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Mapa pequeño */}
        {ubicacion && (
          <Paper sx={{ height: 300, overflow: 'hidden', borderRadius: 2 }}>
            <MapContainer
              center={[ubicacion.latitude, ubicacion.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[ubicacion.latitude, ubicacion.longitude]}
                icon={iconoUsuario}
              />
              {ubicacion.precision && (
                <Circle
                  center={[ubicacion.latitude, ubicacion.longitude]}
                  radius={ubicacion.precision}
                  pathOptions={{
                    color: 'blue',
                    fillColor: 'blue',
                    fillOpacity: 0.1
                  }}
                />
              )}
            </MapContainer>
          </Paper>
        )}

        {/* Estado de carga */}
        {cargandoGeo && !ubicacion && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography variant="body1" color="text.secondary">
              Obteniendo ubicación...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

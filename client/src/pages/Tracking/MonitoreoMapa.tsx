import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import { MapaChoferes } from '../../components/Map/MapaChoferes';
import { ListaUsuarios } from '../../components/Map/ListaUsuarios';
import { EstadoConexion } from '../../components/Tracking/EstadoConexion';
import { useSocketTracking } from '../../hooks/useSocketTracking';

/**
 * Página de monitoreo con mapa en tiempo real
 * Muestra la ubicación de todos los choferes activos
 * Desktop-first: diseñado para pantallas grandes
 */
export const MonitoreoMapa: React.FC = () => {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | undefined>();
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());
  
  const {
    usuarios,
    conectado,
    estadoConexion,
    error,
    conectar,
    desconectar,
    identificarseComoMonitor
  } = useSocketTracking();

  // Conectar al Socket.io al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No hay token de autenticación');
      return;
    }

    conectar(token);

    return () => {
      desconectar();
    };
  }, [conectar, desconectar]);

  // Identificarse como monitor cuando se conecte
  useEffect(() => {
    if (conectado) {
      identificarseComoMonitor();
    }
  }, [conectado, identificarseComoMonitor]);

  // Actualizar timestamp cuando cambian los usuarios
  useEffect(() => {
    if (usuarios.length > 0) {
      setUltimaActualizacion(new Date());
    }
  }, [usuarios]);

  const handleUsuarioClick = (userId: number) => {
    setUsuarioSeleccionado(userId);
  };

  const handleReconectar = () => {
    const token = localStorage.getItem('token');
    if (token) {
      conectar(token);
    }
  };

  const usuariosActivos = usuarios.filter(u => u.activo);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Monitoreo de Choferes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seguimiento en tiempo real
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {usuariosActivos.length} {usuariosActivos.length === 1 ? 'chofer activo' : 'choferes activos'}
          </Typography>
          <EstadoConexion
            estado={estadoConexion}
            ultimaActualizacion={ultimaActualizacion}
            onReconectar={handleReconectar}
          />
        </Box>
      </Paper>

      {/* Contenido principal */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!conectado && estadoConexion === 'conectando' ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography variant="body1" color="text.secondary">
              Conectando al servidor...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Mapa principal - 66% del ancho */}
            <Box sx={{ flex: { xs: '1', md: '2' }, height: { xs: '50%', md: '100%' } }}>
              <MapaChoferes
                usuarios={usuariosActivos}
                usuarioSeleccionado={usuarioSeleccionado}
                onMarkerClick={handleUsuarioClick}
              />
            </Box>

            {/* Panel lateral con lista - 33% del ancho */}
            <Box sx={{ flex: { xs: '1', md: '1' }, height: { xs: '50%', md: '100%' } }}>
              <ListaUsuarios
                usuarios={usuariosActivos}
                onUsuarioClick={handleUsuarioClick}
                usuarioSeleccionado={usuarioSeleccionado}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

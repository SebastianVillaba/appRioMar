import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Chip } from '@mui/material';
import type { ListaUsuariosProps } from '../../types/tracking.types';

/**
 * Panel lateral con lista de usuarios con tracking activo
 * Permite seleccionar un usuario para centrar el mapa en su ubicación
 */
export const ListaUsuarios: React.FC<ListaUsuariosProps> = ({
  usuarios,
  onUsuarioClick,
  usuarioSeleccionado
}) => {
  const formatearFecha = (fecha: Date): string => {
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - new Date(fecha).getTime()) / 1000);

    if (diff < 60) return 'Hace menos de 1 min';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h2">
          Choferes Activos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {usuarios.length} {usuarios.length === 1 ? 'chofer' : 'choferes'} en línea
        </Typography>
      </Box>

      {/* Lista de usuarios */}
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 0
        }}
      >
        {usuarios.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay choferes activos en este momento
            </Typography>
          </Box>
        ) : (
          usuarios.map((usuario) => (
            <ListItem
              key={usuario.id}
              disablePadding
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: usuarioSeleccionado === usuario.id ? 'action.selected' : 'transparent'
              }}
            >
              <ListItemButton
                onClick={() => onUsuarioClick(usuario.id)}
                sx={{ py: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                  {/* Indicador de estado */}
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: usuario.activo ? 'success.main' : 'grey.400',
                      flexShrink: 0
                    }}
                  />

                  {/* Información del usuario */}
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        {usuario.username}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {usuario.ubicacion
                            ? `Lat: ${usuario.ubicacion.latitude.toFixed(4)}, Lng: ${usuario.ubicacion.longitude.toFixed(4)}`
                            : 'Sin ubicación'}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatearFecha(usuario.ultimaActualizacion)}
                        </Typography>
                      </Box>
                    }
                  />

                  {/* Chip de velocidad */}
                  {usuario.ubicacion?.velocidad !== undefined && (
                    <Chip
                      label={`${(usuario.ubicacion.velocidad * 3.6).toFixed(0)} km/h`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

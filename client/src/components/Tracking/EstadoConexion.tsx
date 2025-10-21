import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { EstadoConexionProps } from '../../types/tracking.types';

/**
 * Componente que muestra el estado de conexión Socket.io
 * Incluye indicador visual y tiempo desde última actualización
 */
export const EstadoConexion: React.FC<EstadoConexionProps> = ({
  estado,
  ultimaActualizacion,
  onReconectar
}) => {
  const getEstadoConfig = () => {
    switch (estado) {
      case 'conectado':
        return {
          color: 'success' as const,
          label: 'Conectado',
          bgColor: '#4caf50'
        };
      case 'desconectado':
        return {
          color: 'error' as const,
          label: 'Desconectado',
          bgColor: '#f44336'
        };
      case 'conectando':
        return {
          color: 'warning' as const,
          label: 'Conectando...',
          bgColor: '#ff9800'
        };
      case 'error':
        return {
          color: 'error' as const,
          label: 'Error de conexión',
          bgColor: '#f44336'
        };
      default:
        return {
          color: 'default' as const,
          label: 'Desconocido',
          bgColor: '#9e9e9e'
        };
    }
  };

  const formatearTiempoDesde = (fecha?: Date): string => {
    if (!fecha) return '';
    
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - new Date(fecha).getTime()) / 1000);

    if (diff < 10) return 'Justo ahora';
    if (diff < 60) return `Hace ${diff} segundos`;
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    return `Hace ${Math.floor(diff / 3600)} horas`;
  };

  const config = getEstadoConfig();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}
    >
      {/* Indicador de estado */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: config.bgColor,
            animation: estado === 'conectando' ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1
              },
              '50%': {
                opacity: 0.5
              }
            }
          }}
        />
        <Chip
          label={config.label}
          color={config.color}
          size="small"
          variant="outlined"
        />
      </Box>

      {/* Última actualización */}
      {ultimaActualizacion && estado === 'conectado' && (
        <Typography variant="caption" color="text.secondary">
          {formatearTiempoDesde(ultimaActualizacion)}
        </Typography>
      )}

      {/* Botón de reconexión */}
      {(estado === 'desconectado' || estado === 'error') && onReconectar && (
        <Tooltip title="Reintentar conexión">
          <IconButton
            size="small"
            onClick={onReconectar}
            color="primary"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

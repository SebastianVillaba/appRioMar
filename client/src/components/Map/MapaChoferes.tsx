import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Box } from '@mui/material';
import { MarkerUsuario } from './MarkerUsuario';
import type { UsuarioTracking } from '../../types/tracking.types';
import 'leaflet/dist/leaflet.css';

interface MapaChoferesProps {
  usuarios: UsuarioTracking[];
  centroInicial?: [number, number];
  zoomInicial?: number;
  usuarioSeleccionado?: number;
  onMarkerClick?: (userId: number) => void;
}

/**
 * Componente auxiliar para centrar el mapa en una ubicación específica
 */
const CentrarMapa: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

/**
 * Componente principal del mapa con Leaflet
 * Muestra la ubicación de todos los choferes activos
 */
export const MapaChoferes: React.FC<MapaChoferesProps> = ({
  usuarios,
  centroInicial = [-25.2637, -57.5759], // Asunción, Paraguay
  zoomInicial = 13,
  usuarioSeleccionado,
  onMarkerClick
}) => {
  const mapRef = useRef<any>(null);

  // Obtener centro del mapa basado en usuario seleccionado
  const getCentroMapa = (): [number, number] => {
    if (usuarioSeleccionado) {
      const usuario = usuarios.find(u => u.id === usuarioSeleccionado);
      if (usuario?.ubicacion) {
        return [usuario.ubicacion.latitude, usuario.ubicacion.longitude];
      }
    }
    return centroInicial;
  };

  const centro = getCentroMapa();

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={centroInicial}
        zoom={zoomInicial}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        {/* Capa de mapa base - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Centrar mapa cuando cambia el usuario seleccionado */}
        {usuarioSeleccionado && <CentrarMapa center={centro} zoom={15} />}

        {/* Marcadores de usuarios */}
        {usuarios
          .filter(usuario => usuario.ubicacion !== null)
          .map(usuario => (
            <MarkerUsuario
              key={usuario.id}
              userId={usuario.id}
              username={usuario.username}
              lat={usuario.ubicacion!.latitude}
              lng={usuario.ubicacion!.longitude}
              velocidad={usuario.ubicacion!.velocidad}
              ultimaActualizacion={usuario.ultimaActualizacion}
              onClick={() => onMarkerClick && onMarkerClick(usuario.id)}
            />
          ))}
      </MapContainer>
    </Box>
  );
};

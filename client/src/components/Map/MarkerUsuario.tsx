import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MarkerUsuarioProps } from '../../types/tracking.types';

// Icono personalizado para el marcador (camión/chofer)
const iconoChofer = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * Componente de marcador individual en el mapa
 * Muestra la ubicación de un usuario/chofer con información en popup
 */
export const MarkerUsuario: React.FC<MarkerUsuarioProps> = ({
  userId,
  username,
  lat,
  lng,
  velocidad,
  ultimaActualizacion,
  onClick
}) => {
  const formatearFecha = (fecha: Date): string => {
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - new Date(fecha).getTime()) / 1000);

    if (diff < 60) return 'Hace menos de 1 minuto';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  };

  const formatearVelocidad = (vel?: number): string => {
    if (vel === undefined || vel === null) return 'N/A';
    // Convertir m/s a km/h
    const kmh = vel * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  };

  return (
    <Marker
      position={[lat, lng]}
      icon={iconoChofer}
      eventHandlers={{
        click: () => onClick && onClick()
      }}
    >
      <Popup>
        <div style={{ minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
            {username}
          </h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>ID:</strong> {userId}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Ubicación:</strong><br />
              Lat: {lat.toFixed(6)}<br />
              Lng: {lng.toFixed(6)}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Velocidad:</strong> {formatearVelocidad(velocidad)}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Última actualización:</strong><br />
              {formatearFecha(ultimaActualizacion)}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

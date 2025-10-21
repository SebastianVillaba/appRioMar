# Sistema de Tracking en Tiempo Real - appRioMar

Sistema de geolocalización y monitoreo en tiempo real para choferes, implementado con Socket.io, Leaflet y React.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Base de Datos](#base-de-datos)
- [Uso](#uso)
- [Eventos Socket.io](#eventos-socketio)
- [API REST](#api-rest)
- [Troubleshooting](#troubleshooting)

## ✨ Características

- **Tracking en tiempo real** con Socket.io
- **Mapa interactivo** con Leaflet (OpenStreetMap)
- **Geolocalización GPS** del dispositivo
- **Vista de monitoreo** para supervisores (desktop-first)
- **Vista móvil** para choferes (mobile-first)
- **Historial de rutas** almacenado en SQL Server
- **Autenticación JWT** integrada
- **Reconexión automática** en caso de pérdida de conexión
- **Máximo 10 choferes** activos simultáneamente

## 🛠 Stack Tecnológico

### Backend
- Node.js + Express + TypeScript
- Socket.io v4.7.5
- SQL Server (mssql)
- JWT para autenticación

### Frontend
- React 19 + Vite
- Socket.io-client v4.7.5
- Leaflet v1.9.4 + React-Leaflet v4.2.1
- Material-UI v7
- TypeScript

## 📁 Estructura del Proyecto

```
appRioMar/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── tracking.controller.ts      # Controlador de tracking
│   │   ├── routes/
│   │   │   └── tracking.routes.ts          # Rutas de tracking
│   │   ├── services/
│   │   │   └── socketService.ts            # Servicio Socket.io
│   │   ├── types/
│   │   │   └── tracking.types.ts           # Tipos TypeScript
│   │   ├── database/
│   │   │   └── tracking.sql                # Scripts SQL
│   │   └── index.ts                        # Servidor con Socket.io
│   └── .env.example
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Map/
    │   │   │   ├── MapaChoferes.tsx        # Componente mapa principal
    │   │   │   ├── MarkerUsuario.tsx       # Marcador individual
    │   │   │   └── ListaUsuarios.tsx       # Panel lateral usuarios
    │   │   └── Tracking/
    │   │       └── EstadoConexion.tsx      # Indicador de conexión
    │   ├── pages/
    │   │   └── Tracking/
    │   │       ├── MonitoreoMapa.tsx       # Vista de monitoreo
    │   │       └── MiTracking.tsx          # Vista móvil chofer
    │   ├── hooks/
    │   │   ├── useGeolocation.ts           # Hook geolocalización
    │   │   └── useSocketTracking.ts        # Hook Socket.io
    │   ├── services/
    │   │   └── socketService.ts            # Cliente Socket.io
    │   └── types/
    │       └── tracking.types.ts           # Tipos TypeScript
    └── .env.example
```

## 🚀 Instalación

### 1. Backend

```bash
cd server
npm install
```

**Dependencias agregadas:**
- `socket.io@^4.7.5`

### 2. Frontend

```bash
cd client
npm install
```

**Dependencias agregadas:**
- `socket.io-client@^4.7.5`
- `leaflet@^1.9.4`
- `react-leaflet@^4.2.1`
- `@types/leaflet@^1.9.8`
- `@mui/icons-material@^7.3.4`

## ⚙️ Configuración

### Backend (.env)

Copia `.env.example` a `.env` y configura:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos
DB_SERVER=localhost
DB_NAME=riomar_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=1h

# Socket.io
CLIENT_URL=http://localhost:5173

# Tracking
TRACKING_INTERVAL=10000
MAX_USUARIOS_TRACKING=10
```

### Frontend (.env)

Copia `.env.example` a `.env`:

```env
# API Backend
VITE_API_URL=http://localhost:5000

# Socket.io
VITE_SOCKET_URL=http://localhost:5000

# Tracking
VITE_TRACKING_INTERVAL=10000
```

## 🗄️ Base de Datos

### Ejecutar Scripts SQL

1. Conecta a tu SQL Server
2. Ejecuta el script: `server/src/database/tracking.sql`

Este script crea:

**Tablas:**
- `ubicaciones_historial` - Historial de todas las ubicaciones
- `usuarios_tracking_estado` - Estado actual de tracking de cada usuario

**Stored Procedures:**
- `sp_guardar_ubicacion` - Guardar nueva ubicación
- `sp_obtener_usuarios_activos` - Obtener usuarios con tracking activo
- `sp_obtener_historial_usuario` - Obtener historial de un usuario
- `sp_actualizar_estado_tracking` - Activar/desactivar tracking

## 🎯 Uso

### Levantar el Proyecto

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Rutas Disponibles

**Frontend:**
- `/tracking/mapa` - Vista de monitoreo (desktop)
- `/tracking/mi-ubicacion` - Vista de tracking personal (móvil)

**Backend API:**
- `POST /api/tracking/ubicacion` - Guardar ubicación
- `GET /api/tracking/activos` - Obtener usuarios activos
- `GET /api/tracking/historial/:userId` - Historial de usuario
- `PUT /api/tracking/estado` - Cambiar estado tracking

### Flujo de Uso

#### Como Chofer (Móvil):

1. Inicia sesión en la aplicación
2. Ve a `/tracking/mi-ubicacion`
3. Activa el tracking con el botón "Iniciar Tracking"
4. Permite los permisos de geolocalización
5. La ubicación se envía automáticamente cada 10 segundos
6. Puedes ver tu ubicación actual en el mapa pequeño

#### Como Monitor (Desktop):

1. Inicia sesión en la aplicación
2. Ve a `/tracking/mapa`
3. Verás el mapa con todos los choferes activos
4. Haz clic en un marcador para ver detalles
5. Haz clic en un chofer en la lista lateral para centrar el mapa

## 🔌 Eventos Socket.io

### Cliente → Servidor

| Evento | Descripción | Datos |
|--------|-------------|-------|
| `chofer:conectado` | Chofer se identifica | - |
| `monitor:conectado` | Monitor se identifica | - |
| `chofer:ubicacion` | Chofer envía ubicación | `{ lat, lng, velocidad, timestamp }` |

### Servidor → Cliente

| Evento | Descripción | Datos |
|--------|-------------|-------|
| `ubicacion:actualizada` | Nueva ubicación de chofer | `{ userId, username, lat, lng, velocidad, timestamp }` |
| `chofer:nuevo` | Nuevo chofer conectado | `{ userId, username, conectadoEn }` |
| `chofer:desconectado` | Chofer desconectado | `{ userId, username, desconectadoEn }` |
| `monitores:choferes-activos` | Lista de choferes activos | `Array<{ userId, username, conectadoEn }>` |
| `chofer:activado` | Chofer activó tracking | `{ userId, username, activo, timestamp }` |
| `chofer:desactivado` | Chofer desactivó tracking | `{ userId, username, activo, timestamp }` |

### Autenticación Socket.io

El servidor valida el token JWT en cada conexión:

```typescript
socket.handshake.auth.token // Token JWT requerido
```

## 📡 API REST

### POST /api/tracking/ubicacion

Guarda una nueva ubicación del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "lat": -25.2637,
  "lng": -57.5759,
  "velocidad": 15.5,
  "precision": 10.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ubicación guardada exitosamente",
  "data": {
    "id": 123,
    "userId": 1,
    "latitude": -25.2637,
    "longitude": -57.5759,
    "velocidad": 15.5,
    "timestamp": "2025-10-21T10:00:00Z"
  }
}
```

### GET /api/tracking/activos

Obtiene usuarios con tracking activo.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Usuarios activos obtenidos exitosamente",
  "data": [
    {
      "userId": 1,
      "username": "chofer1",
      "ultimaUbicacion": {
        "latitude": -25.2637,
        "longitude": -57.5759,
        "velocidad": 15.5,
        "timestamp": "2025-10-21T10:00:00Z"
      },
      "activo": true
    }
  ]
}
```

### GET /api/tracking/historial/:userId

Obtiene historial de ubicaciones de un usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
- `fechaInicio` (opcional): Fecha inicio en ISO 8601
- `fechaFin` (opcional): Fecha fin en ISO 8601
- `limite` (opcional): Número máximo de registros (default: 100)

**Response:**
```json
{
  "success": true,
  "message": "Historial obtenido exitosamente",
  "data": [
    {
      "id": 123,
      "userId": 1,
      "latitude": -25.2637,
      "longitude": -57.5759,
      "velocidad": 15.5,
      "precision": 10.0,
      "timestamp": "2025-10-21T10:00:00Z"
    }
  ]
}
```

### PUT /api/tracking/estado

Activa o desactiva el tracking del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "activo": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tracking activado exitosamente",
  "data": {
    "userId": 1,
    "activo": true,
    "ultimaActualizacion": "2025-10-21T10:00:00Z"
  }
}
```

## 🐛 Troubleshooting

### Problema: Socket.io no conecta

**Solución:**
1. Verifica que el backend esté corriendo en el puerto correcto
2. Revisa las variables de entorno `CLIENT_URL` (backend) y `VITE_SOCKET_URL` (frontend)
3. Verifica que el token JWT sea válido
4. Revisa la consola del navegador para errores

### Problema: Geolocalización no funciona

**Solución:**
1. Verifica que el navegador soporte geolocalización
2. Asegúrate de que el usuario haya dado permisos
3. En producción, requiere HTTPS (excepto localhost)
4. Revisa la consola para errores de permisos

### Problema: Mapa no se muestra

**Solución:**
1. Verifica que el CSS de Leaflet esté cargado en `index.html`
2. Asegúrate de que las dependencias estén instaladas
3. Revisa que el contenedor del mapa tenga altura definida
4. Verifica la conexión a internet (tiles de OpenStreetMap)

### Problema: No se ven los marcadores

**Solución:**
1. Verifica que los usuarios tengan ubicaciones válidas
2. Revisa que el filtro `usuarios.filter(u => u.ubicacion !== null)` funcione
3. Verifica que las coordenadas estén en el rango correcto (lat: -90 a 90, lng: -180 a 180)
4. Revisa la consola para errores de Leaflet

### Problema: Ubicación no se envía

**Solución:**
1. Verifica que el tracking esté activo
2. Revisa que Socket.io esté conectado
3. Verifica que el intervalo de envío esté configurado correctamente
4. Revisa la consola del navegador y del servidor para errores

### Problema: Error "Cannot find module 'socket.io'"

**Solución:**
```bash
cd server
npm install
```

### Problema: Error "Cannot find module 'leaflet'"

**Solución:**
```bash
cd client
npm install
```

## 📝 Notas Importantes

1. **Sin sistema de roles por ahora**: Todos los usuarios autenticados tienen acceso. El sistema de roles se implementará en el futuro.

2. **No usar localStorage para datos sensibles**: El proyecto ya tiene esta restricción. Usar React state para manejo de estado.

3. **Límite de usuarios**: Máximo 10 choferes activos simultáneamente (configurable en `.env`).

4. **Intervalo de tracking**: Por defecto 10 segundos. Ajustable en `.env`.

5. **Precisión GPS**: Depende del dispositivo y las condiciones. Se muestra en la interfaz.

6. **Reconexión automática**: Socket.io reintenta conectar automáticamente hasta 5 veces.

7. **Backup en BD**: Además de Socket.io, las ubicaciones se guardan en la base de datos vía API REST.

## 🔐 Seguridad

- Todas las rutas están protegidas con JWT
- Socket.io valida el token en cada conexión
- No se exponen datos sensibles en el cliente
- CORS configurado para el dominio del cliente
- Validación de coordenadas en el backend

## 🚀 Próximas Mejoras

- [ ] Sistema de roles (admin/chofer)
- [ ] Historial de rutas con líneas en el mapa
- [ ] Notificaciones push
- [ ] Exportar historial a CSV/PDF
- [ ] Geofencing (alertas por zonas)
- [ ] Estadísticas de velocidad y distancia
- [ ] Modo offline con sincronización

## 📄 Licencia

Este proyecto es parte de appRioMar.

---

**Desarrollado con ❤️ para appRioMar**

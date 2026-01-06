import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layout/AuthLayout';
import MainLayout from './layout/MainLayout';
import LoginPage from './pages/Login/LoginPage';
import HomePage from './pages/Home/HomePage';
import PedidoCliente from './pages/PedidoCliente/PedidoCliente';
import ProtectedRoute from './components/ProtectedRoute';
import { MonitoreoMapa } from './pages/Tracking/MonitoreoMapa';
import { MiTracking } from './pages/Tracking/MiTracking';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas con AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Rutas protegidas con MainLayout */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking/mapa"
            element={
              <ProtectedRoute>
                <MonitoreoMapa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking/mi-ubicacion"
            element={
              <ProtectedRoute>
                <MiTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedido-cliente"
            element={
              <ProtectedRoute>
                <PedidoCliente />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Ruta por defecto - redirigir a login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

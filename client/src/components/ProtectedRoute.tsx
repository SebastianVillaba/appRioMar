import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/login" replace />;
  }

  // Si hay token, mostrar el contenido protegido
  return <>{children}</>;
}

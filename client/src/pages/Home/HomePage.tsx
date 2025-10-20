import { Box, Button, Container, Typography, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={700}>
            ¡Bienvenido, {user.username || 'Usuario'}!
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            Has iniciado sesión correctamente. Esta es una ruta protegida.
          </Typography>

          <Box>
            <Typography variant="h6" gutterBottom>
              Información del usuario:
            </Typography>
            <Typography variant="body2">
              <strong>ID:</strong> {user.id}
            </Typography>
            <Typography variant="body2">
              <strong>Usuario:</strong> {user.username}
            </Typography>
          </Box>

          <Box>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}

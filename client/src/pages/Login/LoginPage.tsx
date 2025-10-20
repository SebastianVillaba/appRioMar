import React, { useState } from 'react';
import { Box, Button, Stack, TextField, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({
        username: usuario,
        password: password
      });
      
      console.log('Login response:', response);
      
      if (response.success === true) {
        // Guardar token si existe
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        // Guardar información del usuario
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Redirigir al home
        navigate('/');
      } else {
        setError(response.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error during login:', error);
      
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error al iniciar sesión');
      } else {
        setError('Error inesperado al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
        Iniciar sesión
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="Usuario"
          type="text"
          value={usuario}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsuario(e.target.value)}
          autoComplete="username"
          required
          fullWidth
          inputProps={{ maxLength: 10 }}
          disabled={loading}
        />

        <TextField 
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          fullWidth
          inputProps={{ maxLength: 10 }}
          disabled={loading}
        />

        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </Stack>
    </Box>
  );
}



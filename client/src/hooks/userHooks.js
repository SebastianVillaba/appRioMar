import { useSelector } from 'react-redux';
import { selectIdCobrador, selectNombreCobrador, selectIdUsuario } from './userSlice';

export const useIdCobrador = () => {
  const idCobrador = useSelector(selectIdCobrador);
  return idCobrador;
};

export const useNombreCobrador = () => {
  const nombreCobrador = useSelector(selectNombreCobrador);
  return nombreCobrador;
};

export const useIdUsuario = () => {
  const idUsuario = useSelector(selectIdUsuario);
  return idUsuario;
};

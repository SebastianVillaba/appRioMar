import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  idVendedor: null,
  nombreVendedor: null,
  idUsuario: null,
  token: null,
  status: 'idle',
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIdVendedor: (state, action) => {
      state.idVendedor = action.payload;
    },
    setIdUsuario: (state, action) => {
      state.idUsuario = action.payload;
    },
    setUserData: (state, action) => {
      state.idVendedor = action.payload.idVendedor;
      state.nombreVendedor = action.payload.nombreVendedor;
      state.idUsuario = action.payload.idUsuario;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.idVendedor = null;
      state.nombreVendedor = null;
      state.idUsuario = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { setIdVendedor, setIdUsuario, setUserData, clearUser } = userSlice.actions;

export const selectIdVendedor = (state) => state.user.idVendedor;
export const selectNombreVendedor = (state) => state.user.nombreVendedor;
export const selectIdUsuario = (state) => state.user.idUsuario;

export default userSlice.reducer;

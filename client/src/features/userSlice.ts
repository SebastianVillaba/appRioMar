import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Interface para el estado del usuario
export interface UserState {
    idUsuario: number | null;
    idVendedor: number | null;
    nombreVendedor: string | null;
    idSucursal: number | null;
    idPersonaJur: number | null;
    dsuc: string | null;
    dcaja: string | null;
    factura: string | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Interface para los datos del login
export interface UserLoginData {
    idUsuario: number;
    idVendedor: number;
    nombreVendedor: string;
    idSucursal: number;
    idPersonaJur: number;
    dsuc: string;
    dcaja: string;
    factura: string;
    token: string;
}

const initialState: UserState = {
    idUsuario: null,
    idVendedor: null,
    nombreVendedor: null,
    idSucursal: null,
    idPersonaJur: null,
    dsuc: null,
    dcaja: null,
    factura: null,
    token: null,
    status: 'idle',
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<UserLoginData>) => {
            state.idUsuario = action.payload.idUsuario;
            state.idVendedor = action.payload.idVendedor;
            state.nombreVendedor = action.payload.nombreVendedor;
            state.idSucursal = action.payload.idSucursal;
            state.idPersonaJur = action.payload.idPersonaJur;
            state.dsuc = action.payload.dsuc;
            state.dcaja = action.payload.dcaja;
            state.factura = action.payload.factura;
            state.token = action.payload.token;
            state.status = 'succeeded';
        },
        clearUser: (state) => {
            state.idUsuario = null;
            state.idVendedor = null;
            state.nombreVendedor = null;
            state.idSucursal = null;
            state.idPersonaJur = null;
            state.dsuc = null;
            state.dcaja = null;
            state.factura = null;
            state.token = null;
            state.status = 'idle';
            state.error = null;
        },
        setLoading: (state) => {
            state.status = 'loading';
        },
        setError: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        }
    },
});

export const { setUserData, clearUser, setLoading, setError } = userSlice.actions;

// Selectores
export const selectUser = (state: { user: UserState }) => state.user;
export const selectIdUsuario = (state: { user: UserState }) => state.user.idUsuario;
export const selectIdVendedor = (state: { user: UserState }) => state.user.idVendedor;
export const selectNombreVendedor = (state: { user: UserState }) => state.user.nombreVendedor;
export const selectIdSucursal = (state: { user: UserState }) => state.user.idSucursal;
export const selectIdPersonaJur = (state: { user: UserState }) => state.user.idPersonaJur;
export const selectDsuc = (state: { user: UserState }) => state.user.dsuc;
export const selectDcaja = (state: { user: UserState }) => state.user.dcaja;
export const selectFactura = (state: { user: UserState }) => state.user.factura;
export const selectToken = (state: { user: UserState }) => state.user.token;
export const selectUserStatus = (state: { user: UserState }) => state.user.status;
export const selectIsAuthenticated = (state: { user: UserState }) => !!state.user.token;

export default userSlice.reducer;

import { Box, Button, Checkbox, FormControlLabel, Modal, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";

interface CantidadModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (cantidad: number, cantidadAcomodato: number) => void;
    productoNombre: string;
}

const CantidadModal = ({ open, onClose, onConfirm, productoNombre }: CantidadModalProps) => {
    const [cantidad, setCantidad] = useState<number>(1);
    const [cantidadAcomodato, setCantidadAcomodato] = useState<number>(0);
    const [regalo, setRegalo] = useState<boolean>(false);

    const handleAgregar = () => {
        if (cantidad > 0) {
            onConfirm(cantidad, cantidadAcomodato);
            // Reset values
            setCantidad(1);
            setCantidadAcomodato(0);
            onClose();
        }
    };

    const handleCancel = () => {
        // Reset values
        setCantidad(1);
        setCantidadAcomodato(0);
        onClose();
    };


    return (
        <Modal
            open={open}
            onClose={handleCancel}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Paper
                sx={{
                    padding: 3,
                    minWidth: '300px',
                    maxWidth: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <Typography variant="h6" fontWeight="bold" textAlign="center">
                    Ingrese las cantidades
                </Typography>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                    {productoNombre}
                </Typography>

                <TextField
                    type="number"
                    label="Cantidad"
                    variant="outlined"
                    fullWidth
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
                    inputProps={{ min: 1 }}
                />

                <TextField
                    type="number"
                    label="Cantidad Acomodato"
                    variant="outlined"
                    fullWidth
                    value={cantidadAcomodato}
                    onChange={(e) => setCantidadAcomodato(Math.max(0, Number(e.target.value)))}
                    inputProps={{ min: 0 }}
                />

                <FormControlLabel
                    label="Añadir como regalo"
                    control={
                        <Checkbox
                            checked={regalo}
                            onChange={(e) => setRegalo(e.target.checked)}
                        />
                    }
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleAgregar}
                        sx={{ backgroundColor: '#28a745' }}
                    >
                        Agregar
                    </Button>
                </Box>
            </Paper>
        </Modal>
    );
};

export default CantidadModal;
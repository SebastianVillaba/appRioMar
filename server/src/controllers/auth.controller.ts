import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { executeRequest } from "../utils/dbHandler";

interface Usuario {
  id: number;
  username: string;
  password: string;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Nombre de usuario y contraseña son obligatorios!" });
    return;
  }

  try {
    // const result = await executeRequest({
    //   query: `SELECT * FROM usuarios WHERE username = '${username}'`
    // });

    // if (result.recordset.length === 0) {
    //   res.status(401).json({ message: "Usuario no encontrado" });
    //   return;
    // }

    const user = {
      id: 1,
      username: "sebas",
    };

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "mi_secreto_temporal",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
      success: true
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "mi_secreto_temporal"
    ) as { id: number; username: string; };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token inválido o expirado" });
  }
};
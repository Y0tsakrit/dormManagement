import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserById } from "../model/userModel";
import dotenv from "dotenv";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        rooms?: string;
        isAdmin: boolean;
      };
    }
  }
}

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "defaultsecret";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) : Promise<void> => {
  return new Promise((resolve, reject) => {
    let token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      token = req.cookies?.token; 
    }
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const dbUser = await getUserById((decoded as any).id);
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = {
        id: dbUser.id,
        rooms: (decoded as any).rooms,
        isAdmin: dbUser.isAdmin
      };
      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
});
};

export const AdminOnly = (req: Request, res: Response, next: NextFunction) :Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  });
};
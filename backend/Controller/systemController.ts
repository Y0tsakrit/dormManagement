import { Request, Response } from "express";
import {createUser, getUserByEmail} from "../model/userModel";
import {getRoomByUser} from "../model/roomModel";
import { signedCookie } from "cookie-parser";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
const jwtSecret = process.env.JWT_SECRET || "defaultsecret";

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: "User is not active" });
      return;
    }

    const rooms = await getRoomByUser(user.id);
    const token = jwt.sign({ id: user.id , rooms: rooms.map(room => room.id) , isAdmin: user.isAdmin }, jwtSecret, { expiresIn: '1h' });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000 
    });
    res.status(200).json({ token});
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }   

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser({ ...req.body, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully"});
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

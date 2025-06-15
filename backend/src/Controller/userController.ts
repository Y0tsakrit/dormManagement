import { Request, Response } from "express";
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from "../model/userModel";
import { createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom } from "../model/roomModel";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");

export const createNewUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const newUser = await createUser({
        ...userData,
    });
    res.status(201).json("User created successfully");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserAll = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserData = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }
    const updatedUser = await updateUser(userId, userData);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserData = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const deletedUser = await deleteUser(userId);
    res.status(200).json(deletedUser);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import { Request, Response } from "express";
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from "../model/userModel";
import { createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom } from "../model/roomModel";

export const getRoom = async (req: Request, res: Response):Promise<void> => {
  try {
    const roomId = req.params.id;
    const room = await getRoomById(roomId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await getAllRooms();
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createNewRoom = async (req: Request, res: Response) => {
  try {
    const roomData = req.body;
    const newRoom = await createRoom(roomData);
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateExistingRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const roomData = req.body;
    const updatedRoom = await updateRoom(roomId, roomData);
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const assignUserToRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = req.params.id;
    const userId = req.body.userId;
    const room = await getRoomById(roomId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    if ((room.users ?? [] as string[]).includes(userId)) {
      res.status(400).json({ message: "User already assigned to this room" });
      return;
    }
    const updatedRoom = await updateRoom(roomId, { users: userId , occupied: true });
    if (!updatedRoom) {
      res.status(404).json({ message: "Room not found or update failed" });
      return;
    }
    const updatedUser = await updateUser(userId, { roomId });
    if (!updatedUser) {
      res.status(404).json({ message: "User not found or update failed" });
      return;
    }
    res.status(200).json({ "message": "User assigned to room successfully"});
  } catch (error) {
    console.error("Error assigning user to room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unassignUserFromRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = req.params.id;
    const userId = req.body.userId;
    const room = await getRoomById(roomId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    if (!(room.users ?? [] as string[]).includes(userId)) {
      res.status(400).json({ message: "User not assigned to this room" });
      return;
    }
    const updatedRoom = await updateRoom(roomId, { users: null, occupied: false });
    if (!updatedRoom) {
      res.status(404).json({ message: "Room not found or update failed" });
      return;
    }
    const updatedUser = await updateUser(userId, { roomId: null });
    if (!updatedUser) {
      res.status(404).json({ message: "User not found or update failed" });
      return;
    }
    res.status(200).json({ "message": "User unassigned from room successfully" });
  } catch (error) {
    console.error("Error unassigning user from room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteExistingRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    await deleteRoom(roomId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

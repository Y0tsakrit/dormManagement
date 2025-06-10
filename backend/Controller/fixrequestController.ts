import { Request, Response } from "express";
import { createFixRequest, getAllFixRequests, getFixRequestById, updateFixRequest, deleteFixRequest } from "../model/fixrequestModel";
import { updateExistingRoom } from "./roomController";
import { getRoomById } from "../model/roomModel";

export async function handleCreateFixRequest(req: Request, res: Response): Promise<void> {
  const roomId = req.body.roomId;
  const room = await getRoomById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  const fixRequest = await createFixRequest(req.body);
    const updatedRoom = await updateExistingRoom(roomId, {
    fixRequests: [...(room.fixRequests || []), fixRequest.id],
    } as any);
  res.json("Fix request created successfully");
}

export async function handleGetAllFixRequests(req: Request, res: Response) {
  const fixRequests = await getAllFixRequests();
  res.json(fixRequests);
}

export async function handleGetFixRequestById(req: Request, res: Response) {
  const fixRequest = await getFixRequestById(req.params.id);
  res.json(fixRequest);
}

export async function handleUpdateFixRequest(req: Request, res: Response) {
  const fixRequest = await updateFixRequest(req.params.id, req.body);
  res.json(fixRequest);
}

export async function handleDeleteFixRequest(req: Request, res: Response): Promise<void> {
  const fixRequest = await deleteFixRequest(req.params.id);
  const roomId = req.body.roomId;
  if (!fixRequest) {
    res.status(404).json({ error: "Fix request not found" });
    return;
  }
  if (!roomId) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  const room = await getRoomById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  const updatedRoom = await updateExistingRoom(roomId, {
    fixRequests: room.fixRequests.filter((id: string) => id !== fixRequest.id),
  } as any);
  res.json("Fix request deleted successfully");
}
import { Request, Response } from "express";
import {updateUser } from "../model/userModel";
import { createBooking, getAllBookings, getBookingById, updateBooking, deleteBooking } from "../model/bookingModel";

export const createNewBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingData = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const newBooking = await createBooking({ ...bookingData, userId });
    const user = await updateUser(userId, {
      bookings: { push: newBooking.id , isBooking: true }
    });
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookingId = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const booking = await getBookingById(bookingId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateExistingBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const bookingData = req.body;
    const updatedBooking = await updateBooking(bookingId, bookingData);
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const deletedBooking = await deleteBooking(bookingId);
    const user = await updateUser(userId, {
      bookings: { pull: deletedBooking.id, isBooking: false }
    });
    if (!deletedBooking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


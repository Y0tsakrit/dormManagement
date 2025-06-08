import { Request, Response } from "express";
import { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } from "../model/paymentModel";
import { updateUser, getUserById } from "../model/userModel";

export const createNewPayment = async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    const newPayment = await createPayment(paymentData);
    const userId = paymentData.userId;
    

    await Promise.all(userId.map(async (id: string) => {
      try {
        const user = await getUserById(id);
        if (!user) {
          console.error(`User with ID ${id} not found`);
          return;
        }
        const updatedUser = await updateUser(id, { 
          bill: {
            push: newPayment.id  
          }
        });
        
        if (!updatedUser) {
          console.error(`Failed to update user with ID ${id}`);
        }
      } catch (error) {
        console.error(`Error updating user ${id}:`, error);
      }
    }));
    
    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPaymentId = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await getAllPayments();
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateExistingPayment = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const paymentData = req.body;
    const updatedPayment = await updatePayment(paymentId, paymentData);
    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteExistingPayment = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    
    const userId = payment.userId;
    await Promise.all(userId.map(async (id: string) => {
      const user = await getUserById(id);
      if (!user) {
        console.error(`User with ID ${id} not found`);
        return;
      }
      const updatedUser = await updateUser(id, { 
        bill: user.bill.filter((billId: string) => billId !== paymentId) 
      });
    }));
    await deletePayment(paymentId);
    res.status(204).send("Payment deleted successfully");
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
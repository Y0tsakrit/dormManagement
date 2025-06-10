import { Request, Response } from "express";
import { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } from "../model/paymentModel";
import { updateUser, getUserById } from "../model/userModel";

export const createNewPayment = async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    const newPayment = await createPayment(paymentData);
    const userId = paymentData.userId;
    

    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updatedUser = await updateUser(userId, { 
      bill: [...user.bill, newPayment.id] 
    });
    
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
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const updatedUser = await updateUser(userId, { 
        bill: user.bill.filter((billId: string) => billId !== paymentId) 
      });
    await deletePayment(paymentId);
    res.status(204).send("Payment deleted successfully");
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkdue = async (req: Request, res: Response) => {
  try{
    const payments = await getAllPayments();
    const currentDate = new Date();
    const duePayments = payments.filter(payment => {
      const due = payment.status == "pending" ;
      return due;
    });

    
    if (duePayments.length === 0) {
      res.status(200).json({ message: "No due payments found" });
      return;
    }

    duePayments.forEach(payment => {
      const dueDate = new Date(payment.dueDate);
      if (dueDate < currentDate) {
        payment.status = "overdue";
        updatePayment(payment.id, { status: "overdue" });
      }
    });
    res.status(200).json({
      message: "Due payments checked successfully",});
  } catch (error) {
    console.error("Error checking due payments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

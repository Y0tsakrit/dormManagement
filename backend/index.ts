import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { loginUser, logoutUser,registerUser } from './Controller/systemController';
import { getUserId, getUserAll, updateUserData,deleteUserData } from './Controller/userController';
import {createNewPayment,getPaymentId,getPayments,updateExistingPayment,deleteExistingPayment,checkdue } from './Controller/paymentController';
import {createNewBooking, getBookingId, getBookings, updateExistingBooking, deleteBookingById} from './Controller/bookingController';
import { createNewRoom, getRoom, getRooms, updateExistingRoom, assignUserToRoom,unassignUserFromRoom } from './Controller/roomController';
import { handleCreateFixRequest,handleDeleteFixRequest,handleGetAllFixRequests,handleGetFixRequestById,handleUpdateFixRequest } from './Controller/fixrequestController';
import { authenticateToken, AdminOnly } from './middleware/auth';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;


const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
});


const modifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 30, 
  message: {
    error: 'Too many modification requests, please try again later.',
    retryAfter: '10 minutes'
  },
});


app.use(generalLimiter);

app.post('/register', authLimiter, registerUser);
app.post('/login', authLimiter, loginUser);
app.post('/logout', logoutUser);

//user
app.get('/users', authenticateToken, AdminOnly, getUserAll);
app.delete('/users/:id', modifyLimiter, authenticateToken, AdminOnly, deleteUserData);
app.patch('/users/:id', modifyLimiter, authenticateToken, updateUserData);
app.get('/users/:id', authenticateToken, getUserId);

//room
app.get('/rooms', authenticateToken, getRooms);
app.get('/rooms/:id', authenticateToken, getRoom);
app.post('/rooms', modifyLimiter, authenticateToken, AdminOnly, createNewRoom);
app.patch('/rooms/:id', modifyLimiter, authenticateToken, AdminOnly, updateExistingRoom);
app.post('/rooms/:id/assign', modifyLimiter, authenticateToken, AdminOnly, assignUserToRoom);
app.post('/rooms/:id/unassign', modifyLimiter, authenticateToken, AdminOnly, unassignUserFromRoom);

//booking
app.post('/bookings', modifyLimiter, authenticateToken, createNewBooking);
app.get('/bookings', authenticateToken, getBookings);
app.get('/bookings/:id', authenticateToken, getBookingId);
app.patch('/bookings/:id', modifyLimiter, authenticateToken, updateExistingBooking);
app.delete('/bookings/:id', modifyLimiter, authenticateToken, deleteBookingById);

//payment
app.post('/payments', modifyLimiter, authenticateToken, AdminOnly, createNewPayment);
app.get('/payments', authenticateToken, AdminOnly, getPayments);
app.get('/payments/:id', authenticateToken, AdminOnly, getPaymentId);
app.patch('/payments/:id', modifyLimiter, authenticateToken, AdminOnly, updateExistingPayment);
app.delete('/payments/:id', modifyLimiter, authenticateToken, AdminOnly, deleteExistingPayment);
app.get('/payments/checkdue/update', authenticateToken, checkdue);

//fix request
app.post('/fixrequests', modifyLimiter, authenticateToken, handleCreateFixRequest);
app.get('/fixrequests', authenticateToken, handleGetAllFixRequests);
app.get('/fixrequests/:id', authenticateToken, handleGetFixRequestById);
app.patch('/fixrequests/:id', modifyLimiter, authenticateToken, handleUpdateFixRequest);
app.delete('/fixrequests/:id', modifyLimiter, authenticateToken, handleDeleteFixRequest);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Rate limiting enabled:');
  console.log('- General: 100 requests per 15 minutes');
  console.log('- Auth: 5 attempts per 15 minutes');
  console.log('- Modifications: 30 requests per 10 minutes');
});
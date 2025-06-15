import { Router } from 'express';
import authRoutes from './authRoute';
import userRoutes from './userRoute';
import roomRoutes from './roomRoute';
import bookingRoutes from './bookingRoute';
import paymentRoutes from './paymentRoute';
import fixRequestRoutes from './fixrequestRoute';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/fixrequests', fixRequestRoutes);

export default router;
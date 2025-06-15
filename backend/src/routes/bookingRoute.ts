import { Router } from 'express';
import { modifyLimiter } from '../middleware/ratelimit';
import { authenticateToken } from '../middleware/auth';
import { createNewBooking, getBookingId, getBookings, updateExistingBooking, deleteBookingById } from '../Controller/bookingController';

const router = Router();

router.use(authenticateToken);

router.post('/', modifyLimiter, createNewBooking);
router.get('/', getBookings);
router.get('/:id', getBookingId);
router.patch('/:id', modifyLimiter, updateExistingBooking);
router.delete('/:id', modifyLimiter, deleteBookingById);

export default router;
import { Router } from 'express';
import { modifyLimiter } from '../middleware/ratelimit';
import { authenticateToken, AdminOnly } from '../middleware/auth';
import { createNewPayment,getPaymentId,getPayments,updateExistingPayment,deleteExistingPayment,checkdue } from '../Controller/paymentController';

const router = Router();

router.use(authenticateToken, AdminOnly);

router.post('/', modifyLimiter, createNewPayment);
router.get('/', getPayments);
router.get('/checkdue/update', checkdue); 
router.get('/:id', getPaymentId);
router.patch('/:id', modifyLimiter, updateExistingPayment);
router.delete('/:id', modifyLimiter, deleteExistingPayment);

export default router;
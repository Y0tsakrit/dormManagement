import { Router } from 'express';
import { modifyLimiter } from '../middleware/ratelimit';
import { authenticateToken, AdminOnly } from '../middleware/auth';
import { getUserId, getUserAll, updateUserData, deleteUserData } from '../Controller/userController';

const router = Router();

router.use(authenticateToken);

router.get('/', AdminOnly, getUserAll);
router.get('/:id', getUserId);
router.patch('/:id', modifyLimiter, updateUserData);
router.delete('/:id', modifyLimiter, AdminOnly, deleteUserData);

export default router;
import { Router } from 'express';
import { modifyLimiter } from '../middleware/ratelimit';
import { authenticateToken } from '../middleware/auth';
import { handleCreateFixRequest,handleDeleteFixRequest,handleGetAllFixRequests,handleGetFixRequestById,handleUpdateFixRequest } from '../Controller/fixrequestController';

const router = Router();

router.use(authenticateToken);

router.post('/', modifyLimiter, handleCreateFixRequest);
router.get('/', handleGetAllFixRequests);
router.get('/:id', handleGetFixRequestById);
router.patch('/:id', modifyLimiter, handleUpdateFixRequest);
router.delete('/:id', modifyLimiter, handleDeleteFixRequest);

export default router;
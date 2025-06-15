import { Router } from 'express';
import { modifyLimiter } from '../middleware/ratelimit';
import { authenticateToken, AdminOnly } from '../middleware/auth';
import { createNewRoom, getRoom, getRooms, updateExistingRoom, assignUserToRoom, unassignUserFromRoom } from '../Controller/roomController';

const router = Router();

router.use(authenticateToken);

router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', modifyLimiter, AdminOnly, createNewRoom);
router.patch('/:id', modifyLimiter, AdminOnly, updateExistingRoom);
router.post('/:id/assign', modifyLimiter, AdminOnly, assignUserToRoom);
router.post('/:id/unassign', modifyLimiter, AdminOnly, unassignUserFromRoom);

export default router;
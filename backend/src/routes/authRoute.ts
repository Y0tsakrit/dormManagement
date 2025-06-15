import { Router } from 'express';
import { authLimiter } from '../middleware/ratelimit';
import { loginUser, logoutUser, registerUser } from '../Controller/systemController';

const router = Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);

export default router;
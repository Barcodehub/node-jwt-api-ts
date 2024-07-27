import { Router } from 'express';
import { register, login, changeUserRole } from '../controllers/authController';
import { verifyToken, isAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-role', [verifyToken, isAdmin], changeUserRole);

export default router;
import express from 'express';
import { registerUser, loginUser, getUsers, deleteUser } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, authorize('Manager', 'Owner'), getUsers);
router.delete('/users/:id', protect, authorize('Manager', 'Owner'), deleteUser);

export default router;

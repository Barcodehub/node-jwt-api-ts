import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { verifyToken, isAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', verifyToken, getProducts);
router.get('/:id', verifyToken, getProduct);
router.post('/', [verifyToken, isAdmin], createProduct);
router.put('/:id', [verifyToken, isAdmin], updateProduct);
router.delete('/:id', [verifyToken, isAdmin], deleteProduct);

export default router;
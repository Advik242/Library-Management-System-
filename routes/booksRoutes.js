import express from 'express';
import multer from 'multer';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  bulkUpload,
  getGenres
} from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getBooks);
router.get('/genres', getGenres);
router.get('/:id', getBook);

router.use(protect);

router.post('/', isAdmin, createBook);
router.put('/:id', isAdmin, updateBook);
router.delete('/:id', isAdmin, deleteBook);
router.post('/bulk-upload', isAdmin, upload.single('file'), bulkUpload);

export default router;

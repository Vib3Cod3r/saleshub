import { Router } from 'express';

const router = Router();

// TODO: Implement notes routes
// - GET / - Get all notes with pagination and filtering
// - GET /:id - Get single note by ID
// - POST / - Create new note
// - PUT /:id - Update note
// - DELETE /:id - Delete note

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Notes routes - Coming soon'
  });
});

export default router; 
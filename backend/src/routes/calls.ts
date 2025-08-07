import { Router } from 'express';

const router = Router();

// TODO: Implement calls routes
// - GET / - Get all calls with pagination and filtering
// - GET /:id - Get single call by ID
// - POST / - Create new call
// - PUT /:id - Update call
// - DELETE /:id - Delete call
// - PUT /:id/complete - Mark call as completed

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Calls routes - Coming soon'
  });
});

export default router; 
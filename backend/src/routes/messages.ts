import { Router } from 'express';

const router = Router();

// TODO: Implement messages routes
// - GET / - Get all messages with pagination and filtering
// - GET /:id - Get single message by ID
// - POST / - Create new message
// - PUT /:id - Update message
// - DELETE /:id - Delete message
// - PUT /:id/send - Send message

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Messages routes - Coming soon'
  });
});

export default router; 
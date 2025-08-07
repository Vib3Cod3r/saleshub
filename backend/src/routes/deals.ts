import { Router } from 'express';

const router = Router();

// TODO: Implement deals routes
// - GET / - Get all deals with pagination and filtering
// - GET /:id - Get single deal by ID
// - POST / - Create new deal
// - PUT /:id - Update deal
// - DELETE /:id - Delete deal
// - GET /:id/stats - Get deal statistics
// - GET /pipeline - Get pipeline metrics

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Deals routes - Coming soon'
  });
});

export default router; 
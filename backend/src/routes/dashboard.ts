import { Router } from 'express';

const router = Router();

// TODO: Implement dashboard routes
// - GET /overview - Get dashboard overview
// - GET /revenue - Get revenue metrics
// - GET /pipeline - Get pipeline metrics
// - GET /recent-sales - Get recent sales
// - GET /top-performers - Get top performers

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard routes - Coming soon'
  });
});

export default router; 
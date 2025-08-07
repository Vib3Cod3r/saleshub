import { Router } from 'express';

const router = Router();

// TODO: Implement companies routes
// - GET / - Get all companies with pagination and filtering
// - GET /:id - Get single company by ID
// - POST / - Create new company
// - PUT /:id - Update company
// - DELETE /:id - Delete company
// - GET /:id/contacts - Get company contacts

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Companies routes - Coming soon'
  });
});

export default router; 
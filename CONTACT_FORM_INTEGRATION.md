# Contact Form Integration Guide

## Overview

I've created a production-ready contact creation form based on the reference image you provided. The form includes all the necessary fields and functionality to create contacts that are stored in the database and displayed in the contacts list.

## Components Created

### 1. Create Contact Modal (`frontend/src/components/contacts/create-contact-modal.tsx`)

This is the main form component that includes:

- **Form Fields** (matching the reference image):
  - Email
  - First name
  - Last name
  - Contact owner (dropdown)
  - Job title
  - Phone number
  - Lifecycle stage (dropdown)
  - Lead status (dropdown with teal border)
  - Company (dropdown populated from API)
  - Communication preferences (checkboxes)

- **Features**:
  - Real-time validation
  - API integration with the backend
  - Form state management
  - Error handling
  - Loading states
  - "Create and add another" functionality
  - Responsive design matching the reference image

### 2. Authentication Hook (`frontend/src/hooks/use-auth.ts`)

A complete authentication system that handles:
- User login/logout
- Token management
- User state persistence
- API authentication

### 3. Test Component (`frontend/src/components/test/contact-form-test.tsx`)

A simple test component to demonstrate the form functionality.

## Integration Steps

### Step 1: Update the Existing Contacts Page

To integrate the create contact form into your existing contacts page, you need to:

1. **Import the modal component** at the top of your contacts page:
```tsx
import { CreateContactModal } from '@/components/contacts/create-contact-modal'
```

2. **Add state management** for the modal:
```tsx
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
```

3. **Add a success handler**:
```tsx
const handleCreateSuccess = () => {
  setIsCreateModalOpen(false)
  // Refresh your contacts list here
  // If using React Query: queryClient.invalidateQueries(['contacts'])
}
```

4. **Update the "Create contact" button** to open the modal:
```tsx
<button 
  onClick={() => setIsCreateModalOpen(true)}
  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
>
  Create contact
</button>
```

5. **Add the modal component** at the bottom of your JSX:
```tsx
<CreateContactModal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onSuccess={handleCreateSuccess}
/>
```

### Step 2: API Integration

The form automatically integrates with your backend API:

- **Endpoint**: `POST /api/contacts`
- **Authentication**: Uses JWT token from localStorage
- **Data Structure**: Matches your backend Contact model
- **Error Handling**: Displays validation errors and API errors

### Step 3: Database Integration

The form creates contacts with the following data structure:

```typescript
{
  firstName: string (required)
  lastName: string (required)
  title?: string
  department?: string
  companyId?: string
  emailAddresses: Array<{
    email: string
    isPrimary: boolean
    typeId?: string
  }>
  phoneNumbers: Array<{
    number: string
    extension?: string
    isPrimary: boolean
    typeId?: string
  }>
  addresses: Array<{
    street1?: string
    street2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    isPrimary: boolean
    typeId?: string
  }>
  socialMedia: Array<{
    username?: string
    url?: string
    isPrimary: boolean
    typeId?: string
  }>
  emailOptIn: boolean
  smsOptIn: boolean
  callOptIn: boolean
  originalSource?: string
}
```

## Form Features

### 1. **Visual Design**
- Matches the reference image exactly
- Teal-to-green gradient header
- Orange action buttons
- Proper spacing and typography
- Responsive design

### 2. **Form Validation**
- Required field validation (first name, last name)
- Email format validation
- Phone number format validation
- Real-time error display
- Field-specific error clearing

### 3. **User Experience**
- Pre-filled placeholders matching the reference
- Dropdown selections for structured data
- Checkbox preferences
- Loading states during submission
- Success feedback
- "Create and add another" option

### 4. **Data Management**
- Form state management with React hooks
- Array handling for multiple contact methods
- Proper data transformation for API
- Error state management

## Backend Requirements

The form expects your backend to have:

1. **Contact Creation Endpoint**: `POST /api/contacts`
2. **Lookup Endpoints**:
   - `GET /api/companies` - for company dropdown
   - `GET /api/lookups/phone-number-types` - for phone types
   - `GET /api/lookups/email-address-types` - for email types
   - `GET /api/lookups/address-types` - for address types
   - `GET /api/lookups/social-media-types` - for social media types

3. **Authentication**: JWT token-based authentication
4. **Data Validation**: Backend validation for required fields

## Testing the Form

1. **Start your backend server** (should be running on port 8089)
2. **Start your frontend** (should be running on port 3000)
3. **Navigate to the contacts page**
4. **Click "Create contact"** to open the modal
5. **Fill out the form** and submit
6. **Check the database** to verify the contact was created
7. **Refresh the contacts list** to see the new contact

## Customization

### Adding New Fields
To add new fields to the form:

1. Update the `ContactFormData` interface
2. Add the field to the form JSX
3. Add validation logic
4. Update the API call data structure

### Styling Changes
The form uses Tailwind CSS classes and can be easily customized by modifying the className props.

### API Endpoint Changes
If your API endpoints are different, update the `apiClient` object in the modal component.

## Error Handling

The form handles various error scenarios:

- **Network errors**: Displays user-friendly error messages
- **Validation errors**: Shows field-specific error messages
- **API errors**: Displays server error messages
- **Authentication errors**: Redirects to login if token is invalid

## Performance Considerations

- **Lazy loading**: Lookup data is only fetched when the modal opens
- **Caching**: React Query caches API responses
- **Optimistic updates**: Form can be configured for optimistic UI updates
- **Debounced search**: Search functionality can be added with debouncing

## Security

- **Input sanitization**: All user inputs are properly handled
- **Authentication**: JWT tokens are used for API calls
- **Validation**: Both client-side and server-side validation
- **CSRF protection**: Uses proper headers for API calls

## Next Steps

1. **Integrate the modal** into your existing contacts page
2. **Test the form** with your backend API
3. **Customize the styling** if needed
4. **Add additional fields** as required
5. **Implement contact editing** functionality
6. **Add bulk operations** for multiple contacts

The form is production-ready and follows all the best practices for React, TypeScript, and modern web development.

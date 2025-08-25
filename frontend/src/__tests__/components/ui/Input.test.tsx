import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../../../components/ui/Input'
import { Search, Eye, EyeOff } from 'lucide-react'

describe('Input', () => {
  describe('rendering', () => {
    it('should render input with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render input with value', () => {
      render(<Input value="test value" onChange={() => {}} />)
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
    })

    it('should render input with default variant', () => {
      render(<Input placeholder="Default input" />)
      const input = screen.getByPlaceholderText('Default input')
      expect(input).toHaveClass('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500')
    })

    it('should render input with error variant', () => {
      render(<Input error placeholder="Error input" />)
      const input = screen.getByPlaceholderText('Error input')
      expect(input).toHaveClass('border-red-300', 'focus:border-red-500', 'focus:ring-red-500')
    })

    it('should render input with success variant', () => {
      render(<Input success placeholder="Success input" />)
      const input = screen.getByPlaceholderText('Success input')
      expect(input).toHaveClass('border-green-300', 'focus:border-green-500', 'focus:ring-green-500')
    })

    it('should render input with warning variant', () => {
      render(<Input warning placeholder="Warning input" />)
      const input = screen.getByPlaceholderText('Warning input')
      expect(input).toHaveClass('border-yellow-300', 'focus:border-yellow-500', 'focus:ring-yellow-500')
    })
  })

  describe('sizes', () => {
    it('should render small input', () => {
      render(<Input size="sm" placeholder="Small input" />)
      const input = screen.getByPlaceholderText('Small input')
      expect(input).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })

    it('should render medium input (default)', () => {
      render(<Input placeholder="Medium input" />)
      const input = screen.getByPlaceholderText('Medium input')
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm')
    })

    it('should render large input', () => {
      render(<Input size="lg" placeholder="Large input" />)
      const input = screen.getByPlaceholderText('Large input')
      expect(input).toHaveClass('px-4', 'py-3', 'text-base')
    })
  })

  describe('icons', () => {
    it('should render left icon', () => {
      render(<Input leftIcon={<Search data-testid="left-icon" />} placeholder="With left icon" />)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should render right icon', () => {
      render(<Input rightIcon={<Search data-testid="right-icon" />} placeholder="With right icon" />)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should render both left and right icons', () => {
      render(
        <Input 
          leftIcon={<Search data-testid="left-icon" />}
          rightIcon={<Search data-testid="right-icon" />}
          placeholder="With both icons"
        />
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('password toggle', () => {
    it('should show password toggle when showPasswordToggle is true', () => {
      render(<Input type="password" showPasswordToggle placeholder="Password input" />)
      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeInTheDocument()
    })

    it('should toggle password visibility when toggle button is clicked', () => {
      render(<Input type="password" showPasswordToggle placeholder="Password input" />)
      const input = screen.getByPlaceholderText('Password input')
      const toggleButton = screen.getByRole('button')

      // Initially should be password type
      expect(input).toHaveAttribute('type', 'password')

      // Click toggle button
      fireEvent.click(toggleButton)

      // Should now be text type
      expect(input).toHaveAttribute('type', 'text')

      // Click toggle button again
      fireEvent.click(toggleButton)

      // Should be password type again
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should show eye icon when password is hidden', () => {
      render(<Input type="password" showPasswordToggle placeholder="Password input" />)
      const toggleButton = screen.getByRole('button')
      const eyeIcon = toggleButton.querySelector('svg')
      expect(eyeIcon).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onChange when value changes', () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} placeholder="Test input" />)
      
      const input = screen.getByPlaceholderText('Test input')
      fireEvent.change(input, { target: { value: 'new value' } })
      
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: 'new value' })
      }))
    })

    it('should call onFocus when input is focused', () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} placeholder="Test input" />)
      
      const input = screen.getByPlaceholderText('Test input')
      fireEvent.focus(input)
      
      expect(handleFocus).toHaveBeenCalled()
    })

    it('should call onBlur when input loses focus', () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} placeholder="Test input" />)
      
      const input = screen.getByPlaceholderText('Test input')
      fireEvent.blur(input)
      
      expect(handleBlur).toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled placeholder="Disabled input" />)
      const input = screen.getByPlaceholderText('Disabled input')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('should not call onChange when disabled', () => {
      const handleChange = jest.fn()
      render(<Input disabled onChange={handleChange} placeholder="Disabled input" />)
      
      const input = screen.getByPlaceholderText('Disabled input')
      fireEvent.change(input, { target: { value: 'new value' } })
      
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('readonly state', () => {
    it('should be readonly when readonly prop is true', () => {
      render(<Input readOnly placeholder="Readonly input" />)
      const input = screen.getByPlaceholderText('Readonly input')
      expect(input).toHaveAttribute('readonly')
    })
  })

  describe('accessibility', () => {
    it('should have proper input role', () => {
      render(<Input placeholder="Accessible input" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should have proper aria-label when provided', () => {
      render(<Input aria-label="Custom label" placeholder="Input" />)
      expect(screen.getByRole('textbox', { name: 'Custom label' })).toBeInTheDocument()
    })

    it('should have proper aria-describedby when provided', () => {
      render(<Input aria-describedby="description" placeholder="Input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'description')
    })

    it('should have proper aria-invalid when error is true', () => {
      render(<Input error placeholder="Error input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<Input className="custom-class" placeholder="Custom input" />)
      const input = screen.getByPlaceholderText('Custom input')
      expect(input).toHaveClass('custom-class')
    })

    it('should merge custom className with default classes', () => {
      render(<Input className="custom-class" placeholder="Custom input" />)
      const input = screen.getByPlaceholderText('Custom input')
      expect(input).toHaveClass('custom-class', 'border-gray-300')
    })
  })

  describe('input types', () => {
    it('should render text input by default', () => {
      render(<Input placeholder="Text input" />)
      const input = screen.getByPlaceholderText('Text input')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render email input', () => {
      render(<Input type="email" placeholder="Email input" />)
      const input = screen.getByPlaceholderText('Email input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render number input', () => {
      render(<Input type="number" placeholder="Number input" />)
      const input = screen.getByPlaceholderText('Number input')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render tel input', () => {
      render(<Input type="tel" placeholder="Phone input" />)
      const input = screen.getByPlaceholderText('Phone input')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should render url input', () => {
      render(<Input type="url" placeholder="URL input" />)
      const input = screen.getByPlaceholderText('URL input')
      expect(input).toHaveAttribute('type', 'url')
    })
  })

  describe('validation states', () => {
    it('should show error icon when error is true', () => {
      render(<Input error placeholder="Error input" />)
      const input = screen.getByPlaceholderText('Error input')
      const errorIcon = input.parentElement?.querySelector('svg')
      expect(errorIcon).toBeInTheDocument()
    })

    it('should show success icon when success is true', () => {
      render(<Input success placeholder="Success input" />)
      const input = screen.getByPlaceholderText('Success input')
      const successIcon = input.parentElement?.querySelector('svg')
      expect(successIcon).toBeInTheDocument()
    })

    it('should show warning icon when warning is true', () => {
      render(<Input warning placeholder="Warning input" />)
      const input = screen.getByPlaceholderText('Warning input')
      const warningIcon = input.parentElement?.querySelector('svg')
      expect(warningIcon).toBeInTheDocument()
    })
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByText('Click me')
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )

    const button = screen.getByText('Click me')
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply primary variant by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByText('Primary')

    expect(button).toHaveClass('bg-primary')
  })

  it('should apply secondary variant when specified', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByText('Secondary')

    expect(button).toHaveClass('bg-neutral-800')
  })

  it('should apply danger variant when specified', () => {
    render(<Button variant="danger">Delete</Button>)
    const button = screen.getByText('Delete')

    expect(button).toHaveClass('bg-red-600')
  })

  it('should apply medium size by default', () => {
    render(<Button>Medium</Button>)
    const button = screen.getByText('Medium')

    expect(button).toHaveClass('px-4', 'py-2.5')
  })

  it('should apply small size when specified', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByText('Small')

    expect(button).toHaveClass('px-3', 'py-1.5')
  })

  it('should apply large size when specified', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByText('Large')

    expect(button).toHaveClass('px-6', 'py-3')
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByText('Custom')

    expect(button).toHaveClass('custom-class')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByText('Disabled')

    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('should apply animation styles by default', () => {
    render(<Button>Animated</Button>)
    const button = screen.getByText('Animated')

    expect(button).toHaveClass('hover:scale-[1.02]')
  })

  it('should not apply animation styles when animated is false', () => {
    render(<Button animated={false}>Not Animated</Button>)
    const button = screen.getByText('Not Animated')

    expect(button).not.toHaveClass('hover:scale-[1.02]')
    expect(button).toHaveClass('transition-colors')
  })

  it('should render as button element', () => {
    render(<Button>Button</Button>)
    const button = screen.getByText('Button')

    expect(button.tagName).toBe('BUTTON')
  })

  it('should pass through additional props', () => {
    render(
      <Button type="submit" data-testid="submit-button">
        Submit
      </Button>
    )
    const button = screen.getByTestId('submit-button')

    expect(button).toHaveAttribute('type', 'submit')
  })
})

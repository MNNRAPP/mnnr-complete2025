/**
 * Button Component Tests
 * 
 * Created: 2025-12-27 00:30:00 EST
 * Part of 2-hour completion plan - Phase 4
 */

import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with default variant', () => {
    const { container } = render(<Button>Default</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('bg-blue-600');
  });

  it('renders with outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('border');
  });

  it('renders with ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('hover:bg-gray-100');
  });

  it('renders with destructive variant', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('bg-red-600');
  });

  it('renders with small size', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  it('renders with large size', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('is disabled when specified', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByText('Loading');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('custom-class');
  });

  it('renders as different HTML element when specified', () => {
    const { container } = render(<Button as="a" href="/test">Link</Button>);
    const element = container.firstChild as HTMLElement;
    expect(element.tagName).toBe('A');
    expect(element).toHaveAttribute('href', '/test');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>With Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders with full width', () => {
    const { container } = render(<Button fullWidth>Full Width</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('w-full');
  });

  it('renders with icon', () => {
    const Icon = () => <span data-testid="icon">🔥</span>;
    render(
      <Button icon={<Icon />}>
        With Icon
      </Button>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

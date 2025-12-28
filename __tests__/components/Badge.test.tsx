/**
 * Badge Component Tests
 * 
 * Created: 2025-12-27 00:32:00 EST
 * Part of 2-hour completion plan - Phase 4
 */

import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('renders with success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders with warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders with error variant', () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('renders with info variant', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-badge">Custom</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('custom-badge');
  });

  it('renders with small size', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5');
  });

  it('renders with large size', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('text-base', 'px-4', 'py-1.5');
  });

  it('renders with dot indicator', () => {
    const { container } = render(<Badge dot>With Dot</Badge>);
    expect(container.querySelector('.w-2.h-2.rounded-full')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const Icon = () => <span data-testid="icon">✓</span>;
    render(<Badge icon={<Icon />}>With Icon</Badge>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders as different HTML element when specified', () => {
    const { container } = render(<Badge as="a" href="/test">Link Badge</Badge>);
    const element = container.firstChild as HTMLElement;
    expect(element.tagName).toBe('A');
    expect(element).toHaveAttribute('href', '/test');
  });

  it('renders with rounded variant', () => {
    const { container } = render(<Badge rounded>Rounded</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('rounded-full');
  });

  it('renders with outline style', () => {
    const { container } = render(<Badge outline>Outline</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('border');
  });
});

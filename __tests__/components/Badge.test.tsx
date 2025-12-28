/**
 * Badge Component Tests
 * 
 * Created: 2025-12-27 00:32:00 EST
 * Updated: 2025-12-28 - Fixed to match actual component implementation
 * Part of 2-hour completion plan - Phase 4
 */

import { describe, it, expect } from 'vitest';
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

  it('renders as span element', () => {
    const { container } = render(<Badge>Span Badge</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.tagName).toBe('SPAN');
  });

  it('has rounded-full class by default', () => {
    const { container } = render(<Badge>Rounded</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('rounded-full');
  });

  it('has inline-flex display', () => {
    const { container } = render(<Badge>Inline</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('inline-flex');
  });

  it('has items-center alignment', () => {
    const { container } = render(<Badge>Centered</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('items-center');
  });

  it('has text-xs font size', () => {
    const { container } = render(<Badge>Small Text</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('text-xs');
  });

  it('has font-medium weight', () => {
    const { container } = render(<Badge>Medium Weight</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('font-medium');
  });

  it('has correct padding', () => {
    const { container } = render(<Badge>Padded</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('px-2.5', 'py-0.5');
  });

  it('combines variant and custom className', () => {
    const { container } = render(
      <Badge variant="success" className="extra-class">Combined</Badge>
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'extra-class');
  });

  it('renders multiple badges correctly', () => {
    render(
      <div>
        <Badge variant="success">Success</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="warning">Warning</Badge>
      </div>
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('renders with complex children', () => {
    render(
      <Badge>
        <span>Icon</span> Text
      </Badge>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText(/Text/)).toBeInTheDocument();
  });
});

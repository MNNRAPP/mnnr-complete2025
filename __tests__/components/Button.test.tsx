/**
 * Button Component Tests
 * 
 * Created: 2025-12-27 00:30:00 EST
 * Updated: 2025-12-28 - Fixed to match actual component implementation
 * Part of 2-hour completion plan - Phase 4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Button from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with default flat variant', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'flat');
  });

  it('renders with slim variant', () => {
    render(<Button variant="slim">Slim</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'slim');
  });

  it('is disabled when specified', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    // Loading button should contain loading dots
    expect(button.querySelector('i')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>With Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies custom width', () => {
    render(<Button width={200}>Custom Width</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ width: '200px' });
  });

  it('applies custom style', () => {
    render(<Button style={{ color: 'rgb(255, 0, 0)' }}>Custom Style</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('sets aria-pressed when active', () => {
    render(<Button active>Active</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('passes additional props to button element', () => {
    render(<Button data-testid="test-button" type="submit">Submit</Button>);
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders with displayName', () => {
    expect(Button.displayName).toBe('Button');
  });

  it('combines width and style props correctly', () => {
    render(
      <Button width={150} style={{ color: 'rgb(0, 0, 255)' }}>
        Combined
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ width: '150px', color: 'rgb(0, 0, 255)' });
  });

  it('handles loading and disabled together', () => {
    render(<Button loading disabled>Both</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('i')).toBeInTheDocument();
  });

  it('renders button element by default', () => {
    render(<Button>Default Element</Button>);
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });

  it('can render loading dots inside button', () => {
    const { container } = render(<Button loading>Loading Button</Button>);
    // Check for the loading dots container
    const loadingContainer = container.querySelector('i');
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveClass('flex', 'pl-2', 'm-0');
  });

  it('merges refs correctly', () => {
    const ref1 = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref1}>Merged Refs</Button>);
    expect(ref1.current).not.toBeNull();
    expect(ref1.current?.tagName).toBe('BUTTON');
  });
});

/**
 * Toast Component Tests
 * 
 * Comprehensive tests for the Toast UI components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/Toasts/toast';

// Mock radix-ui toast primitives
vi.mock('@radix-ui/react-toast', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radix-provider">{children}</div>
  ),
  Viewport: React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => (
    <div ref={ref} data-testid="radix-viewport" className={className} {...props} />
  )),
  Root: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div ref={ref} data-testid="radix-root" className={className} {...props}>{children}</div>
  )),
  Title: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div ref={ref} data-testid="radix-title" className={className} {...props}>{children}</div>
  )),
  Description: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div ref={ref} data-testid="radix-description" className={className} {...props}>{children}</div>
  )),
  Close: React.forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => (
    <button ref={ref} data-testid="radix-close" className={className} {...props}>{children}</button>
  )),
  Action: React.forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => (
    <button ref={ref} data-testid="radix-action" className={className} {...props}>{children}</button>
  )),
}));

describe('ToastProvider', () => {
  it('should render children', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Child Content</div>
      </ToastProvider>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('ToastViewport', () => {
  it('should render with default classes', () => {
    render(<ToastViewport data-testid="viewport" />);
    
    const viewport = screen.getByTestId('viewport');
    expect(viewport).toBeInTheDocument();
    expect(viewport.className).toContain('fixed');
    expect(viewport.className).toContain('top-0');
    expect(viewport.className).toContain('z-[100]');
  });

  it('should merge custom className', () => {
    render(<ToastViewport className="custom-class" data-testid="viewport" />);
    
    const viewport = screen.getByTestId('viewport');
    expect(viewport.className).toContain('custom-class');
    expect(viewport.className).toContain('fixed');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ToastViewport ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should be a forwardRef component', () => {
    expect(ToastViewport).toBeDefined();
    expect(typeof ToastViewport).toBe('object');
  });
});

describe('Toast', () => {
  it('should render with default variant', () => {
    render(<Toast>Toast Content</Toast>);
    
    const toast = screen.getByTestId('radix-root');
    expect(toast).toBeInTheDocument();
    expect(toast.className).toContain('bg-white');
  });

  it('should render with destructive variant', () => {
    render(<Toast variant="destructive">Error Toast</Toast>);
    
    const toast = screen.getByTestId('radix-root');
    expect(toast.className).toContain('destructive');
    expect(toast.className).toContain('bg-red-500');
  });

  it('should merge custom className', () => {
    render(<Toast className="custom-toast">Toast</Toast>);
    
    const toast = screen.getByTestId('radix-root');
    expect(toast.className).toContain('custom-toast');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Toast ref={ref}>Toast</Toast>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should be a forwardRef component', () => {
    expect(Toast).toBeDefined();
    expect(typeof Toast).toBe('object');
  });

  it('should spread additional props', () => {
    render(<Toast data-custom="value">Toast</Toast>);
    
    const toast = screen.getByTestId('radix-root');
    expect(toast).toHaveAttribute('data-custom', 'value');
  });
});

describe('ToastAction', () => {
  it('should render action button', () => {
    render(<ToastAction altText="Undo action">Undo</ToastAction>);
    
    const action = screen.getByTestId('radix-action');
    expect(action).toBeInTheDocument();
    expect(action).toHaveTextContent('Undo');
  });

  it('should apply default styles', () => {
    render(<ToastAction altText="Action">Action</ToastAction>);
    
    const action = screen.getByTestId('radix-action');
    expect(action.className).toContain('inline-flex');
    expect(action.className).toContain('h-8');
    expect(action.className).toContain('rounded-md');
  });

  it('should merge custom className', () => {
    render(<ToastAction altText="Action" className="custom-action">Action</ToastAction>);
    
    const action = screen.getByTestId('radix-action');
    expect(action.className).toContain('custom-action');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<ToastAction ref={ref} altText="Action">Action</ToastAction>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should be a forwardRef component', () => {
    expect(ToastAction).toBeDefined();
    expect(typeof ToastAction).toBe('object');
  });
});

describe('ToastClose', () => {
  it('should render close button', () => {
    render(<ToastClose />);
    
    const close = screen.getByTestId('radix-close');
    expect(close).toBeInTheDocument();
  });

  it('should apply default styles', () => {
    render(<ToastClose />);
    
    const close = screen.getByTestId('radix-close');
    expect(close.className).toContain('absolute');
    expect(close.className).toContain('right-2');
    expect(close.className).toContain('top-2');
  });

  it('should render X icon', () => {
    render(<ToastClose />);
    
    const close = screen.getByTestId('radix-close');
    // The X icon from lucide-react should be rendered as SVG
    const svg = close.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should merge custom className', () => {
    render(<ToastClose className="custom-close" />);
    
    const close = screen.getByTestId('radix-close');
    expect(close.className).toContain('custom-close');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<ToastClose ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should have toast-close attribute', () => {
    render(<ToastClose />);
    
    const close = screen.getByTestId('radix-close');
    expect(close).toHaveAttribute('toast-close', '');
  });

  it('should be a forwardRef component', () => {
    expect(ToastClose).toBeDefined();
    expect(typeof ToastClose).toBe('object');
  });
});

describe('ToastTitle', () => {
  it('should render title text', () => {
    render(<ToastTitle>Toast Title</ToastTitle>);
    
    const title = screen.getByTestId('radix-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Toast Title');
  });

  it('should apply default styles', () => {
    render(<ToastTitle>Title</ToastTitle>);
    
    const title = screen.getByTestId('radix-title');
    expect(title.className).toContain('text-sm');
    expect(title.className).toContain('font-semibold');
  });

  it('should merge custom className', () => {
    render(<ToastTitle className="custom-title">Title</ToastTitle>);
    
    const title = screen.getByTestId('radix-title');
    expect(title.className).toContain('custom-title');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ToastTitle ref={ref}>Title</ToastTitle>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should be a forwardRef component', () => {
    expect(ToastTitle).toBeDefined();
    expect(typeof ToastTitle).toBe('object');
  });

  it('should render React nodes as children', () => {
    render(
      <ToastTitle>
        <span data-testid="inner">Inner Content</span>
      </ToastTitle>
    );
    
    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });
});

describe('ToastDescription', () => {
  it('should render description text', () => {
    render(<ToastDescription>Toast Description</ToastDescription>);
    
    const description = screen.getByTestId('radix-description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('Toast Description');
  });

  it('should apply default styles', () => {
    render(<ToastDescription>Description</ToastDescription>);
    
    const description = screen.getByTestId('radix-description');
    expect(description.className).toContain('text-sm');
    expect(description.className).toContain('opacity-90');
  });

  it('should merge custom className', () => {
    render(<ToastDescription className="custom-desc">Description</ToastDescription>);
    
    const description = screen.getByTestId('radix-description');
    expect(description.className).toContain('custom-desc');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ToastDescription ref={ref}>Description</ToastDescription>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should be a forwardRef component', () => {
    expect(ToastDescription).toBeDefined();
    expect(typeof ToastDescription).toBe('object');
  });

  it('should render React nodes as children', () => {
    render(
      <ToastDescription>
        <a href="#" data-testid="link">Learn more</a>
      </ToastDescription>
    );
    
    expect(screen.getByTestId('link')).toBeInTheDocument();
  });
});

describe('Toast Variants', () => {
  it('should have default variant styles', () => {
    render(<Toast>Default Toast</Toast>);
    
    const toast = screen.getByTestId('radix-root');
    expect(toast.className).toContain('bg-white');
    expect(toast.className).toContain('text-zinc-950');
  });

  it('should have destructive variant styles', () => {
    render(<Toast variant="destructive">Destructive Toast</Toast>);
    
    const toast = screen.getByTestId('radix-root');
    expect(toast.className).toContain('destructive');
    expect(toast.className).toContain('border-red-500');
    expect(toast.className).toContain('bg-red-500');
  });
});

describe('Toast Integration', () => {
  it('should render complete toast structure', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastTitle>Title</ToastTitle>
          <ToastDescription>Description</ToastDescription>
          <ToastAction altText="Undo">Undo</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByTestId('radix-close')).toBeInTheDocument();
    expect(screen.getByTestId('radix-viewport')).toBeInTheDocument();
  });
});

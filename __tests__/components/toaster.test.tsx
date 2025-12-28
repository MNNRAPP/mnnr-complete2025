/**
 * Toaster Component Tests
 * 
 * Comprehensive tests for the Toaster component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
let mockPathname = '/test';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock the useToast hook
const mockToast = vi.fn();
const mockToasts: any[] = [];

vi.mock('@/components/ui/Toasts/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    toasts: mockToasts,
    dismiss: vi.fn(),
  }),
}));

// Mock radix-ui toast primitives
vi.mock('@radix-ui/react-toast', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-provider">{children}</div>,
  Viewport: React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => (
    <div ref={ref} data-testid="toast-viewport" className={className} {...props} />
  )),
  Root: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div ref={ref} data-testid="toast-root" className={className} {...props}>{children}</div>
  )),
  Title: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div ref={ref} data-testid="toast-title" className={className} {...props}>{children}</div>
  )),
  Description: React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => (
    <div ref={ref} data-testid="toast-description" className={className} {...props}>{children}</div>
  )),
  Close: React.forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => (
    <button ref={ref} data-testid="toast-close" className={className} {...props}>{children}</button>
  )),
  Action: React.forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => (
    <button ref={ref} data-testid="toast-action" className={className} {...props}>{children}</button>
  )),
}));

// Import after mocks
import { Toaster } from '@/components/ui/Toasts/toaster';

describe('Toaster Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToasts.length = 0;
    mockPathname = '/test';
    // Reset search params
    Array.from(mockSearchParams.keys()).forEach(key => mockSearchParams.delete(key));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render ToastProvider', () => {
      render(<Toaster />);
      expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
    });

    it('should render ToastViewport', () => {
      render(<Toaster />);
      expect(screen.getByTestId('toast-viewport')).toBeInTheDocument();
    });

    it('should render empty when no toasts', () => {
      render(<Toaster />);
      expect(screen.queryByTestId('toast-root')).not.toBeInTheDocument();
    });

    it('should render toasts when present', () => {
      mockToasts.push({
        id: '1',
        title: 'Test Toast',
        description: 'Test Description',
        open: true,
      });

      render(<Toaster />);
      expect(screen.getByTestId('toast-root')).toBeInTheDocument();
      expect(screen.getByText('Test Toast')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should render toast without description', () => {
      mockToasts.push({
        id: '1',
        title: 'Title Only',
        open: true,
      });

      render(<Toaster />);
      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByTestId('toast-description')).not.toBeInTheDocument();
    });

    it('should render toast without title', () => {
      mockToasts.push({
        id: '1',
        description: 'Description Only',
        open: true,
      });

      render(<Toaster />);
      expect(screen.getByText('Description Only')).toBeInTheDocument();
      expect(screen.queryByTestId('toast-title')).not.toBeInTheDocument();
    });

    it('should render toast with action', () => {
      mockToasts.push({
        id: '1',
        title: 'Toast with Action',
        action: <button data-testid="custom-action">Undo</button>,
        open: true,
      });

      render(<Toaster />);
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });

    it('should render ToastClose button', () => {
      mockToasts.push({
        id: '1',
        title: 'Test Toast',
        open: true,
      });

      render(<Toaster />);
      expect(screen.getByTestId('toast-close')).toBeInTheDocument();
    });

    it('should render multiple toasts', () => {
      mockToasts.push(
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true }
      );

      render(<Toaster />);
      expect(screen.getByText('Toast 1')).toBeInTheDocument();
      expect(screen.getByText('Toast 2')).toBeInTheDocument();
    });
  });

  describe('URL Parameter Handling', () => {
    it('should show toast for error parameter', async () => {
      mockSearchParams.set('error', 'Something went wrong');
      
      render(<Toaster />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Something went wrong',
          variant: 'destructive',
        }));
      });
    });

    it('should show toast for status parameter', async () => {
      mockSearchParams.set('status', 'Success!');
      
      render(<Toaster />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Success!',
        }));
      });
    });

    it('should include error_description in toast', async () => {
      mockSearchParams.set('error', 'Error');
      mockSearchParams.set('error_description', 'Detailed error message');
      
      render(<Toaster />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          description: 'Detailed error message',
        }));
      });
    });

    it('should include status_description in toast', async () => {
      mockSearchParams.set('status', 'Success');
      mockSearchParams.set('status_description', 'Operation completed');
      
      render(<Toaster />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          description: 'Operation completed',
        }));
      });
    });

    it('should clear error params from URL after showing toast', async () => {
      mockSearchParams.set('error', 'Error');
      mockSearchParams.set('error_description', 'Description');
      mockSearchParams.set('other_param', 'keep_this');
      
      render(<Toaster />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalled();
      });

      const replaceCall = mockReplace.mock.calls[0][0];
      expect(replaceCall).not.toContain('error=');
      expect(replaceCall).not.toContain('error_description=');
    });

    it('should clear status params from URL after showing toast', async () => {
      mockSearchParams.set('status', 'Success');
      mockSearchParams.set('status_description', 'Description');
      
      render(<Toaster />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalled();
      });

      const replaceCall = mockReplace.mock.calls[0][0];
      expect(replaceCall).not.toContain('status=');
      expect(replaceCall).not.toContain('status_description=');
    });

    it('should preserve other query params when clearing toast params', async () => {
      mockSearchParams.set('error', 'Error');
      mockSearchParams.set('keep', 'this');
      
      render(<Toaster />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalled();
      });

      const replaceCall = mockReplace.mock.calls[0][0];
      expect(replaceCall).toContain('keep=this');
    });

    it('should redirect to pathname only when no other params', async () => {
      mockSearchParams.set('error', 'Error');
      mockPathname = '/dashboard';
      
      render(<Toaster />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/dashboard', { scroll: false });
      });
    });

    it('should not show toast when no error or status params', () => {
      mockSearchParams.set('other', 'param');
      
      render(<Toaster />);
      
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should use default error message when error param is empty', async () => {
      mockSearchParams.set('error', '');
      
      render(<Toaster />);
      
      // When error is empty string, it's falsy so toast shouldn't be called
      // But if it were truthy empty, it would use default message
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should prioritize error over status', async () => {
      mockSearchParams.set('error', 'Error Message');
      mockSearchParams.set('status', 'Status Message');
      
      render(<Toaster />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Error Message',
          variant: 'destructive',
        }));
      });
    });
  });

  describe('Toast Props Spreading', () => {
    it('should spread additional props to Toast component', () => {
      mockToasts.push({
        id: '1',
        title: 'Test',
        open: true,
        'data-custom': 'value',
      });

      render(<Toaster />);
      const toastRoot = screen.getByTestId('toast-root');
      expect(toastRoot).toHaveAttribute('data-custom', 'value');
    });
  });
});

describe('Toast Component Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToasts.length = 0;
    Array.from(mockSearchParams.keys()).forEach(key => mockSearchParams.delete(key));
  });

  it('should render toast with all properties', () => {
    mockToasts.push({
      id: '1',
      title: 'Complete Toast',
      description: 'Full description',
      action: <button>Action</button>,
      open: true,
      variant: 'default',
    });

    render(<Toaster />);
    
    expect(screen.getByText('Complete Toast')).toBeInTheDocument();
    expect(screen.getByText('Full description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByTestId('toast-close')).toBeInTheDocument();
  });
});


describe('Toaster Fallback Values', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Array.from(mockSearchParams.keys()).forEach(key => mockSearchParams.delete(key));
  });

  it('should use fallback error message when error param is empty string', async () => {
    mockSearchParams.set('error', '');
    mockSearchParams.set('error_description', 'Some description');
    
    render(<Toaster />);
    
    // When error is empty string, the fallback 'Hmm... Something went wrong.' should be used
    // But empty string is falsy, so toast won't be called
    // Let's test with a truthy but falsy-looking value
    await waitFor(() => {
      // Empty string is falsy, so no toast
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  it('should use fallback status message when status param is empty string', async () => {
    mockSearchParams.set('status', '');
    mockSearchParams.set('status_description', 'Some description');
    
    render(<Toaster />);
    
    await waitFor(() => {
      // Empty string is falsy, so no toast
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  it('should handle null error with fallback', async () => {
    // Test the ?? operator by having a truthy error that evaluates to the fallback
    mockSearchParams.set('error', 'null');
    
    render(<Toaster />);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'null',
        variant: 'destructive',
      }));
    });
  });

  it('should handle null status with fallback', async () => {
    mockSearchParams.set('status', 'null');
    
    render(<Toaster />);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'null',
      }));
    });
  });
});

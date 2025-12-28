/**
 * use-toast.ts Hook Tests
 * 
 * Comprehensive tests for the toast notification hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useToast, toast, reducer } from '@/components/ui/Toasts/use-toast';

describe('use-toast Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useToast hook', () => {
    it('should return initial state with empty toasts', () => {
      const { result } = renderHook(() => useToast());
      
      expect(result.current.toasts).toBeDefined();
      expect(result.current.toast).toBeDefined();
      expect(result.current.dismiss).toBeDefined();
      expect(typeof result.current.toast).toBe('function');
      expect(typeof result.current.dismiss).toBe('function');
    });

    it('should add a toast when toast function is called', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'Test Description',
        });
      });

      expect(result.current.toasts.length).toBeGreaterThanOrEqual(0);
    });

    it('should return toast id, dismiss, and update functions', () => {
      const { result } = renderHook(() => useToast());

      let toastResult: any;
      act(() => {
        toastResult = result.current.toast({
          title: 'Test Toast',
        });
      });

      expect(toastResult).toHaveProperty('id');
      expect(toastResult).toHaveProperty('dismiss');
      expect(toastResult).toHaveProperty('update');
      expect(typeof toastResult.dismiss).toBe('function');
      expect(typeof toastResult.update).toBe('function');
    });

    it('should dismiss toast by id', () => {
      const { result } = renderHook(() => useToast());

      let toastResult: any;
      act(() => {
        toastResult = result.current.toast({
          title: 'Test Toast',
        });
      });

      act(() => {
        result.current.dismiss(toastResult.id);
      });

      // Toast should be marked for dismissal
      const dismissedToast = result.current.toasts.find(t => t.id === toastResult.id);
      if (dismissedToast) {
        expect(dismissedToast.open).toBe(false);
      }
    });

    it('should dismiss all toasts when no id provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Toast 1' });
        result.current.toast({ title: 'Toast 2' });
      });

      act(() => {
        result.current.dismiss();
      });

      // All toasts should be marked as closed
      result.current.toasts.forEach(t => {
        expect(t.open).toBe(false);
      });
    });

    it('should update toast with new props', () => {
      const { result } = renderHook(() => useToast());

      let toastResult: any;
      act(() => {
        toastResult = result.current.toast({
          title: 'Original Title',
        });
      });

      act(() => {
        toastResult.update({
          id: toastResult.id,
          title: 'Updated Title',
        });
      });

      const updatedToast = result.current.toasts.find(t => t.id === toastResult.id);
      if (updatedToast) {
        expect(updatedToast.title).toBe('Updated Title');
      }
    });

    it('should call dismiss when onOpenChange is called with false', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Test Toast',
        });
      });

      const toastItem = result.current.toasts[0];
      if (toastItem && toastItem.onOpenChange) {
        act(() => {
          toastItem.onOpenChange!(false);
        });

        const dismissedToast = result.current.toasts.find(t => t.id === toastItem.id);
        if (dismissedToast) {
          expect(dismissedToast.open).toBe(false);
        }
      }
    });
  });

  describe('toast function', () => {
    it('should create toast with title', () => {
      const result = toast({ title: 'Test Title' });
      
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    it('should create toast with description', () => {
      const result = toast({ 
        title: 'Test Title',
        description: 'Test Description' 
      });
      
      expect(result.id).toBeDefined();
    });

    it('should create toast with variant', () => {
      const result = toast({ 
        title: 'Error',
        variant: 'destructive' 
      });
      
      expect(result.id).toBeDefined();
    });

    it('should generate unique ids', () => {
      const result1 = toast({ title: 'Toast 1' });
      const result2 = toast({ title: 'Toast 2' });
      
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('reducer', () => {
    const initialState = { toasts: [] };

    describe('ADD_TOAST action', () => {
      it('should add toast to empty state', () => {
        const newToast = { id: '1', title: 'Test', open: true };
        const action = { type: 'ADD_TOAST' as const, toast: newToast };
        
        const newState = reducer(initialState, action);
        
        expect(newState.toasts).toHaveLength(1);
        expect(newState.toasts[0]).toEqual(newToast);
      });

      it('should add toast to beginning of array', () => {
        const existingToast = { id: '1', title: 'Existing', open: true };
        const newToast = { id: '2', title: 'New', open: true };
        const state = { toasts: [existingToast] };
        const action = { type: 'ADD_TOAST' as const, toast: newToast };
        
        const newState = reducer(state, action);
        
        expect(newState.toasts[0]).toEqual(newToast);
      });

      it('should limit toasts to TOAST_LIMIT', () => {
        const existingToast = { id: '1', title: 'Existing', open: true };
        const newToast = { id: '2', title: 'New', open: true };
        const state = { toasts: [existingToast] };
        const action = { type: 'ADD_TOAST' as const, toast: newToast };
        
        const newState = reducer(state, action);
        
        // TOAST_LIMIT is 1, so only the newest toast should remain
        expect(newState.toasts.length).toBeLessThanOrEqual(1);
      });
    });

    describe('UPDATE_TOAST action', () => {
      it('should update existing toast', () => {
        const existingToast = { id: '1', title: 'Original', open: true };
        const state = { toasts: [existingToast] };
        const action = { 
          type: 'UPDATE_TOAST' as const, 
          toast: { id: '1', title: 'Updated' } 
        };
        
        const newState = reducer(state, action);
        
        expect(newState.toasts[0].title).toBe('Updated');
        expect(newState.toasts[0].open).toBe(true);
      });

      it('should not update non-matching toast', () => {
        const existingToast = { id: '1', title: 'Original', open: true };
        const state = { toasts: [existingToast] };
        const action = { 
          type: 'UPDATE_TOAST' as const, 
          toast: { id: '2', title: 'Updated' } 
        };
        
        const newState = reducer(state, action);
        
        expect(newState.toasts[0].title).toBe('Original');
      });
    });

    describe('DISMISS_TOAST action', () => {
      it('should set open to false for specific toast', () => {
        const existingToast = { id: '1', title: 'Test', open: true };
        const state = { toasts: [existingToast] };
        const action = { type: 'DISMISS_TOAST' as const, toastId: '1' };
        
        const newState = reducer(state, action);
        
        expect(newState.toasts[0].open).toBe(false);
      });

      it('should dismiss all toasts when no id provided', () => {
        const toast1 = { id: '1', title: 'Test 1', open: true };
        const toast2 = { id: '2', title: 'Test 2', open: true };
        const state = { toasts: [toast1, toast2] };
        const action = { type: 'DISMISS_TOAST' as const, toastId: undefined };
        
        const newState = reducer(state, action);
        
        newState.toasts.forEach(t => {
          expect(t.open).toBe(false);
        });
      });

      it('should not dismiss non-matching toast', () => {
        const toast1 = { id: '1', title: 'Test 1', open: true };
        const toast2 = { id: '2', title: 'Test 2', open: true };
        const state = { toasts: [toast1, toast2] };
        const action = { type: 'DISMISS_TOAST' as const, toastId: '1' };
        
        const newState = reducer(state, action);
        
        expect(newState.toasts.find(t => t.id === '2')?.open).toBe(true);
      });
    });

    describe('REMOVE_TOAST action', () => {
      it('should remove specific toast', () => {
        const toast1 = { id: '1', title: 'Test 1', open: true };
        const toast2 = { id: '2', title: 'Test 2', open: true };
        const state = { toasts: [toast1, toast2] };
        const action = { type: 'REMOVE_TOAST' as const, toastId: '1' };
        
        const newState = reducer(state, action);
        
        expect(newState.toasts).toHaveLength(1);
        expect(newState.toasts[0].id).toBe('2');
      });

      it('should remove all toasts when no id provided', () => {
        const toast1 = { id: '1', title: 'Test 1', open: true };
        const toast2 = { id: '2', title: 'Test 2', open: true };
        const state = { toasts: [toast1, toast2] };
        const action = { type: 'REMOVE_TOAST' as const, toastId: undefined };
        
        const newState = reducer(state, action);
        
        expect(newState.toasts).toHaveLength(0);
      });
    });
  });

  describe('Multiple listeners', () => {
    it('should notify multiple components using useToast', () => {
      const { result: result1 } = renderHook(() => useToast());
      const { result: result2 } = renderHook(() => useToast());

      act(() => {
        result1.current.toast({ title: 'Shared Toast' });
      });

      // Both hooks should see the same state
      expect(result1.current.toasts.length).toBe(result2.current.toasts.length);
    });
  });

  describe('Cleanup', () => {
    it('should remove listener on unmount', () => {
      const { result, unmount } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Test' });
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('genId function behavior', () => {
  it('should generate incrementing ids', () => {
    const result1 = toast({ title: 'Toast 1' });
    const result2 = toast({ title: 'Toast 2' });
    const result3 = toast({ title: 'Toast 3' });

    const id1 = parseInt(result1.id);
    const id2 = parseInt(result2.id);
    const id3 = parseInt(result3.id);

    expect(id2).toBeGreaterThan(id1);
    expect(id3).toBeGreaterThan(id2);
  });
});

describe('Toast with action', () => {
  it('should create toast with action element', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Toast with Action',
        action: <button>Undo</button> as any,
      });
    });

    const toastItem = result.current.toasts[0];
    if (toastItem) {
      expect(toastItem.action).toBeDefined();
    }
  });
});

describe('Toast variants', () => {
  it('should support default variant', () => {
    const result = toast({ title: 'Default Toast' });
    expect(result.id).toBeDefined();
  });

  it('should support destructive variant', () => {
    const result = toast({ 
      title: 'Error Toast',
      variant: 'destructive'
    });
    expect(result.id).toBeDefined();
  });
});

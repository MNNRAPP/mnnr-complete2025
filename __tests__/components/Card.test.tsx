/**
 * Card Component Tests
 * 
 * Created: 2025-12-27 00:31:00 EST
 * Updated: 2025-12-28 - Fixed for dark theme styles
 * Part of 2-hour completion plan - Phase 4
 */

import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-card">Content</Card>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-card');
  });

  it('renders with default dark theme styles', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    // Updated to match dark theme classes
    expect(card).toHaveClass('rounded-lg', 'border', 'shadow-sm');
  });

  it('renders CardHeader correctly', () => {
    render(
      <Card>
        <CardHeader>
          <div>Header content</div>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('renders CardTitle correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders CardDescription correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Card Description')).toBeInTheDocument();
  });

  it('renders CardContent correctly', () => {
    render(
      <Card>
        <CardContent>
          <div>Content area</div>
        </CardContent>
      </Card>
    );
    expect(screen.getByText('Content area')).toBeInTheDocument();
  });

  it('renders CardFooter correctly', () => {
    render(
      <Card>
        <CardFooter>
          <div>Footer content</div>
        </CardFooter>
      </Card>
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('renders complete card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies custom className to CardHeader', () => {
    const { container } = render(
      <Card>
        <CardHeader className="custom-header">Header</CardHeader>
      </Card>
    );
    expect(container.querySelector('.custom-header')).toBeInTheDocument();
  });

  it('applies custom className to CardTitle', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle className="custom-title">Title</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(container.querySelector('.custom-title')).toBeInTheDocument();
  });

  it('applies custom className to CardDescription', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardDescription className="custom-desc">Description</CardDescription>
        </CardHeader>
      </Card>
    );
    expect(container.querySelector('.custom-desc')).toBeInTheDocument();
  });

  it('applies custom className to CardContent', () => {
    const { container } = render(
      <Card>
        <CardContent className="custom-content">Content</CardContent>
      </Card>
    );
    expect(container.querySelector('.custom-content')).toBeInTheDocument();
  });

  it('applies custom className to CardFooter', () => {
    const { container } = render(
      <Card>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>
    );
    expect(container.querySelector('.custom-footer')).toBeInTheDocument();
  });

  it('renders without header', () => {
    render(
      <Card>
        <CardContent>Content only</CardContent>
      </Card>
    );
    expect(screen.getByText('Content only')).toBeInTheDocument();
  });

  it('renders without footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('forwards ref to Card', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref to CardHeader', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(
      <Card>
        <CardHeader ref={ref}>Header</CardHeader>
      </Card>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref to CardContent', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(
      <Card>
        <CardContent ref={ref}>Content</CardContent>
      </Card>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref to CardFooter', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(
      <Card>
        <CardFooter ref={ref}>Footer</CardFooter>
      </Card>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes additional props to Card', () => {
    render(<Card data-testid="test-card">Content</Card>);
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
  });

  it('passes additional props to CardHeader', () => {
    render(
      <Card>
        <CardHeader data-testid="test-header">Header</CardHeader>
      </Card>
    );
    expect(screen.getByTestId('test-header')).toBeInTheDocument();
  });
});

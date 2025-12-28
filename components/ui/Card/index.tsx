import { ReactNode } from 'react';
import cn from 'classnames';

// Original Card component (default export)
interface CardProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Card({ title, description, footer, children }: CardProps) {
  return (
    <div className="w-full max-w-3xl m-auto my-8 border rounded-md p border-zinc-700">
      <div className="px-5 py-4">
        <h3 className="mb-1 text-2xl font-medium">{title}</h3>
        <p className="text-zinc-300">{description}</p>
        {children}
      </div>
      {footer && (
        <div className="p-4 border-t rounded-b-md border-zinc-700 bg-zinc-900 text-zinc-500">
          {footer}
        </div>
      )}
    </div>
  );
}

// Shadcn-style named exports for dashboard
export function CardRoot({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-800 bg-gray-900/50 text-white shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function CardHeaderComponent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
}

export function CardTitleComponent({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  );
}

export function CardDescriptionComponent({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-gray-400', className)}
      {...props}
    />
  );
}

export function CardContentComponent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooterComponent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
}

// Re-export with cleaner names
export { CardRoot as Card };
export { CardHeaderComponent as CardHeader };
export { CardTitleComponent as CardTitle };
export { CardDescriptionComponent as CardDescription };
export { CardContentComponent as CardContent };
export { CardFooterComponent as CardFooter };

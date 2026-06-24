// components/ui/Skeleton.tsx — pulse-animated placeholder block.
//
// Tiny, on purpose. Use it as a building block in Suspense fallbacks:
//
//   <Suspense fallback={<Skeleton className="h-12 w-full" />}>
//     <SomeAsyncThing />
//   </Suspense>

import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-zinc-800/60',
        className,
      )}
      {...rest}
    />
  );
}

export default Skeleton;

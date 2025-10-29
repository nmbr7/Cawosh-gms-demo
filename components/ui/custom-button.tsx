import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'link';
  fullWidth?: boolean;
}

export function CustomButton({
  className,
  variant = 'default',
  fullWidth = true,
  children,
  ...props
}: CustomButtonProps) {
  return (
    <Button
      className={cn('h-12 text-base', fullWidth && 'w-full', className)}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
}

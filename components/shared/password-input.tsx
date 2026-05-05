'use client';

import { useState } from 'react';
import { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          className={cn('pr-10', className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShow(!show)}
          tabIndex={-1}
        >
          {show
            ? <EyeOff className="h-4 w-4 text-muted-foreground" />
            : <Eye className="h-4 w-4 text-muted-foreground" />
          }
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
export { PasswordInput };
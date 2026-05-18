import { GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl' }
  };
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          sizes[size].icon,
          'rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg shadow-primary-600/30 ring-2 ring-white dark:ring-gray-900'
        )}
      >
        <GraduationCap className="text-white" strokeWidth={2.5} size={size === 'sm' ? 18 : size === 'md' ? 22 : 30} />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn(sizes[size].text, 'font-bold bg-gradient-to-r from-primary-700 to-primary-900 dark:from-primary-400 dark:to-primary-200 bg-clip-text text-transparent')}>
            Madrasa TN
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-gray-500 mt-0.5 font-medium tracking-wider">
              🇹🇳 ÉDUCATION TUNISIE
            </span>
          )}
        </div>
      )}
    </div>
  );
}

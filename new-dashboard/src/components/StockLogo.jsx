import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStockLogoUrl, stockAvatarColor, stockInitials } from '@/utils/stockLogo';
import { cn } from '@/lib/utils';

export default function StockLogo({ symbol, name, size = 'md', className }) {
  const [failed, setFailed] = useState(false);
  const hue = stockAvatarColor(symbol);

  useEffect(() => {
    setFailed(false);
  }, [symbol]);

  const sizeClass = size === 'sm' ? 'h-8 w-8 text-[10px]' : size === 'lg' ? 'h-12 w-12 text-sm' : 'h-10 w-10 text-xs';
  const src = symbol && !failed ? getStockLogoUrl(symbol) : '';

  return (
    <Avatar
      className={cn(
        sizeClass,
        'rounded-xl border border-border/60 bg-card shadow-sm transition-transform duration-200 group-hover:scale-105',
        className,
      )}
    >
      {src && (
        <AvatarImage
          src={src}
          alt={`${symbol} logo`}
          className="object-contain p-0.5"
          onError={() => setFailed(true)}
        />
      )}
      <AvatarFallback
        className="rounded-xl font-bold text-white"
        style={{ backgroundColor: `hsl(${hue} 55% 42%)` }}
      >
        {stockInitials(symbol, name)}
      </AvatarFallback>
    </Avatar>
  );
}

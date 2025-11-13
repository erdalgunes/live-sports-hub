'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  fixtureId: number;
  className?: string;
}

export function FavoriteButton({ fixtureId, className }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, loading, error } = useFavorites(fixtureId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      // Could show a login prompt here
      return;
    }
    toggleFavorite();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(
          "h-6 w-6 p-0 hover:bg-transparent",
          isFavorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500",
          loading && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        disabled={loading || !user}
        title={user ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Login required"}
        aria-label={user ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Login required"}
        aria-pressed={user ? isFavorite : undefined}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all",
            isFavorite ? "fill-current" : "stroke-current"
          )}
        />
      </Button>
      {/* Hidden live region for state change announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {user && !loading && (isFavorite ? "Added to favorites" : "Removed from favorites")}
      </div>
    </>
  );
}
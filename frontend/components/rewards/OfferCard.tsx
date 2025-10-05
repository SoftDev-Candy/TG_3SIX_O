'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Gift, Clock, AlertCircle } from 'lucide-react';
import { Offer } from '@/types';
import { cn } from '@/lib/utils';

interface OfferCardProps {
  offer: Offer;
  userPoints: number;
  onRedeem: (offer: Offer) => void;
  disabled?: boolean;
}

export default function OfferCard({ offer, userPoints, onRedeem, disabled = false }: OfferCardProps) {
  const canAfford = userPoints >= offer.pointsCost;
  const isAvailable = offer.isActive && (offer.stockAvailable === null || offer.stockAvailable > 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transit':
        return 'bg-blue-100 text-blue-800';
      case 'food':
        return 'bg-orange-100 text-orange-800';
      case 'entertainment':
        return 'bg-purple-100 text-purple-800';
      case 'shopping':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconClass = 'h-4 w-4';
    switch (category) {
      case 'transit':
        return '🚍';
      case 'food':
        return '🍽️';
      case 'entertainment':
        return '🎭';
      case 'shopping':
        return '🛍️';
      default:
        return '🎁';
    }
  };

  return (
    <Card className={cn(
      'flex flex-col h-full transition-all hover:shadow-lg',
      !isAvailable && 'opacity-60',
      !canAfford && 'opacity-80'
    )}>
      {/* Image Section */}
      {offer.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img 
            src={offer.imageUrl} 
            alt={offer.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge className={getCategoryColor(offer.category)}>
              <span className="mr-1">{getCategoryIcon(offer.category)}</span>
              {offer.category}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        {/* Partner Info */}
        <div className="flex items-center gap-2 mb-2">
          {offer.partnerLogo ? (
            <img 
              src={offer.partnerLogo} 
              alt={offer.partnerName}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <Gift className="h-5 w-5 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">{offer.partnerName}</span>
        </div>

        {/* Offer Title */}
        <CardTitle className="text-lg line-clamp-2">{offer.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Description */}
        <CardDescription className="line-clamp-3 text-sm">
          {offer.description}
        </CardDescription>

        {/* Stock Info */}
        {offer.stockAvailable !== null && (
          <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
            <AlertCircle className="h-4 w-4" />
            {offer.stockAvailable > 0 ? (
              <span>{offer.stockAvailable} available</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>
        )}

        {/* Expiry Info */}
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Expires {offer.expiryDays} days after redemption</span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t">
        {/* Points Cost */}
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="text-xl font-bold">{offer.pointsCost}</span>
          <span className="text-sm text-gray-500">pts</span>
        </div>

        {/* Redeem Button */}
        <Button
          onClick={() => onRedeem(offer)}
          disabled={disabled || !canAfford || !isAvailable}
          className={cn(
            'min-w-[100px]',
            canAfford && isAvailable && 'bg-green-600 hover:bg-green-700'
          )}
        >
          {!isAvailable ? 'Unavailable' : !canAfford ? 'Not Enough' : 'Redeem'}
        </Button>
      </CardFooter>

      {/* Insufficient Points Warning */}
      {!canAfford && isAvailable && (
        <div className="px-4 pb-3 text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Need {offer.pointsCost - userPoints} more points</span>
        </div>
      )}
    </Card>
  );
}

// Compact variant for lists
export function CompactOfferCard({ offer, userPoints, onRedeem, disabled = false }: OfferCardProps) {
  const canAfford = userPoints >= offer.pointsCost;
  const isAvailable = offer.isActive && (offer.stockAvailable === null || offer.stockAvailable > 0);

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      !isAvailable && 'opacity-60',
      !canAfford && 'opacity-80'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon/Image */}
          <div className="flex-shrink-0">
            {offer.partnerLogo ? (
              <img 
                src={offer.partnerLogo} 
                alt={offer.partnerName}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Gift className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm line-clamp-1">{offer.title}</h4>
            <p className="text-xs text-gray-600 line-clamp-1">{offer.partnerName}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-sm font-bold">{offer.pointsCost}</span>
              </div>
              {offer.stockAvailable !== null && offer.stockAvailable > 0 && (
                <span className="text-xs text-gray-500">
                  {offer.stockAvailable} left
                </span>
              )}
            </div>
          </div>

          {/* Redeem Button */}
          <Button
            size="sm"
            onClick={() => onRedeem(offer)}
            disabled={disabled || !canAfford || !isAvailable}
            className={cn(
              canAfford && isAvailable && 'bg-green-600 hover:bg-green-700'
            )}
          >
            Redeem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

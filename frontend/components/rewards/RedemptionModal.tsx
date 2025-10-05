'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Gift, Clock, Copy, Check, X } from 'lucide-react';
import { Offer, Redemption } from '@/types';
import { cn } from '@/lib/utils';
import QRCode from 'qrcode';
import { useEffect } from 'react';

interface RedemptionModalProps {
  offer: Offer | null;
  userPoints: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (offer: Offer) => Promise<Redemption | null>;
}

export default function RedemptionModal({
  offer,
  userPoints,
  isOpen,
  onClose,
  onConfirm,
}: RedemptionModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemption, setRedemption] = useState<Redemption | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Reset state when modal closes or offer changes
  useEffect(() => {
    if (!isOpen) {
      setAcceptedTerms(false);
      setRedemption(null);
      setQrCodeUrl('');
      setCopied(false);
    }
  }, [isOpen]);

  // Generate QR code when redemption code is available
  useEffect(() => {
    if (redemption?.code) {
      QRCode.toDataURL(redemption.code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [redemption]);

  if (!offer) return null;

  const newBalance = userPoints - offer.pointsCost;

  const handleConfirmRedemption = async () => {
    if (!acceptedTerms) return;
    
    setIsRedeeming(true);
    try {
      const result = await onConfirm(offer);
      if (result) {
        setRedemption(result);
      }
    } catch (error) {
      console.error('Redemption failed:', error);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCopyCode = async () => {
    if (redemption?.code) {
      await navigator.clipboard.writeText(redemption.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Success screen after redemption
  if (redemption) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Redemption Successful! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Your coupon is ready to use
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <img src={qrCodeUrl} alt="Redemption QR Code" className="w-64 h-64" />
                </div>
              </div>
            )}

            {/* Redemption Code */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Your Coupon Code</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-2xl font-mono font-bold tracking-wider">
                  {redemption.code}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyCode}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Offer Details */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">{offer.title}</h4>
              <p className="text-sm text-gray-600">{offer.partnerName}</p>
              
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium">
                  {new Date(redemption.expiresAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                How to Use
              </h5>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Show this QR code or coupon code at {offer.partnerName}</li>
                <li>Valid until {new Date(redemption.expiresAt).toLocaleDateString()}</li>
                <li>Cannot be combined with other offers</li>
                <li>One-time use only</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button onClick={handleClose} className="w-full sm:w-auto">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation screen
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Confirm Redemption
          </DialogTitle>
          <DialogDescription>
            Review the details before redeeming your points
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Offer Info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            {offer.partnerLogo ? (
              <img 
                src={offer.partnerLogo} 
                alt={offer.partnerName}
                className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Gift className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold line-clamp-2">{offer.title}</h4>
              <p className="text-sm text-gray-600">{offer.partnerName}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {offer.description}
              </p>
            </div>
          </div>

          {/* Points Transaction */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Points Cost:</span>
              <div className="flex items-center gap-1 text-red-600">
                <span className="font-bold">-{offer.pointsCost}</span>
                <Star className="h-4 w-4" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Balance:</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{userPoints}</span>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm font-semibold">New Balance:</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg">{newBalance}</span>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Coupon expires {offer.expiryDays} days after redemption</span>
          </div>

          {/* Terms & Conditions */}
          {offer.termsAndConditions && (
            <div className="border rounded-lg p-3">
              <h5 className="text-sm font-semibold mb-2">Terms & Conditions</h5>
              <p className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                {offer.termsAndConditions}
              </p>
            </div>
          )}

          {/* Acceptance Checkbox */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="terms"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I understand that this redemption is final and cannot be reversed. 
              The points will be deducted from my account immediately.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRedeeming}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRedemption}
            disabled={!acceptedTerms || isRedeeming}
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
          >
            {isRedeeming ? 'Redeeming...' : 'Confirm Redemption'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

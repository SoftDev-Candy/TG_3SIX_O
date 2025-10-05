'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Clock, CheckCircle, XCircle, Eye, Copy, Check } from 'lucide-react';
import { Redemption, RedemptionStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QRCode from 'qrcode';
import { useEffect } from 'react';

interface RedemptionHistoryProps {
  redemptions: Redemption[];
  loading?: boolean;
}

export default function RedemptionHistory({ redemptions, loading = false }: RedemptionHistoryProps) {
  const [activeTab, setActiveTab] = useState<RedemptionStatus | 'all'>('all');
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate QR code when viewing a redemption
  useEffect(() => {
    if (selectedRedemption?.code) {
      QRCode.toDataURL(selectedRedemption.code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then(setQrCodeUrl)
        .catch(console.error);
    } else {
      setQrCodeUrl('');
    }
  }, [selectedRedemption]);

  const filterRedemptions = (status: RedemptionStatus | 'all') => {
    if (status === 'all') return redemptions;
    return redemptions.filter(r => r.status === status);
  };

  const getStatusBadge = (status: RedemptionStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'used':
        return <Badge className="bg-blue-100 text-blue-800">Used</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
    }
  };

  const getStatusIcon = (status: RedemptionStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'used':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRedemptions = filterRedemptions(activeTab);
  const activeCoupons = redemptions.filter(r => r.status === 'active').length;
  const usedCoupons = redemptions.filter(r => r.status === 'used').length;
  const expiredCoupons = redemptions.filter(r => r.status === 'expired').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Redemption History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (redemptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Redemption History</CardTitle>
          <CardDescription>Your redeemed coupons will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No redemptions yet</p>
            <p className="text-sm text-gray-400">
              Start earning points and redeem exciting offers!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Redemption History
          </CardTitle>
          <CardDescription>
            View and manage your redeemed coupons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RedemptionStatus | 'all')}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">
                All ({redemptions.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeCoupons})
              </TabsTrigger>
              <TabsTrigger value="used">
                Used ({usedCoupons})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired ({expiredCoupons})
              </TabsTrigger>
            </TabsList>

            <div className="space-y-3">
              {filteredRedemptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No {activeTab !== 'all' && activeTab} coupons</p>
                </div>
              ) : (
                filteredRedemptions.map((redemption) => (
                  <Card key={redemption.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Partner Logo/Icon */}
                        <div className="flex-shrink-0">
                          {redemption.offer.partnerLogo ? (
                            <img 
                              src={redemption.offer.partnerLogo} 
                              alt={redemption.offer.partnerName}
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
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {redemption.offer.title}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {redemption.offer.partnerName}
                              </p>
                            </div>
                            {getStatusBadge(redemption.status)}
                          </div>

                          {/* Redemption Details */}
                          <div className="space-y-1 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Redeemed {formatDistanceToNow(new Date(redemption.redeemedAt), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {redemption.status === 'active' && (
                                <>
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Expires {formatDistanceToNow(new Date(redemption.expiresAt), { addSuffix: true })}
                                  </span>
                                </>
                              )}
                              {redemption.status === 'used' && redemption.usedAt && (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  <span>
                                    Used {formatDistanceToNow(new Date(redemption.usedAt), { addSuffix: true })}
                                  </span>
                                </>
                              )}
                              {redemption.status === 'expired' && (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  <span>
                                    Expired on {new Date(redemption.expiresAt).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-amber-600">
                              <span className="font-medium">-{redemption.pointsSpent} points</span>
                            </div>
                          </div>

                          {/* Actions */}
                          {redemption.status === 'active' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRedemption(redemption)}
                                className="flex-1"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Code
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyCode(redemption.code)}
                                className="px-3"
                              >
                                {copied ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Redemption Detail Modal */}
      <Dialog open={!!selectedRedemption} onOpenChange={() => setSelectedRedemption(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedRedemption && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Coupon Details
                </DialogTitle>
                <DialogDescription>
                  Show this code at the partner location
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
                  <p className="text-sm text-gray-600 mb-2">Coupon Code</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-2xl font-mono font-bold tracking-wider">
                      {selectedRedemption.code}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyCode(selectedRedemption.code)}
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

                {/* Offer Info */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">{selectedRedemption.offer.title}</h4>
                  <p className="text-sm text-gray-600">{selectedRedemption.offer.partnerName}</p>
                  
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">
                      {new Date(selectedRedemption.expiresAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(selectedRedemption.status)}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">How to Use</h5>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Show this QR code or coupon code at {selectedRedemption.offer.partnerName}</li>
                    <li>Valid until {new Date(selectedRedemption.expiresAt).toLocaleDateString()}</li>
                    <li>Cannot be combined with other offers</li>
                    <li>One-time use only</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Compact variant for profile page
export function CompactRedemptionHistory({ redemptions }: { redemptions: Redemption[] }) {
  const activeCoupons = redemptions.filter(r => r.status === 'active');

  if (activeCoupons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">No active coupons</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Active Coupons</span>
          <Badge>{activeCoupons.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeCoupons.slice(0, 3).map((redemption) => (
            <div key={redemption.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Gift className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">
                  {redemption.offer.title}
                </p>
                <p className="text-xs text-gray-500">
                  Expires {formatDistanceToNow(new Date(redemption.expiresAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {activeCoupons.length > 3 && (
            <p className="text-xs text-gray-500 text-center pt-2">
              +{activeCoupons.length - 3} more
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

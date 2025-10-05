'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import OfferCard from '@/components/rewards/OfferCard';
import RedemptionModal from '@/components/rewards/RedemptionModal';
import RedemptionHistory from '@/components/rewards/RedemptionHistory';
import { apiClient } from '@/lib/api-client';
import { Offer, OfferCategory, Redemption } from '@/types';
import { 
  Gift, 
  Star, 
  Search, 
  TrendingUp,
  Bus,
  Utensils,
  Film,
  ShoppingBag,
  Sparkles,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function RewardsPage() {
  const { user, refreshUser } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<OfferCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'points-low' | 'points-high' | 'newest'>('points-low');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load offers
      const offersResult = await apiClient.getOffers();
      if (offersResult.success && offersResult.data) {
        setOffers(offersResult.data);
      }

      // Load redemptions
      const redemptionsResult = await apiClient.getUserRedemptions(user.id);
      if (redemptionsResult.success && redemptionsResult.data) {
        setRedemptions(redemptionsResult.data);
      }
    } catch (error) {
      console.error('Failed to load rewards data:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleConfirmRedemption = async (offer: Offer): Promise<Redemption | null> => {
    if (!user) return null;

    try {
      const result = await apiClient.redeemOffer(offer.id, user.id);
      
      if (result.success && result.data) {
        // Trigger confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Show success toast
        toast.success('Redemption Successful! 🎉', {
          description: `You've redeemed ${offer.title}`,
        });

        // Refresh user data (points will be deducted)
        await refreshUser();
        
        // Reload redemptions
        await loadData();

        return result.data;
      } else {
        toast.error('Redemption failed', {
          description: result.error || 'Please try again',
        });
        return null;
      }
    } catch (error) {
      console.error('Redemption error:', error);
      toast.error('Redemption failed', {
        description: 'An unexpected error occurred',
      });
      return null;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOffer(null);
  };

  // Filter and sort offers
  const filteredOffers = offers
    .filter(offer => {
      // Category filter
      if (activeCategory !== 'all' && offer.category !== activeCategory) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          offer.title.toLowerCase().includes(query) ||
          offer.description.toLowerCase().includes(query) ||
          offer.partnerName.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'points-low':
          return a.pointsCost - b.pointsCost;
        case 'points-high':
          return b.pointsCost - a.pointsCost;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const categories = [
    { value: 'all', label: 'All Offers', icon: Gift, count: offers.length },
    { value: 'transit', label: 'Transit', icon: Bus, count: offers.filter(o => o.category === 'transit').length },
    { value: 'food', label: 'Food', icon: Utensils, count: offers.filter(o => o.category === 'food').length },
    { value: 'entertainment', label: 'Entertainment', icon: Film, count: offers.filter(o => o.category === 'entertainment').length },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag, count: offers.filter(o => o.category === 'shopping').length },
  ];

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-2xl font-bold text-gray-900">Rewards Marketplace</h2>
            <p className="text-gray-600">Sign in to redeem points for exclusive offers</p>
            <div className="flex gap-3 justify-center mt-6">
              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-yellow-500" />
                Rewards Marketplace
              </h1>
              <p className="text-gray-600 mt-1">Redeem your points for exclusive offers</p>
            </div>
            
            {/* Points Balance */}
            <Card className="sm:w-auto">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{user.points}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Gift className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                <div className="text-xl font-bold">{offers.length}</div>
                <div className="text-xs text-gray-500">Available Offers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 mx-auto mb-1 text-green-600" />
                <div className="text-xl font-bold">
                  {redemptions.filter(r => r.status === 'active').length}
                </div>
                <div className="text-xs text-gray-500">Active Coupons</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                <div className="text-xl font-bold">{redemptions.length}</div>
                <div className="text-xs text-gray-500">Total Redeemed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
                <div className="text-xl font-bold">
                  {redemptions.reduce((sum, r) => sum + r.pointsSpent, 0)}
                </div>
                <div className="text-xs text-gray-500">Points Spent</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="offers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offers">Browse Offers</TabsTrigger>
            <TabsTrigger value="history">My Coupons</TabsTrigger>
          </TabsList>

          {/* Browse Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search offers, partners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.value;
                    return (
                      <Button
                        key={cat.value}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(cat.value as OfferCategory | 'all')}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {cat.label}
                        <Badge variant="secondary" className="ml-1">
                          {cat.count}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <div className="flex gap-2">
                    <Button
                      variant={sortBy === 'points-low' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('points-low')}
                    >
                      Points: Low to High
                    </Button>
                    <Button
                      variant={sortBy === 'points-high' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('points-high')}
                    >
                      Points: High to Low
                    </Button>
                    <Button
                      variant={sortBy === 'newest' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('newest')}
                    >
                      Newest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offers Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredOffers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No offers found</p>
                  <p className="text-sm text-gray-400">
                    {searchQuery || activeCategory !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Check back soon for new offers!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    userPoints={user.points}
                    onRedeem={handleRedeemClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Coupons Tab */}
          <TabsContent value="history">
            <RedemptionHistory redemptions={redemptions} loading={loading} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Redemption Modal */}
      <RedemptionModal
        offer={selectedOffer}
        userPoints={user.points}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRedemption}
      />
    </div>
  );
}

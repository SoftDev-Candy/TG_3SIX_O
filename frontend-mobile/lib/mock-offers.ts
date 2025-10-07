import { Offer, Redemption, OfferCategory } from '@/types';

// Mock partner offers for demonstration
export const mockOffers: Offer[] = [
  // Transit Discounts
  {
    id: 'offer-1',
    partnerId: 'partner-mpk',
    partnerName: 'MPK Kraków',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=mpk',
    title: '10% off Monthly Transit Pass',
    description: 'Get 10% discount on your next monthly public transit pass. Valid for all MPK Kraków services including trams and buses.',
    category: 'transit' as OfferCategory,
    pointsCost: 500,
    termsAndConditions: 'Valid for one purchase of a monthly pass. Cannot be combined with other discounts. Must be redeemed at MPK ticket office or mobile app within 30 days.',
    stockAvailable: 50,
    expiryDays: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop',
  },
  {
    id: 'offer-2',
    partnerId: 'partner-mpk',
    partnerName: 'MPK Kraków',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=mpk',
    title: 'Free Single Ride Ticket',
    description: 'One complimentary single ride ticket for any MPK bus or tram line in Kraków.',
    category: 'transit' as OfferCategory,
    pointsCost: 150,
    termsAndConditions: 'Valid for one ride within 60 minutes. Standard fare rules apply. Must be activated before boarding.',
    stockAvailable: 200,
    expiryDays: 14,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
  },
  {
    id: 'offer-3',
    partnerId: 'partner-mpk',
    partnerName: 'MPK Kraków',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=mpk',
    title: 'Weekend Pass - 20% Discount',
    description: 'Weekend unlimited travel pass at 20% off regular price. Valid Saturday and Sunday.',
    category: 'transit' as OfferCategory,
    pointsCost: 300,
    termsAndConditions: 'Valid for one weekend (48 hours from activation). Covers all MPK lines. Non-transferable.',
    stockAvailable: 100,
    expiryDays: 21,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
  },

  // Food & Beverage
  {
    id: 'offer-4',
    partnerId: 'partner-cafe-mlynek',
    partnerName: 'Café Młynek',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=cafemlynek',
    title: 'Free Coffee or Tea',
    description: 'Enjoy a complimentary coffee or tea of your choice at Café Młynek, a popular spot near the main square.',
    category: 'food' as OfferCategory,
    pointsCost: 200,
    termsAndConditions: 'Valid for one hot beverage (coffee or tea). Not valid with other promotions. Dine-in only.',
    stockAvailable: 75,
    expiryDays: 14,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
  },
  {
    id: 'offer-5',
    partnerId: 'partner-pizza-garden',
    partnerName: 'Pizza Garden',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=pizzagarden',
    title: '20% off Your Order',
    description: 'Get 20% discount on your entire order at Pizza Garden. Fresh Italian pizza made with authentic ingredients.',
    category: 'food' as OfferCategory,
    pointsCost: 250,
    termsAndConditions: 'Valid for dine-in and takeout. Minimum order 30 PLN. Cannot be combined with other offers.',
    stockAvailable: 60,
    expiryDays: 21,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  },
  {
    id: 'offer-6',
    partnerId: 'partner-pierogi-place',
    partnerName: 'Pierogi Place',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=pierogiplace',
    title: 'Buy 1 Get 1 Free - Pierogi',
    description: 'Buy one portion of traditional Polish pierogi and get another portion free! Try authentic homemade flavors.',
    category: 'food' as OfferCategory,
    pointsCost: 300,
    termsAndConditions: 'Second portion must be of equal or lesser value. Dine-in only. One coupon per table.',
    stockAvailable: 40,
    expiryDays: 14,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=300&fit=crop',
  },

  // Entertainment
  {
    id: 'offer-7',
    partnerId: 'partner-cinema-city',
    partnerName: 'Cinema City Kraków',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=cinema',
    title: '2-for-1 Movie Tickets',
    description: 'Buy one movie ticket and get the second one free! Valid for all standard screenings.',
    category: 'entertainment' as OfferCategory,
    pointsCost: 400,
    termsAndConditions: 'Valid for 2D screenings only. Subject to availability. Not valid for premium seats or special events.',
    stockAvailable: 30,
    expiryDays: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
  },
  {
    id: 'offer-8',
    partnerId: 'partner-national-museum',
    partnerName: 'National Museum Kraków',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=museum',
    title: 'Museum Entry - 50% off',
    description: 'Discover Polish art and history with 50% discount on museum entry. Includes all permanent exhibitions.',
    category: 'entertainment' as OfferCategory,
    pointsCost: 350,
    termsAndConditions: 'Valid for one adult entry. Includes permanent collections. Special exhibitions may require additional fee.',
    stockAvailable: null, // unlimited
    expiryDays: 60,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=300&fit=crop',
  },

  // Shopping
  {
    id: 'offer-9',
    partnerId: 'partner-cloth-hall',
    partnerName: 'Sukiennice Market',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=market',
    title: '15% off Souvenirs',
    description: 'Get 15% discount on traditional Polish souvenirs and handicrafts at the historic Cloth Hall.',
    category: 'shopping' as OfferCategory,
    pointsCost: 180,
    termsAndConditions: 'Valid at participating vendors in Sukiennice. Minimum purchase 50 PLN. Show coupon before payment.',
    stockAvailable: null,
    expiryDays: 45,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
  },
  {
    id: 'offer-10',
    partnerId: 'partner-bookstore',
    partnerName: 'Massolit Books',
    partnerLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=books',
    title: '10% off Any Book',
    description: 'Support local bookstores! Get 10% off any book at Massolit, an English-language bookshop and café.',
    category: 'shopping' as OfferCategory,
    pointsCost: 220,
    termsAndConditions: 'Valid for one book purchase. Cannot be combined with sale items. Not valid for gift cards.',
    stockAvailable: null,
    expiryDays: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop',
  },
];

// Function to generate realistic redemption code
export function generateRedemptionCode(): string {
  const prefix = 'TG360';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `${prefix}-${code}`;
}

// Mock redemptions storage (in-memory for demo)
let mockRedemptions: Redemption[] = [];

export function getMockRedemptions(userId: string): Redemption[] {
  return mockRedemptions.filter(r => r.userId === userId);
}

export function addMockRedemption(userId: string, offer: Offer): Redemption {
  const redemption: Redemption = {
    id: `redemption-${Date.now()}`,
    userId,
    offerId: offer.id,
    offer,
    code: generateRedemptionCode(),
    redeemedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + offer.expiryDays * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    pointsSpent: offer.pointsCost,
  };
  
  mockRedemptions.push(redemption);
  return redemption;
}

export function markRedemptionAsUsed(redemptionId: string): boolean {
  const redemption = mockRedemptions.find(r => r.id === redemptionId);
  if (redemption && redemption.status === 'active') {
    redemption.status = 'used';
    redemption.usedAt = new Date().toISOString();
    return true;
  }
  return false;
}

// Seed some demo redemptions for testing
export function seedMockRedemptions(userId: string) {
  // Add a couple of active redemptions
  const activeOffer1 = mockOffers.find(o => o.id === 'offer-2'); // Free ride
  const activeOffer2 = mockOffers.find(o => o.id === 'offer-4'); // Free coffee
  
  if (activeOffer1) {
    mockRedemptions.push({
      id: 'redemption-demo-1',
      userId,
      offerId: activeOffer1.id,
      offer: activeOffer1,
      code: 'TG360-ABC123',
      redeemedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
      status: 'active',
      pointsSpent: activeOffer1.pointsCost,
    });
  }
  
  if (activeOffer2) {
    mockRedemptions.push({
      id: 'redemption-demo-2',
      userId,
      offerId: activeOffer2.id,
      offer: activeOffer2,
      code: 'TG360-XYZ789',
      redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      expiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
      status: 'active',
      pointsSpent: activeOffer2.pointsCost,
    });
  }
  
  // Add a used redemption
  const usedOffer = mockOffers.find(o => o.id === 'offer-6'); // Pierogi
  if (usedOffer) {
    mockRedemptions.push({
      id: 'redemption-demo-3',
      userId,
      offerId: usedOffer.id,
      offer: usedOffer,
      code: 'TG360-DEF456',
      redeemedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      expiresAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // expired 6 days ago
      usedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // used 15 days ago
      status: 'used',
      pointsSpent: usedOffer.pointsCost,
    });
  }
}

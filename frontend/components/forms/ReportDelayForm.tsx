'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, MapPin, AlertTriangle, Upload, X, Search, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Removed Select components - using native HTML select instead
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateReportInput, TransportType, Severity, DelayCategory, Location } from '@/types';
import { searchLocations, getLocationIcon, type MockLocation } from '@/lib/mock-locations';

const reportSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    stopName: z.string().optional(),
    address: z.string().optional(),
  }),
  transportType: z.enum(['bus', 'tram', 'train', 'metro']),
  line: z.string().min(1, 'Line number/name is required'),
  vehicleNumber: z.string().optional(), // Validated conditionally in refinement
  severity: z.enum(['minor', 'moderate', 'severe']),
  category: z.enum(['mechanical', 'signal', 'weather', 'accident', 'crowding', 'staff_shortage', 'other']),
  description: z.string().min(10, 'Please provide more details (minimum 10 characters)'),
}).refine(
  (data) => {
    // Vehicle number is mandatory for bus and tram
    if (data.transportType === 'bus' || data.transportType === 'tram') {
      return data.vehicleNumber && data.vehicleNumber.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Vehicle number is required for buses and trams',
    path: ['vehicleNumber'],
  }
);

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportDelayFormProps {
  onSubmit: (data: CreateReportInput) => Promise<void>;
  isSubmitting?: boolean;
  initialLocation?: Location;
}

const transportTypeOptions: { value: TransportType; label: string; icon: string; disabled?: boolean; disabledReason?: string }[] = [
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'tram', label: 'Tram', icon: '🚋' },
  { value: 'train', label: 'Train', icon: '🚆' },
  { value: 'metro', label: 'Metro', icon: '🚇', disabled: true, disabledReason: 'Coming soon' },
];

const severityOptions: { value: Severity; label: string; color: string }[] = [
  { value: 'minor', label: 'Minor (5-15 min)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'moderate', label: 'Moderate (15-30 min)', color: 'bg-orange-100 text-orange-800' },
  { value: 'severe', label: 'Severe (30+ min)', color: 'bg-red-100 text-red-800' },
];

const categoryOptions: { value: DelayCategory; label: string }[] = [
  { value: 'mechanical', label: '🔧 Mechanical Issue' },
  { value: 'signal', label: '🚦 Signal Problem' },
  { value: 'weather', label: '🌧️ Weather Related' },
  { value: 'accident', label: '🚗 Traffic Accident' },
  { value: 'crowding', label: '👥 Overcrowding' },
  { value: 'staff_shortage', label: '👷 Staff Shortage' },
  { value: 'other', label: '❓ Other' },
];

export default function ReportDelayForm({ onSubmit, isSubmitting = false, initialLocation }: ReportDelayFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(initialLocation || null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Manual location search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MockLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    mode: 'onChange',
    defaultValues: {
      location: initialLocation || undefined,
    },
  });

  const watchedSeverity = watch('severity');
  const watchedTransportType = watch('transportType');

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Try to get address from coordinates (reverse geocoding)
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address,poi`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          location.address = data.features[0].place_name;
        }
      } catch (error) {
        console.warn('Failed to get address from coordinates:', error);
      }

      setCurrentLocation(location);
      setValue('location', location);
    } catch (error) {
      console.error('Failed to get location:', error);
      
      // DEVELOPMENT FALLBACK: Use Tauron Arena, Kraków as default location
      const fallbackLocation: Location = {
        lat: 50.067472,
        lng: 19.991694,
        address: 'Tauron Arena, Kraków',
        stopName: 'Location Detected',
      };
      
      console.warn('🚧 Using development fallback location (Tauron Arena):', fallbackLocation);
      setCurrentLocation(fallbackLocation);
      setValue('location', fallbackLocation);
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please ensure all files are images under 5MB.');
    }

    setPhotos(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 photos
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Handle manual location search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }
    
    // Show searching indicator
    setIsSearching(true);
    setShowSuggestions(true);
    
    // Debounce search (300ms) with artificial processing time
    searchTimeoutRef.current = setTimeout(() => {
      const results = searchLocations(query);
      
      // Add a small delay to show the loading indicator (makes it feel responsive)
      setTimeout(() => {
        setSearchResults(results);
        setIsSearching(false);
      }, 150); // 150ms artificial delay for "processing" feel
    }, 300);
  };
  
  // Select a location from suggestions
  const selectLocation = (mockLoc: MockLocation) => {
    const location: Location = {
      lat: mockLoc.lat,
      lng: mockLoc.lng,
      address: mockLoc.address,
      stopName: mockLoc.name,
    };
    
    setCurrentLocation(location);
    setValue('location', location);
    setSearchQuery(mockLoc.name);
    setShowSuggestions(false);
    setSearchResults([]);
  };

  const onFormSubmit = async (data: ReportFormData) => {
    const submitData: CreateReportInput = {
      ...data,
      photos: photos.length > 0 ? photos : undefined,
    };
    
    await onSubmit(submitData);
  };

  useEffect(() => {
    if (!initialLocation && 'geolocation' in navigator) {
      getCurrentLocation();
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [initialLocation]);

  // Quick fill for demo/testing
  const handleQuickFill = () => {
    const demoScenarios = [
      {
        location: {
          lat: 50.0614,
          lng: 19.9372,
          address: 'Main Square, Kraków',
          stopName: 'Rynek Główny',
        },
        transportType: 'tram' as TransportType,
        line: '8',
        vehicleNumber: 'NG2341',
        severity: 'moderate' as Severity,
        category: 'mechanical' as DelayCategory,
        description: 'Tram stuck at Main Square due to door malfunction. Passengers being transferred to next tram.',
      },
      {
        location: {
          lat: 50.067472,
          lng: 19.991694,
          address: 'Tauron Arena, Kraków',
          stopName: 'Tauron Arena',
        },
        transportType: 'tram' as TransportType,
        line: '52',
        vehicleNumber: 'EU1889',
        severity: 'severe' as Severity,
        category: 'signal' as DelayCategory,
        description: 'Signal failure at Tauron Arena intersection. Multiple trams backing up in both directions.',
      },
      {
        location: {
          lat: 50.0778,
          lng: 19.8956,
          address: 'AGH University, Kraków',
          stopName: 'AGH Dworzec',
        },
        transportType: 'bus' as TransportType,
        line: '194',
        vehicleNumber: 'EY3983',
        severity: 'minor' as Severity,
        category: 'crowding' as DelayCategory,
        description: 'Bus extremely crowded during rush hour. Standing room only, some passengers waiting for next bus.',
      },
      {
        location: {
          lat: 50.0677,
          lng: 19.9445,
          address: 'Kraków Główny Station',
          stopName: 'Dworzec Główny',
        },
        transportType: 'train' as TransportType,
        line: 'S1',
        vehicleNumber: '',
        severity: 'moderate' as Severity,
        category: 'weather' as DelayCategory,
        description: 'Train delayed due to heavy rain affecting track conditions. Expected 15-20 minute delay.',
      },
    ];

    // Pick random scenario
    const scenario = demoScenarios[Math.floor(Math.random() * demoScenarios.length)];

    // Fill form
    setValue('location', scenario.location);
    setValue('transportType', scenario.transportType);
    setValue('line', scenario.line);
    if (scenario.vehicleNumber) {
      setValue('vehicleNumber', scenario.vehicleNumber);
    }
    setValue('severity', scenario.severity);
    setValue('category', scenario.category);
    setValue('description', scenario.description);
    
    setCurrentLocation(scenario.location);
    setSearchQuery(scenario.location.stopName || scenario.location.address || '');
    
    console.log('📝 Quick-filled with demo data:', scenario);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Delay
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleQuickFill}
            className="gap-2 text-xs"
          >
            <Zap className="h-3 w-3" />
            Quick Fill
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Location Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Location</Label>
            
            {/* Quick GPS Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="w-full h-12 justify-start"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {locationLoading ? 'Getting location...' : 'Use My Location (GPS)'}
            </Button>
            
            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or search manually</span>
              </div>
            </div>
            
            {/* Manual Search Input */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search location (e.g., Dworzec, Wawel, Rondo...)"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                  className="h-12 pl-9 pr-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
              
              {/* Autosuggest Dropdown */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => selectLocation(location)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0 mt-0.5">
                          {getLocationIcon(location.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900">
                            {location.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {location.address}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {location.lines.slice(0, 4).map((line, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                              >
                                {line}
                              </span>
                            ))}
                            {location.lines.length > 4 && (
                              <span className="inline-block px-1.5 py-0.5 text-xs text-gray-500">
                                +{location.lines.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* No results message */}
              {showSuggestions && !isSearching && searchResults.length === 0 && searchQuery.trim().length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                  No locations found. Try a different search term.
                </div>
              )}
            </div>
            
            {/* Selected Location Display */}
            {currentLocation && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 text-sm">
                  <div className="font-medium text-green-900">
                    {currentLocation.stopName || 'Selected Location'}
                  </div>
                  <div className="text-green-700 text-xs">
                    {currentLocation.address || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
                  </div>
                </div>
              </div>
            )}
            
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Transport Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Transport Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {transportTypeOptions.map((option) => (
                <div key={option.value} className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-12 w-full flex flex-col items-center justify-center gap-1 ${
                      option.disabled ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                    onClick={() => !option.disabled && setValue('transportType', option.value)}
                    disabled={option.disabled}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-xs">{option.label}</span>
                  </Button>
                  {option.disabled && option.disabledReason && (
                    <div className="absolute -bottom-5 left-0 right-0 text-center">
                      <span className="text-[10px] text-gray-500">{option.disabledReason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.transportType && (
              <p className="text-sm text-red-600 mt-6">{errors.transportType.message}</p>
            )}
          </div>

          {/* Line Number */}
          <div className="space-y-2">
            <Label htmlFor="line" className="text-sm font-medium">Line Number/Name</Label>
            <Input
              id="line"
              placeholder="e.g., 8, 194, S1"
              {...register('line')}
              className="h-12"
            />
            {errors.line && (
              <p className="text-sm text-red-600">{errors.line.message}</p>
            )}
          </div>

          {/* Vehicle Number (Bus/Tram only) */}
          {(watchedTransportType === 'bus' || watchedTransportType === 'tram') && (
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber" className="text-sm font-medium">
                Vehicle Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vehicleNumber"
                placeholder="e.g., EY3983, NG2341"
                {...register('vehicleNumber')}
                className="h-12"
                required
              />
              <p className="text-xs text-gray-500">
                The specific {watchedTransportType} number shown on the vehicle (mandatory for accurate reporting)
              </p>
              {errors.vehicleNumber && (
                <p className="text-sm text-red-600">{errors.vehicleNumber.message}</p>
              )}
            </div>
          )}

          {/* Severity */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Severity</Label>
            <div className="space-y-2">
              {severityOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`w-full justify-start h-12 ${
                    watchedSeverity === option.value ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setValue('severity', option.value)}
                >
                  <Badge className={`mr-2 ${option.color}`}>
                    {option.label}
                  </Badge>
                </Button>
              ))}
            </div>
            {errors.severity && (
              <p className="text-sm text-red-600">{errors.severity.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Issue Category</Label>
            <select
              {...register('category')}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            >
              <option value="">Select issue type</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you're seeing... (e.g., 'Bus broke down at Main St stop, passengers being transferred')"
              {...register('description')}
              className="min-h-20 resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Photo Upload - Mobile-First */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Photos (Optional) 
              {photos.length > 0 && <span className="text-gray-500 ml-2">{photos.length}/3</span>}
            </Label>
            
            {/* Hidden file inputs */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-camera"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-gallery"
            />
            
            {/* Camera and Gallery Buttons */}
            {photos.length < 3 && (
              <div className="grid grid-cols-2 gap-3">
                {/* Take Photo Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-camera')?.click()}
                  className="h-12 flex flex-col items-center justify-center gap-1 md:hidden"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">Take Photo</span>
                </Button>
                
                {/* Choose from Gallery Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-gallery')?.click()}
                  className="h-12 flex flex-col items-center justify-center gap-1"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-xs md:hidden">From Gallery</span>
                  <span className="text-xs hidden md:inline">Upload Photos</span>
                </Button>
                
                {/* Desktop-only unified button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-gallery')?.click()}
                  className="h-12 hidden md:flex items-center justify-center col-span-2"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photos ({photos.length}/3)
                </Button>
              </div>
            )}
            
            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                {photos.length >= 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    Maximum 3 photos reached
                  </p>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              📸 Add photos to help verify the delay. Max 3 photos, 5MB each.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting || !currentLocation}
            className="w-full h-12 text-base font-medium"
          >
            {isSubmitting ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

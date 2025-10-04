'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, MapPin, Clock, AlertTriangle, Upload, X, Search, Loader2 } from 'lucide-react';
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
  transportType: z.enum(['bus', 'tram', 'train', 'metro', 'ferry']),
  line: z.string().min(1, 'Line number/name is required'),
  severity: z.enum(['minor', 'moderate', 'severe']),
  category: z.enum(['mechanical', 'signal', 'weather', 'accident', 'crowding', 'staff_shortage', 'other']),
  description: z.string().min(10, 'Please provide more details (minimum 10 characters)'),
  estimatedDelay: z.number().min(1, 'Estimated delay must be at least 1 minute').max(300, 'Maximum delay is 300 minutes'),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportDelayFormProps {
  onSubmit: (data: CreateReportInput) => Promise<void>;
  isSubmitting?: boolean;
  initialLocation?: Location;
}

const transportTypeOptions: { value: TransportType; label: string; icon: string }[] = [
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'tram', label: 'Tram', icon: '🚋' },
  { value: 'train', label: 'Train', icon: '🚆' },
  { value: 'metro', label: 'Metro', icon: '🚇' },
  { value: 'ferry', label: 'Ferry', icon: '⛴️' },
];

const severityOptions: { value: Severity; label: string; color: string }[] = [
  { value: 'minor', label: 'Minor (5-15 min)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'moderate', label: 'Moderate (15-30 min)', color: 'bg-orange-100 text-orange-800' },
  { value: 'severe', label: 'Severe (30+ min)', color: 'bg-red-100 text-red-800' },
];

const categoryOptions: { value: DelayCategory; label: string }[] = [
  { value: 'mechanical', label: 'Mechanical Issue' },
  { value: 'signal', label: 'Signal Problem' },
  { value: 'weather', label: 'Weather Related' },
  { value: 'accident', label: 'Traffic Accident' },
  { value: 'crowding', label: 'Overcrowding' },
  { value: 'staff_shortage', label: 'Staff Shortage' },
  { value: 'other', label: 'Other' },
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
      estimatedDelay: 15,
    },
  });

  const watchedSeverity = watch('severity');

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Report Delay
        </CardTitle>
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
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-12 flex flex-col items-center justify-center gap-1"
                  onClick={() => setValue('transportType', option.value)}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-xs">{option.label}</span>
                </Button>
              ))}
            </div>
            {errors.transportType && (
              <p className="text-sm text-red-600">{errors.transportType.message}</p>
            )}
          </div>

          {/* Line Number */}
          <div className="space-y-2">
            <Label htmlFor="line" className="text-sm font-medium">Line Number/Name</Label>
            <Input
              id="line"
              placeholder="e.g., Line 42, Red Line, Route A"
              {...register('line')}
              className="h-12"
            />
            {errors.line && (
              <p className="text-sm text-red-600">{errors.line.message}</p>
            )}
          </div>

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

          {/* Estimated Delay */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDelay" className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Estimated Delay (minutes)
            </Label>
            <Input
              id="estimatedDelay"
              type="number"
              min="1"
              max="300"
              {...register('estimatedDelay', { valueAsNumber: true })}
              className="h-12"
            />
            {errors.estimatedDelay && (
              <p className="text-sm text-red-600">{errors.estimatedDelay.message}</p>
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

          {/* Photo Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Photos (Optional)</Label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={photos.length >= 3}
                className="w-full h-12"
              >
                <Camera className="h-4 w-4 mr-2" />
                {photos.length === 0 ? 'Add Photos' : `Add More (${photos.length}/3)`}
              </Button>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

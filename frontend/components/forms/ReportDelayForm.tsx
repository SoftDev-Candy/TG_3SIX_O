'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, MapPin, Clock, AlertTriangle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateReportInput, TransportType, Severity, DelayCategory, Location } from '@/types';

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
      alert('Unable to get your location. Please enable location services and try again.');
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex-shrink-0"
              >
                <MapPin className="h-4 w-4 mr-1" />
                {locationLoading ? 'Getting...' : 'Use Current'}
              </Button>
              {currentLocation && (
                <div className="flex-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {currentLocation.address || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
                </div>
              )}
            </div>
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
            <Select onValueChange={(value) => setValue('category', value as DelayCategory)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

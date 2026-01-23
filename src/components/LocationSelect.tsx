import React, { useState, useMemo } from 'react';
import { MapPin, Plus, Minus, ChevronLeft } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { LOCATIONS } from '@/utils/options/properties.ts/locations';

interface LocationSelectProps {
  value?: {
    lat: number;
    lng: number;
    radius: number;
    label: string;
  };
  onChange?: (value: {
    lat: number;
    lng: number;
    radius: number;
    label: string;
  }) => void;
}

type City = { value: string; label: string; lat: number; lng: number };
type Step = 'continent' | 'country' | 'city' | 'radius';
type Continent = keyof typeof LOCATIONS;

const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 250, 500];

const LocationSelect: React.FC<LocationSelectProps> = ({ value, onChange }) => {
  const [step, setStep] = useState<Step>('continent');
  const [path, setPath] = useState<{ continent?: string; country?: string; city?: City }>({});
  const [radius, setRadius] = useState(25);
  const [search, setSearch] = useState('');

  // Get current items based on step
  const currentItems = useMemo(() => {
    if (step === 'continent') {
      return Object.keys(LOCATIONS);
    }
    if (step === 'country' && path.continent) {
      const continent = path.continent as Continent;
      return Object.keys(LOCATIONS[continent]);
    }
    if (step === 'city' && path.continent && path.country) {
      const continent = path.continent as Continent;
      const countries = LOCATIONS[continent] as any;
      return countries[path.country] || [];
    }
    return [];
  }, [step, path]);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!search) return currentItems;
    const searchLower = search.toLowerCase();
    
    return currentItems.filter((item: any) => {
      const label = typeof item === 'string' ? item : item.label;
      return label.toLowerCase().includes(searchLower);
    });
  }, [currentItems, search]);

  const handleSelect = (item: any) => {
    if (step === 'continent') {
      setPath({ continent: item });
      setStep('country');
    } else if (step === 'country') {
      setPath({ ...path, country: item });
      setStep('city');
    } else if (step === 'city') {
      setPath({ ...path, city: item });
      setStep('radius');
    }
    setSearch('');
  };

  const handleBack = () => {
    if (step === 'radius') {
      setStep('city');
      setPath({ ...path, city: undefined });
    } else if (step === 'city') {
      setStep('country');
      setPath({ continent: path.continent });
    } else if (step === 'country') {
      setStep('continent');
      setPath({});
    }
  };

  const handleConfirm = () => {
    if (path.city) {
      onChange?.({
        lat: path.city.lat,
        lng: path.city.lng,
        radius,
        label: `${path.city.label}, ${path.country} (${radius}km)`
      });
      // Reset
      setStep('continent');
      setPath({});
      setRadius(25);
      setSearch('');
    }
  };

  const handleReset = () => {
    onChange?.({ lat: 0, lng: 0, radius: 0, label: '' });
    setStep('continent');
    setPath({});
    setRadius(25);
    setSearch('');
  };

  // Show selected value
  if (value?.label && step === 'continent' && !path.continent) {
    return (
      <div className="flex flex-col gap-2">
        <div className="p-3 bg-primary/10 border border-primary">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-primary" />
            <span className="text-sm font-medium">{value.label}</span>
          </div>
          <div className="text-xs opacity-70">
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </div>
        </div>
        <Button type="button" onClick={handleReset}>Reset</Button>
      </div>
    );
  }

  // Radius selection
  if (step === 'radius' && path.city) {
    return (
      <div className="flex flex-col gap-3">
        <div className="p-3 bg-primary/10 border border-primary">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} />
            <span className="text-sm font-medium">
              {path.city.label}, {path.country}
            </span>
          </div>
          <div className="text-xs opacity-70 mb-3">
            {path.city.lat.toFixed(4)}, {path.city.lng.toFixed(4)}
          </div>
          
          <label className="text-sm font-medium">Search Radius</label>
          <div className="flex items-center gap-2 my-2">
            <Button 
              type="button"
              onClick={() => setRadius(Math.max(5, radius - 5))} 
              disabled={radius <= 5}
            >
              <Minus size={16} />
            </Button>
            <span className="text-lg font-bold min-w-20 text-center">{radius} km</span>
            <Button 
              type="button"
              onClick={() => setRadius(Math.min(500, radius + 5))} 
              disabled={radius >= 500}
            >
              <Plus size={16} />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`px-3 py-1 text-xs border ${
                  radius === r ? 'bg-primary text-background border-primary' : 'border-primary'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            type="button"
            onClick={handleBack} 
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            type="button"
            onClick={handleConfirm} 
            className="flex-1 bg-primary text-background"
          >
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  // Main selection
  return (
    <div className="flex flex-col gap-2">
      <Input
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${step}...`}
      />

      <div className="h-8 px-2 flex gap-1 items-center bg-primary/20 border border-primary">
        <button 
          type="button"
          onClick={handleBack} 
          disabled={step === 'continent'} 
          className="disabled:opacity-50"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm">
          {path.continent && `${path.continent}`}
          {path.country && ` → ${path.country}`}
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-auto">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-sm opacity-50">No results</div>
        ) : (
          filteredItems.map((item: any) => {
            const label = typeof item === 'string' ? item : item.label;
            const key = typeof item === 'string' ? item : item.value;
            
            return (
              <Button 
                key={key} 
                type="button"
                onClick={() => handleSelect(item)}
              >
                <MapPin size={14} />
                {label}
              </Button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LocationSelect;
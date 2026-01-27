import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Card, CardContent, CardHeader } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import useMobile from '@/hooks/useMobile';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  label?: string;
}

const Select: React.FC<SelectProps> = ({ 
  options,
  value,
  onChange,
  placeholder,
  searchable = false,
  searchPlaceholder = 'Search...',
  label
}) => {
  const isMobile = useMobile();
  const [selected, setSelected] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter(option => 
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery, searchable]);

  // Reset selection when filtered options change
  useMemo(() => {
    setSelected(0);
  }, [filteredOptions]);

  const handleSelect = (index: number) => {
    const selectedOption = filteredOptions[index];
    onChange(selectedOption.value);
  };

  useHotkeys('down', (e) => {
    e.preventDefault();
    setSelected(prev => (prev + 1) % filteredOptions.length);
  }, { enableOnFormTags: true });

  useHotkeys('up', (e) => {
    e.preventDefault();
    setSelected(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
  }, { enableOnFormTags: true });

  useHotkeys('enter', (e) => {
    e.preventDefault();
    if (filteredOptions.length > 0) {
      handleSelect(selected);
    }
  }, { enableOnFormTags: true });

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}
      <Card>
        {searchable && (
          <CardHeader>
            <Input 
              autoFocus={!isMobile}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              pla
            />
          </CardHeader>
        )}
        <CardContent className='space-y-2 text-center'>
          {filteredOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No options found</p>
          ) : (
            filteredOptions.map((option, index) => (
              <Button
                key={option.value}
                type="button"
                className={`w-full ${
                  selected === index
                    ? 'bg-primary text-background'
                    : value === option.value
                    ? 'border-2 border-primary'
                    : ''
                }`}
                onMouseEnter={() => setSelected(index)}
                onClick={() => handleSelect(index)}
              >
                {option.label}
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Select;
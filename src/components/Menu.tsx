import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from './Card';
import { Input } from './Input';
import { Button } from './Button';

interface MenuItem {
  label: string;
  path?: string;
  icon?: LucideIcon;
  onSelect?: () => void;
}

interface MenuProps {
  options: MenuItem[];
  onSelect?: (option: MenuItem, index: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const Menu: React.FC<MenuProps> = ({ 
  options,
  onSelect,
  searchable,
  searchPlaceholder
}) => {
  const [selected, setSelected] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter(option => 
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery, searchable]);

  // Reset selection when filtered options change
  useMemo(() => {
    setSelected(0);
  }, [filteredOptions]);

  const handleSelect = (index: number) => {
    const current = filteredOptions[index];
    const originalIndex = options.indexOf(current);
    current.onSelect?.();
    onSelect?.(current, originalIndex);
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
    <Card>
      {searchable && (
        <CardHeader>
          <Input 
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </CardHeader>
      )}
      <CardContent className='space-y-2 text-center'>
        {filteredOptions.length === 0 ? (
          <></>
        ) : (
          filteredOptions.map((option, index) => {
          const Icon = option.icon;
            return (
              <Button
                key={index}
                className={`w-full ${
                  selected === index
                    ? 'bg-primary text-background'
                    : ''
                }`}
                onMouseEnter={() => setSelected(index)}
                onClick={() => handleSelect(index)}
              >
                {Icon && <Icon size={16}/>}
                {option.label}
              </Button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default Menu;
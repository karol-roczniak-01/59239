import React, { useState, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Input } from './Input';
import { Button } from './Button';

interface SimpleSelectProps {
  data: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({
  data,
  value = '',
  onChange,
  placeholder = 'Select option...',
  searchable = true
}) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(0);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!searchable || !search) return data;
    
    return data.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, searchable]);

  // Reset selection when filtered items change
  useMemo(() => {
    setSelected(0);
  }, [filteredItems]);

  // Handle item selection
  const handleSelect = (item: { value: string; label: string }) => {
    onChange?.(item.value);
    setSearch('');
  };

  // Reset selection
  const handleReset = () => {
    onChange?.('');
    setSearch('');
  };

  // Get label from value
  const getLabel = () => {
    if (!value) return '';
    const item = data.find((it) => it.value === value);
    return item ? item.label : value;
  };

  // Arrow navigation
  useHotkeys('down', (e) => {
    e.preventDefault();
    setSelected(prev => (prev + 1) % filteredItems.length);
  }, { enableOnFormTags: true });

  useHotkeys('up', (e) => {
    e.preventDefault();
    setSelected(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
  }, { enableOnFormTags: true });

  useHotkeys('enter', (e) => {
    e.preventDefault();
    if (filteredItems.length > 0) {
      handleSelect(filteredItems[selected]);
    }
  }, { enableOnFormTags: true });

  useHotkeys('escape', (e) => {
    e.preventDefault();
    if (search) {
      setSearch('');
    }
  }, { enableOnFormTags: true });

  // If value is set, show selected item with reset
  if (value) {
    return (
      <div className="h-full w-full flex flex-col gap-2">
        <div className="h-8 px-2 flex gap-1 items-center bg-primary/10 border border-primary text-sm">
          {getLabel()}
        </div>
        <Button onClick={handleReset} hotkey="r" className="border-primary">
          Reset
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search Bar */}
      {searchable && (
        <Input
          autoFocus
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {/* Items List */}
      <div className="h-full flex flex-col gap-2 overflow-auto min-h-0">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No items found
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <Button
              key={item.value}
              onClick={() => handleSelect(item)}
              className={`${
                selected === index ? '' : ''
              }`}
              onMouseEnter={() => setSelected(index)}
            >
              {item.label}
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default SimpleSelect;
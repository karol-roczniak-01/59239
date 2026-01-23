import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Input } from './Input';
import { Button } from './Button';

interface DeepSelectProps {
  data: any[];
  value?: object;
  onChange?: (value: object) => void;
  placeholder?: string;
}

const DeepSelect: React.FC<DeepSelectProps> = ({
  data,
  value,
  onChange,
  placeholder = 'Select category...'
}) => {
  const [search, setSearch] = useState('');
  const [path, setPath] = useState<any[]>([]);
  const [selected, setSelected] = useState(0);

  // Get current level items based on path
  const currentItems = useMemo(() => {
    let items: any[] = data;
    
    for (const segment of path) {
      const item = items.find((i: any) => i.value === segment.value);
      if (!item) break;
      
      items = item.subtypes || item.categories || [];
    }
    
    return items || [];
  }, [data, path]);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!search) return currentItems;
    
    return currentItems.filter((item: any) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [currentItems, search]);

  // Reset selection when filtered items change
  useMemo(() => {
    setSelected(0);
  }, [filteredItems]);

  // Check if item has children
  const hasChildren = (item: any) => {
    return !!(item.subtypes?.length || item.categories?.length);
  };

  // Build nested object from path array
  const buildNestedObject = (pathArray: any[]): object => {
    if (pathArray.length === 0) return {};
    
    const result: any = {};
    let current = result;
    
    for (let i = 0; i < pathArray.length; i++) {
      const item = pathArray[i];
      if (i === pathArray.length - 1) {
        // Last item - set as leaf value
        current[item.value] = null;
      } else {
        // Intermediate item - create nested object
        current[item.value] = {};
        current = current[item.value];
      }
    }
    
    return result;
  };

  // Handle item selection
  const handleSelect = (item: any) => {
    if (hasChildren(item)) {
      // Navigate deeper
      setPath([...path, item]);
      setSearch('');
    } else {
      // Leaf node - finalize selection
      const fullPath = [...path, item];
      const result = buildNestedObject(fullPath);
      onChange?.(result);
      setSearch('');
      setPath([]);
    }
  };

  // Navigate back
  const handleBack = () => {
    const newPath = path.slice(0, -1);
    setPath(newPath);
    setSearch('');
  };

  // Reset selection
  const handleReset = () => {
    onChange?.({});
    setPath([]);
    setSearch('');
  };

  // Extract path values from nested object
  const extractPathValues = (obj: any): string[] => {
    const pathValues: string[] = [];
    let current = obj;
    
    while (current && typeof current === 'object') {
      const keys = Object.keys(current);
      if (keys.length === 0) break;
      pathValues.push(keys[0]);
      current = current[keys[0]];
    }
    
    return pathValues;
  };

  // Get full path labels from value
  const getFullPathLabels = () => {
    if (!value || Object.keys(value).length === 0) return '';
    
    const pathValues = extractPathValues(value);
    let items = data;
    const labels = [];
    
    for (const val of pathValues) {
      const item = items.find((it: any) => it.value === val);
      if (item) {
        labels.push(item.label);
        items = item.subtypes || item.categories || [];
      }
    }
    
    return labels.join(' > ');
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

  useHotkeys('left', (e) => {
    e.preventDefault();
    if (path.length > 0) {
      handleBack();
    }
  }, { enableOnFormTags: true });

  // If value is set and not currently navigating, show selected path with reset
  if (value && Object.keys(value).length > 0 && path.length === 0) {
    return (
      <div className="h-full w-full flex flex-col gap-2">
        <div className="h-8 px-2 flex gap-1 items-center bg-primary/10 border border-primary text-sm">
          {getFullPathLabels()}
        </div>
        <Button hotkey='alt+r' onClick={handleReset} className="border-primary">
          Reset
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search Bar */}
      <Input
        autoFocus
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
      />

      {/* Breadcrumb */}
      <div className="h-8 px-2 flex gap-1 items-center bg-primary/20 border border-primary">
        <button
          onClick={handleBack}
          className="text-sm flex items-center hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={path.length === 0}
        >
          <ChevronLeft size={14}/>
        </button>
        <span className="text-sm truncate">
          {path.length === 0 ? '' : path.map(p => p.label).join(' > ')}
        </span>
      </div>

      {/* Items List */}
      <div className="h-full flex flex-col gap-2 overflow-auto min-h-0">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No items found
          </div>
        ) : (
          filteredItems.map((item: any, index: number) => (
            <Button
              key={item.value}
              onClick={() => handleSelect(item)}
              className={`justify-between ${
                selected === index ? 'bg-primary text-background' : ''
              }`}
              onMouseEnter={() => setSelected(index)}
            >
              {item.label}
              {hasChildren(item) && (
                <ChevronRight size={14}/>
              )}
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default DeepSelect;
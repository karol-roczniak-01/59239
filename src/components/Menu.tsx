import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { type LucideIcon } from 'lucide-react';

interface MenuItem {
  label: string;
  path?: string;
  icon?: LucideIcon;
  onSelect?: () => void;
}

interface MenuProps {
  options: MenuItem[];
  onSelect?: (option: MenuItem, index: number) => void;
}

const Menu: React.FC<MenuProps> = ({ options, onSelect }) => {
  const [selected, setSelected] = useState(0);

  const handleSelect = (index: number) => {
    const current = options[index];
    current.onSelect?.();
    onSelect?.(current, index);
  };

  useHotkeys('down', () => {
    setSelected(prev => (prev + 1) % options.length);
  });

  useHotkeys('up', () => {
    setSelected(prev => (prev - 1 + options.length) % options.length);
  });

  useHotkeys('enter', () => {
    handleSelect(selected);
  });

  return (
    <div className="space-y-2 text-center">
      {options.map((option, index) => {
        const Icon = option.icon;
        return (
          <div
            key={index}
            className={`h-7 flex items-center justify-center gap-2 cursor-pointer hover:bg-primary hover:text-background ${
              selected === index
                ? 'bg-primary text-background'
                : ''
            }`}
            onMouseEnter={() => setSelected(index)}
            onClick={() => handleSelect(index)}
          >
            {Icon && <Icon size={16}/>}
            {option.label}
          </div>
        );
      })}
    </div>
  );
};

export default Menu;
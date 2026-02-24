import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import useMobile from '@/hooks/useMobile'

interface MenuItem {
  label: string
  onSelect?: () => void
}

interface MenuProps {
  options: Array<MenuItem>
  onSelect?: (option: MenuItem, index: number) => void
}

const Menu: React.FC<MenuProps> = ({ options, onSelect }) => {
  const isMobile = useMobile()
  const [selected, setSelected] = useState(0)

  const handleSelect = (index: number) => {
    const current = options[index]
    current.onSelect?.()
    onSelect?.(current, index)
  }

  useHotkeys('down', (e) => {
    e.preventDefault()
    setSelected((prev) => (prev + 1) % options.length)
  })

  useHotkeys('up', (e) => {
    e.preventDefault()
    setSelected((prev) => (prev - 1 + options.length) % options.length)
  })

  useHotkeys('enter', (e) => {
    e.preventDefault()
    if (options.length > 0) handleSelect(selected)
  })

  return (
    <ul>
      {options.map((option, index) => (
        <li
          key={index}
          onMouseEnter={() => !isMobile && setSelected(index)}
          onClick={() => handleSelect(index)}
          className={`${!isMobile && selected === index ? 'bg-primary text-background cursor-default' : 'cursor-default'}`}
        >
          {option.label}
        </li>
      ))}
    </ul>
  )
}

export default Menu
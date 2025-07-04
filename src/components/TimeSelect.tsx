import React, { useState, useRef, useEffect } from 'react';

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const TimeSelect: React.FC<TimeSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const timeOptions = [
    { value: '8:00', label: '8:00' },
    { value: '9:00', label: '9:00' },
    { value: '10:00', label: '10:00' },
    { value: '11:00', label: '11:00' }
  ];

  const selectedOption = timeOptions.find(option => option.value === value) || timeOptions[0];
  const selectedIndex = timeOptions.findIndex(option => option.value === value);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen) {
          handleSelect(timeOptions[focusedIndex].value);
        } else {
          handleToggle();
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => (prev + 1) % timeOptions.length);
        } else {
          handleToggle();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => (prev - 1 + timeOptions.length) % timeOptions.length);
        } else {
          handleToggle();
        }
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`custom-time-select ${className}`} ref={dropdownRef}>
      <div 
        ref={triggerRef}
        className={`time-select-trigger ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="時間を選択"
      >
        <span className="selected-value">{selectedOption.label}</span>
        <span className="dropdown-arrow">▼</span>
      </div>
      {isOpen && (
        <div className="time-select-dropdown" role="listbox">
          {timeOptions.map((option, index) => (
            <div
              key={option.value}
              className={`time-select-option ${option.value === value ? 'selected' : ''} ${index === focusedIndex ? 'focused' : ''}`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSelect;
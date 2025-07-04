import React, { useState, useRef, useEffect } from 'react';

interface TimeInputSelectProps {
  value: number;
  onChange: (value: string) => void;
}

const TimeInputSelect: React.FC<TimeInputSelectProps> = ({
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const timeOptions = [
    { value: 0, label: '0分' },
    { value: 15, label: '15分' },
    { value: 30, label: '30分' },
    { value: 45, label: '45分' },
    { value: 60, label: '60分' }
  ];

  const selectedOption = timeOptions.find(option => option.value === value) || timeOptions[0];
  const selectedIndex = timeOptions.findIndex(option => option.value === value);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  const handleSelect = (optionValue: number) => {
    onChange(optionValue.toString());
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
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
    <div className="custom-time-input-select" ref={dropdownRef}>
      <div 
        ref={triggerRef}
        className={`time-input-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="作業時間を選択"
      >
        <span className="selected-value">{selectedOption.label}</span>
        <span className="dropdown-arrow">▼</span>
      </div>
      {isOpen && (
        <div className="time-input-select-dropdown" role="listbox">
          {timeOptions.map((option, index) => (
            <div
              key={option.value}
              className={`time-input-select-option ${option.value === value ? 'selected' : ''} ${index === focusedIndex ? 'focused' : ''}`}
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

export default TimeInputSelect;
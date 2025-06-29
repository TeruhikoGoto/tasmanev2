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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeOptions = [
    { value: 0, label: '0分' },
    { value: 15, label: '15分' },
    { value: 30, label: '30分' },
    { value: 45, label: '45分' },
    { value: 60, label: '60分' }
  ];

  const selectedOption = timeOptions.find(option => option.value === value) || timeOptions[0];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: number) => {
    onChange(optionValue.toString());
    setIsOpen(false);
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
        className={`time-input-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
      >
        <span className="selected-value">{selectedOption.label}</span>
        <span className="dropdown-arrow">▼</span>
      </div>
      {isOpen && (
        <div className="time-input-select-dropdown">
          {timeOptions.map((option) => (
            <div
              key={option.value}
              className={`time-input-select-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
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
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeOptions = [
    { value: '8:00', label: '8:00' },
    { value: '9:00', label: '9:00' },
    { value: '10:00', label: '10:00' },
    { value: '11:00', label: '11:00' }
  ];

  const selectedOption = timeOptions.find(option => option.value === value) || timeOptions[0];

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
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
    <div className={`custom-time-select ${className}`} ref={dropdownRef}>
      <div 
        className={`time-select-trigger ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
      >
        <span className="selected-value">{selectedOption.label}</span>
        <span className="dropdown-arrow">▼</span>
      </div>
      {isOpen && (
        <div className="time-select-dropdown">
          {timeOptions.map((option) => (
            <div
              key={option.value}
              className={`time-select-option ${option.value === value ? 'selected' : ''}`}
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

export default TimeSelect;
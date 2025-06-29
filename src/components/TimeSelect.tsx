import React from 'react';

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
  const timeOptions = [
    { value: '', label: '選択してください' },
    { value: '8:00', label: '8:00' },
    { value: '9:00', label: '9:00' },
    { value: '10:00', label: '10:00' },
    { value: '11:00', label: '11:00' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`time-select ${className}`}
    >
      {timeOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default TimeSelect;
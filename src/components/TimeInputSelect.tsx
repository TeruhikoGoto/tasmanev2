import React from 'react';

interface TimeInputSelectProps {
  value: number;
  onChange: (value: string) => void;
}

const TimeInputSelect: React.FC<TimeInputSelectProps> = ({
  value,
  onChange
}) => {
  const timeOptions = [
    { value: 0, label: '' },
    { value: 15, label: '15分' },
    { value: 30, label: '30分' },
    { value: 45, label: '45分' },
    { value: 60, label: '60分' }
  ];

  return (
    <select
      className="time-input-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value={0}></option>
      {timeOptions.slice(1).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default TimeInputSelect;
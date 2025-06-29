import React from 'react';

interface SpreadsheetCellProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'time' | 'number';
  placeholder?: string;
  className?: string;
}

const SpreadsheetCell: React.FC<SpreadsheetCellProps> = ({
  value,
  onChange,
  type = 'text',
  placeholder,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`spreadsheet-cell ${className}`}
    />
  );
};

export default SpreadsheetCell;
import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  minTime?: string;
  maxTime?: string;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  minTime = '06:00',
  maxTime = '22:00'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateTimeSlots = () => {
    const slots = [];
    const [minHour] = minTime.split(':').map(Number);
    const [maxHour] = maxTime.split(':').map(Number);

    for (let hour = minHour; hour <= maxHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        if (timeString >= minTime && timeString <= maxTime) {
          slots.push(timeString);
        }
      }
    }
    return slots;
  };

  const handleTimeClick = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="w-full pl-10 pr-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={value}
          readOnly
          className="w-full focus:outline-none cursor-pointer"
          placeholder="Saat seçin"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto">
          {generateTimeSlots().map((time) => (
            <button
              key={time}
              onClick={() => handleTimeClick(time)}
              className={`w-full px-4 py-2 text-left hover:bg-blue-50 ${
                time === value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
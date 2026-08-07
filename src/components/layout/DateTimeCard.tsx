"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Moon } from 'lucide-react';

const DateTimeCard: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = format(currentDateTime, 'hh:mm');
  const timePeriod = format(currentDateTime, 'a').toUpperCase();
  const formattedDate = format(currentDateTime, 'EEEE, MMMM do');

  return (
    <div className="dark-gradient-card flex items-center p-2 w-48 h-12"> {/* Width increased to w-48 */}
      <Moon className="h-5 w-5 text-gray-300 mr-2" /> {/* Icon size and margin adjusted */}
      <div>
        {/* <p className="text-xs text-gray-300 font-medium">Hozirgi vaqt</p> Removed this line */}
        <p className="text-base font-bold text-white"> {/* Adjusted font size */}
          <span>{formattedTime}</span>
          <span className="text-xs ml-0.5">{timePeriod}</span> {/* Adjusted font size and margin */}
        </p>
        <p className="text-xxs text-gray-400 mt-0.5">{formattedDate}</p> {/* Adjusted font size and margin */}
      </div>
    </div>
  );
};

export default DateTimeCard;
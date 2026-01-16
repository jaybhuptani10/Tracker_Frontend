import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const DateSlider = ({ selectedDate, onDateSelect }) => {
  const scrollRef = useRef(null);

  // Generate an array of dates (e.g., past 7 days + next 14 days)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -7; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  const formatDate = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return {
      dayName: days[date.getDay()],
      dayNumber: date.getDate(),
      month: months[date.getMonth()],
      fullDate: date.toISOString().split("T")[0],
      isToday: new Date().toDateString() === date.toDateString(),
    };
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 200;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Auto-scroll to selected date on mount
  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = document.getElementById(`date-${selectedDate}`);
      if (selectedElement) {
        setTimeout(() => {
          selectedElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }, 100);
      }
    }
  }, [selectedDate]);

  return (
    <div className="relative max-w-7xl mx-auto mb-6 px-4 md:px-0">
      <div className="flex items-center gap-4 bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-lg">
        {/* Calendar Icon Label */}
        <div className="hidden md:flex flex-col items-center justify-center pr-4 border-r border-white/10 min-w-[80px]">
          <Calendar className="w-6 h-6 text-indigo-400 mb-1" />
          <span className="text-xs font-medium text-slate-400">Schedule</span>
        </div>

        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors hidden md:block"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Date Scroll Container */}
        <div
          ref={scrollRef}
          className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {dates.map((date) => {
            const { dayName, dayNumber, fullDate, isToday } = formatDate(date);
            const isSelected = selectedDate === fullDate;

            return (
              <button
                key={fullDate}
                id={`date-${fullDate}`}
                onClick={() => onDateSelect(fullDate)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl transition-all duration-300 border ${
                  isSelected
                    ? "bg-gradient-to-b from-indigo-600 to-purple-600 border-indigo-400 shadow-lg scale-105"
                    : isToday
                    ? "bg-slate-700/50 border-indigo-500/30 text-indigo-300"
                    : "bg-slate-700/30 border-transparent hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span
                  className={`text-xs font-medium mb-1 ${
                    isSelected ? "text-indigo-100" : ""
                  }`}
                >
                  {isToday ? "Today" : dayName}
                </span>
                <span
                  className={`text-xl font-bold ${
                    isSelected ? "text-white" : ""
                  }`}
                >
                  {dayNumber}
                </span>
                {isSelected && (
                  <div className="w-1 h-1 rounded-full bg-white mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors hidden md:block"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DateSlider;

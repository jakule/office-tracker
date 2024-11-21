import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Calendar, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Holiday {
  date: string;
  name: string;
}

interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isWeekend: boolean;
  holiday?: Holiday;
}

interface AttendanceRecord {
  [date: string]: boolean;
}

// US Federal Holidays 2024
const HOLIDAYS_2024: Holiday[] = [
  { date: '2024-01-01', name: "New Year's Day" },
  { date: '2024-01-15', name: "Martin Luther King Jr. Day" },
  { date: '2024-02-19', name: "Presidents' Day" },
  { date: '2024-05-27', name: "Memorial Day" },
  { date: '2024-06-19', name: "Juneteenth" },
  { date: '2024-07-04', name: "Independence Day" },
  { date: '2024-09-02', name: "Labor Day" },
  { date: '2024-10-14', name: "Columbus Day" },
  { date: '2024-11-11', name: "Veterans Day" },
  { date: '2024-11-28', name: "Thanksgiving Day" },
  { date: '2024-12-25', name: "Christmas Day" }
];

const OfficeTracker: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [officeAttendance, setOfficeAttendance] = useState<AttendanceRecord>({});

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holiday = HOLIDAYS_2024.find(h => h.date === dateStr);

      days.push({
        date: dateStr,
        dayOfMonth: date.getDate(),
        isWeekend,
        holiday
      });
    }
    return days;
  };

  const calculateAttendance = (days: CalendarDay[]): number => {
    const workdays = days.filter(day => !day.isWeekend && !day.holiday);
    const daysInOffice = workdays.filter(day => officeAttendance[day.date]).length;
    return workdays.length === 0 ? 0 : (daysInOffice / workdays.length) * 100;
  };

  const navigateMonth = (direction: number): void => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const toggleAttendance = (date: string): void => {
    setOfficeAttendance(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const days = generateCalendarDays();
  const attendancePercentage = calculateAttendance(days);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6" />
            Office Attendance Tracker
          </CardTitle>
        </div>
        <div className="flex items-center justify-start gap-4 mt-4">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 border rounded hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xl font-normal">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 border rounded hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Progress section */}
        <div className="mb-6">
          <div className="text-lg">
            Office Attendance Progress {attendancePercentage.toFixed(1)}%
          </div>
          <div className="text-gray-500">Target: 80%</div>
          <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(100, attendancePercentage)}%` }}
            />
          </div>
        </div>

        {/* Calendar */}
        <div>
          {/* Day headers */}
          <div className="grid grid-cols-7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-[1px] bg-gray-200">
            {days.map((day) => {
              const isToday = day.date === new Date().toISOString().split('T')[0];
              
              return (
                <div
                  key={day.date}
                  className={`
                    bg-white p-4 min-h-[80px] relative
                    ${!day.isWeekend && !day.holiday ? 'cursor-pointer hover:bg-gray-50' : ''}
                    ${day.isWeekend ? 'bg-gray-50' : ''}
                    ${day.holiday ? 'bg-red-50' : ''}
                  `}
                  onClick={() => !day.isWeekend && !day.holiday && toggleAttendance(day.date)}
                >
                  <div className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {day.dayOfMonth}
                  </div>
                  
                  {!day.isWeekend && !day.holiday && (
                    <div className="mt-2">
                      {officeAttendance[day.date] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  )}
                  
                  {day.holiday && (
                    <div className="text-xs text-red-500 mt-1">
                      {day.holiday.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>In Office</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-gray-300" />
            <span>Remote</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-50 border" />
            <span>Holiday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeTracker;
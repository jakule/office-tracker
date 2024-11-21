import { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Calendar, CheckCircle2, XCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// US Federal Holidays 2024
const HOLIDAYS_2024 = [
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

const OfficeTracker = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [officeAttendance, setOfficeAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  // Fetch attendance data from the server
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/attendance`);
      if (!response.ok) throw new Error('Failed to fetch attendance data');
      const data = await response.json();
      setOfficeAttendance(data);
      setError(null);
    } catch (err) {
      setError('Failed to load attendance data. Please try again later.');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update attendance on the server
  const updateAttendance = async (date: any, attended: any) => {
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, attended }),
      });
      
      if (!response.ok) throw new Error('Failed to update attendance');
      
      // Update local state after successful server update
      setOfficeAttendance(prev => ({
        ...prev,
        [date]: attended,
      }));
      
      setError(null);
    } catch (err) {
      setError('Failed to update attendance. Please try again.');
      console.error('Error updating attendance:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Navigate between months
  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };
  
  // Generate calendar data for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ empty: true });
    }

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

  // Calculate attendance percentage
  const calculateAttendance = (days: any) => {
    const workdays = days.filter((day: { date: any; isWeekend: any; holiday: any; }) => day.date && !day.isWeekend && !day.holiday);
    const totalWorkdays = workdays.length;
    const daysInOffice = workdays.filter((day: { date: string | number; }) => officeAttendance[day.date]).length;
    return totalWorkdays === 0 ? 0 : (daysInOffice / totalWorkdays) * 100;
  };

  // Toggle attendance for a specific date
  const toggleAttendance = (date: string) => {
    const newAttendance = !officeAttendance[date];
    updateAttendance(date, newAttendance);
  };

  const days = generateCalendarDays();
  const attendancePercentage = calculateAttendance(days);
  const progressColor = attendancePercentage >= 80 ? 'bg-green-500' : 'bg-yellow-500';

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Office Attendance Tracker
        </CardTitle>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-500 min-w-[120px] text-center">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Office Attendance Progress</span>
            <span className="text-sm font-medium">{attendancePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${progressColor} transition-all duration-300`}
              style={{ width: `${Math.min(100, attendancePercentage)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Target: 80%</div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-sm p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => (
            day.empty ? (
              <div key={`empty-${index}`} className="p-2" />
            ) : (
              <div
                key={day.date}
                className={`
                  p-2 border rounded-lg text-center relative
                  ${day.isWeekend ? 'bg-gray-100' : 'hover:bg-gray-50 cursor-pointer'}
                  ${day.holiday ? 'bg-red-50' : ''}
                  ${loading ? 'opacity-50' : ''}
                  transition-all duration-200
                `}
                onClick={() => !day.isWeekend && !day.holiday && !loading && toggleAttendance(day.date ?? "")}
              >
                <div className="text-sm">{day.dayOfMonth}</div>
                {!day.isWeekend && !day.holiday && (
                  officeAttendance[day.date ?? ""] ? 
                    <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mt-1" /> :
                    <XCircle className="w-4 h-4 text-gray-300 mx-auto mt-1" />
                )}
                {day.holiday && (
                  <div className="absolute bottom-0 left-0 right-0 text-xs text-red-500 truncate px-1">
                    {day.holiday.name}
                  </div>
                )}
              </div>
            )
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex gap-4 text-sm text-gray-600 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>In Office</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-gray-300" />
            <span>Remote</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border rounded"></div>
            <span>Holiday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeTracker;
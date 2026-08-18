"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const CalendarPreview: React.FC = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(today);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Sample event days for dot indicators
  const eventDays = [4, 12, 18, 25];
  const examDays = [15, 28];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span>{monthNames[month]} {year}</span>
        </CardTitle>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground mb-2">
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="h-7 w-7" />
          ))}
          {days.map((d) => {
            const isToday =
              d === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const hasEvent = eventDays.includes(d);
            const hasExam = examDays.includes(d);

            return (
              <div
                key={`day-${d}`}
                className={cn(
                  "relative flex h-7 w-7 items-center justify-center rounded-lg font-medium transition-colors mx-auto cursor-pointer hover:bg-accent",
                  isToday && "bg-primary text-primary-foreground font-bold shadow-xs",
                  !isToday && (hasEvent || hasExam) && "font-semibold text-foreground"
                )}
              >
                <span>{d}</span>
                {!isToday && hasEvent && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                )}
                {!isToday && hasExam && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-rose-500" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

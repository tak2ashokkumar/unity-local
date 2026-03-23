export class ScheduleMaintenance {
    timezone: string;
    schedule_type: string;
    start_date: string;
    end_date: string;
    recurrence_start_time_hr: number;
    recurrence_start_time_min: number;
    recurrence_end_time_hr: number;
    recurrence_end_time_min: number;
    recurrence_pattern: string;
    weekday: string[];
    ends_never: boolean;
    daily_type: string;
    every_day_count: string;
    every_hr_count: string;
    monthly_type: string;
    custom_month_day: string;
    every_month_count: string;
    every_custom_month_day: string;
    every_custom_month_weekday: string;
    schedule_start_time_hr: number;
    schedule_start_time_min: number;
    schedule_end_time_hr: number;
    schedule_end_time_min: number;
}

export interface ScheduleType {
    schedule: Schedule;
}

export interface Schedule {
    schedule_type: string;
    end_date_status: string;
    end_date: string;
    start_date: string;
    daily: DailyType;
    hourly: HourlyType;
    weekly: WeeklyType,
    monthly: MonthlyType,
}

export interface HourlyType {
    hours_interval: string;
    minutes_interval: string;
}

export interface DailyType {
    days_interval: number;
}

export interface WeeklyType {
    week_days: string[];
    at: string;
}

export interface MonthlyType {
    monthly_type: string;
    days: number[];
    months: string[];
    weeks: string;
    week_days: string[];
    every_months: string[];
    at: string;
}
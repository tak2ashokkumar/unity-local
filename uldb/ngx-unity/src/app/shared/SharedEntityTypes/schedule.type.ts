export interface UnityScheduleType {
    schedule_type: string;
    start_date: string;
    end_date_status: string;
    end_date: string;
    // one_time: UnityScheduleOnetimeType;
    hourly?: UnityScheduleHourlyType;
    daily?: UnityScheduleDailyType;
    weekly?: UnityScheduleWeeklyType,
    monthly?: UnityScheduleMonthlyType,
}

export interface UnityScheduleOnetimeType {
    execute_now: boolean;
}

export interface UnityScheduleHourlyType {
    hours_interval: string;
    minutes_interval: string;
}

export interface UnityScheduleDailyType {
    days_interval: number;
    at: string;
}

export interface UnityScheduleWeeklyType {
    week_days: string[];
    at: string;
}

export interface UnityScheduleMonthlyType {
    days: number[];
    weeks: string;
    week_days: string[];
    months: string[];
    at: string;

    //manual fileds used for ui
    monthly_type: string;
    every_months: string[];
}


export interface UnityNotificationType {
    sync_success_notify: boolean;
    sync_failure_notify: boolean;
    email_notify_groups: string[];
    email_notify_users: string[];
}
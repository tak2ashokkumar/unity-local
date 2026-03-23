interface TicketMetric {
    [key: string]: Metric;
}
interface Metric {
    updated_at: string;
    solved_at: null | string;
    replies: number;
    id: number;
    full_resolution_time_in_minutes: Full_resolution_time_in_minutes;
    on_hold_time_in_minutes: On_hold_time_in_minutes;
    status_updated_at: string;
    assignee_stations: number;
    group_stations: number;
    requester_updated_at: string;
    initially_assigned_at: string;
    ticket_id: number;
    first_resolution_time_in_minutes: First_resolution_time_in_minutes;
    assigned_at: string;
    latest_comment_added_at: string;
    reply_time_in_minutes: Reply_time_in_minutes;
    url: string;
    created_at: string;
    assignee_updated_at: string;
    reopens: number;
    requester_wait_time_in_minutes: Requester_wait_time_in_minutes;
    agent_wait_time_in_minutes: Agent_wait_time_in_minutes;
}
interface Full_resolution_time_in_minutes {
    calendar: null | number;
    business: null | number;
}
interface On_hold_time_in_minutes {
    calendar: number;
    business: number;
}
interface First_resolution_time_in_minutes {
    calendar: null | number;
    business: null | number;
}
interface Reply_time_in_minutes {
    calendar: null;
    business: null;
}
interface Requester_wait_time_in_minutes {
    calendar: number;
    business: number;
}
interface Agent_wait_time_in_minutes {
    calendar: null | number;
    business: null | number;
}

export interface TicketsCountByStatus {
    solved: number;
    open: number;
    pending: number;
    closed: number;
    new: number;
}
export interface ClosedTicketsCountByResponseTime {
    greaterthan_month: number;
    one_month: number;
    one_week: number;
    one_day: number;
}

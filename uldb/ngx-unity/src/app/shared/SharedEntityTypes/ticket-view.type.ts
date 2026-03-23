export class TicketViewData {
    id: number;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    metricsAvailable: boolean = false;
    assignedOn?: string;
    resolvedOn?: string;
    detailsUrl: string;
    constructor() { }
} 

interface MaintenanceSchedule {
    url: string;
    id: number;
    uuid: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    colo_cloud: Colo_cloud;
}
interface Colo_cloud {
    url: string;
    id: number;
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: null;
    customer: string;
    cabinets: string[];
}
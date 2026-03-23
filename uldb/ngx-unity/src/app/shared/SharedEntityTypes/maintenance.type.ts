interface UnitySupportMaintenance {
    url: string;
    id: number;
    uuid: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    colo_cloud: IColo_cloud;
    notification_email: string[];
    additional_email: string[];
}

interface IColo_cloud {
    url: string;
    id: number;
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: '';
    customer: string;
    cabinets: string[];
}
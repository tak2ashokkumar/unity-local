export interface ForecastMetric {
    item_id: number;
    name: string;
    period: string;
    alerting: string;
    threshold: string;
    severity: string;
    created_at: string;
    projection_period: string;
    enabled: boolean;
    selected: boolean;
  }
  
  export interface ForecastDevice {
    id: number;
    device_uuid: string;
    name: string;
    status: string;
    metrics_count: string;
    alerts_count: number;
    device_type: string;
    items: ForecastMetric[];
  }
  
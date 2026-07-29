export interface TabData {
    name: string;
    url?: string;
    // Optional regex used ONLY for the active-state match when a tab must stay
    // highlighted on more than one URL base (navigation still uses `url`).
    activeMatch?: string;
    icon?: string;
    enabled?: boolean;
    alwaysEnable?: boolean;
    data?: {
        queryParams?: any;
        data?: any;
    };
    hide?: boolean;

    // for permission set
    permission?: string;
    task?: string;
}
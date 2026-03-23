export interface TabData {
    name: string;
    url?: string;
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
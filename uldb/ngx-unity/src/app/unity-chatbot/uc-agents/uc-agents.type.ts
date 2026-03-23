export interface AIAgentsModule {
    name: string;
    uuid: string;
    queries: string[];
    access_token: string;
    url: string;

    isActive?: boolean;
    icon?: string;
}

export interface NetworkAgent {
    response: string;
    // thread_id: string;
}
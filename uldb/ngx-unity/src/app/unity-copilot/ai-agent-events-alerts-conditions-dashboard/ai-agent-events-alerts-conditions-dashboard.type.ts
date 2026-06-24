export interface AiAgentConfigMapType {
    network: AiAgentConfigType;
    compute: AiAgentConfigType;
}

export interface AiAgentConfigType {
    title: string;
    aiAgentType: string;
    routeBase: string;
    deviceTypesForApi: string[]
}

export type AiAgentType = 'network' | 'compute';
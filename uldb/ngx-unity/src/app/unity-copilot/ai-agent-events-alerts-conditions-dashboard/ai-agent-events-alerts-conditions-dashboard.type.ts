// for UI purpose
export interface AiAgentConfigMapType {
    networkAgent: AiAgentConfigType;
    computeAgent: AiAgentConfigType;
    storageAgent:AiAgentConfigType;
}
export interface AiAgentConfigType {
    title: string;
    aiAgentType: string;
    routeBase: string;
    deviceTypesForApi: string[]
}

export type AiAgentType = 'networkAgent' | 'computeAgent' | 'storageAgent';
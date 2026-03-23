export interface ExecutionTask {
    execution_uuid: string;
}

export interface PollingRes {
    output: string;
    status: "Running" | "Success" | "Failed";
}

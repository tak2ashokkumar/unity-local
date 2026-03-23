export interface TasksType {
    id: number;
    queued_for: string;
    execution_time: string;
    uuid: string;
    task_key: string;
    description: string;
    start_time: string;
    completion_time: string;
    queue_time: string;
    status: string;
    username: string;
    event_chain_id: number;
    vmware_vm: number;
  }
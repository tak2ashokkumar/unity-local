export interface ServerCpuMemoryStorage {
    cpu_count: number;
    storage: ServerStorage;
    memory: ServerMemory;
}
interface ServerStorage {
    used: string;
    capacity: string;
    free: string;
    used_perc: number;
}
interface ServerMemory {
    total: string;
    free: string;
    used: string;
    used_perc: number;
}

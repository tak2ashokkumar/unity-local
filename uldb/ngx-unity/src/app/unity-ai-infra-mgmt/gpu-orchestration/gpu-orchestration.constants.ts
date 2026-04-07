// ──────────────────────────────────────────────
// GPU Orchestration — Static Mock Data
// This file will be replaced by server-side APIs in the future.
// ──────────────────────────────────────────────

export interface GpuContainer {
    id: string;
    name: string;
    status: 'Running' | 'Scaling' | 'Down';
    clusterName: string;
    cpuModel: string;
    nodeCount: number;
    utilization: number;
    // Detail fields (shown in popup)
    instanceId: string;
    gpuCount: number;
    vcpus: number;
    ram: string;
    osImage: string;
    ipAddress: string;
    uptime: string;
    gpuUtilization: number;
    vramUsed: string;
}

export const GPU_CONTAINERS_DATA: GpuContainer[] = [
    { id: 'cnt-8x4v-90k', name: 'gpu-kvm-001', status: 'Running', clusterName: 'Neural-Nexus-Beta', cpuModel: 'AMD Radeon 7900 XTX', nodeCount: 1, utilization: 39, instanceId: 'vm-a3bk91xp', gpuCount: 2, vcpus: 4, ram: '64 GB', osImage: 'Ubuntu 22.04 LTS', ipAddress: '10.0.1.11', uptime: '14d 6h', gpuUtilization: 39, vramUsed: '12 / 16 GB' },
    { id: 'cnt-2m9p-11a', name: 'gpu-kvm-002', status: 'Scaling', clusterName: 'Neural-Nexus-Gamma', cpuModel: 'Intel Xe Graphics', nodeCount: 2, utilization: 71, instanceId: 'vm-b7cq22yt', gpuCount: 4, vcpus: 8, ram: '128 GB', osImage: 'Ubuntu 20.04 LTS', ipAddress: '10.0.1.12', uptime: '3d 2h', gpuUtilization: 71, vramUsed: '28 / 40 GB' },
    { id: 'cnt-5q2r-88v', name: 'gpu-kvm-003', status: 'Down', clusterName: 'Neural-Nexus-Delta', cpuModel: 'NVIDIA A40', nodeCount: 3, utilization: 94, instanceId: 'vm-c1dr33zu', gpuCount: 8, vcpus: 16, ram: '196 GB', osImage: 'RHEL 8', ipAddress: '—', uptime: '—', gpuUtilization: 0, vramUsed: '0 / 384 GB' },
    { id: 'cnt-3t7k-22b', name: 'gpu-kvm-004', status: 'Running', clusterName: 'Neural-Nexus-Epsilon', cpuModel: 'AMD RX 6800', nodeCount: 4, utilization: 39, instanceId: 'vm-d4es44av', gpuCount: 4, vcpus: 8, ram: '96 GB', osImage: 'Ubuntu 22.04 LTS', ipAddress: '10.0.1.14', uptime: '7d 11h', gpuUtilization: 39, vramUsed: '18 / 48 GB' },
    { id: 'cnt-9j6n-55c', name: 'gpu-kvm-005', status: 'Scaling', clusterName: 'Neural-Nexus-Zeta', cpuModel: 'NVIDIA RTX 4090', nodeCount: 5, utilization: 71, instanceId: 'vm-e5ft55bw', gpuCount: 8, vcpus: 16, ram: '196 GB', osImage: 'Ubuntu 22.04 LTS', ipAddress: '10.0.1.15', uptime: '1d 8h', gpuUtilization: 71, vramUsed: '54 / 192 GB' },
    { id: 'cnt-1p4m-77d', name: 'gpu-kvm-006', status: 'Down', clusterName: 'Neural-Nexus-Eta', cpuModel: 'Google TPU v4', nodeCount: 6, utilization: 94, instanceId: 'vm-f6gu66cx', gpuCount: 16, vcpus: 32, ram: '256 GB', osImage: 'RHEL 9', ipAddress: '—', uptime: '—', gpuUtilization: 0, vramUsed: '0 / 512 GB' },
    { id: 'cnt-6f2l-33e', name: 'gpu-kvm-007', status: 'Running', clusterName: 'Neural-Nexus-Theta', cpuModel: 'Apple M2 Pro', nodeCount: 7, utilization: 39, instanceId: 'vm-g7hv77dy', gpuCount: 2, vcpus: 4, ram: '64 GB', osImage: 'Ubuntu 20.04 LTS', ipAddress: '10.0.1.17', uptime: '21d 3h', gpuUtilization: 39, vramUsed: '8 / 32 GB' },
    { id: 'cnt-4r8h-66f', name: 'gpu-kvm-008', status: 'Scaling', clusterName: 'Neural-Nexus-Iota', cpuModel: 'Qualcomm Adreno 730', nodeCount: 8, utilization: 71, instanceId: 'vm-h8iw88ez', gpuCount: 4, vcpus: 8, ram: '128 GB', osImage: 'Ubuntu 22.04 LTS', ipAddress: '10.0.1.18', uptime: '5d 16h', gpuUtilization: 71, vramUsed: '36 / 80 GB' },
    { id: 'cnt-7w5s-44g', name: 'gpu-kvm-009', status: 'Running', clusterName: 'Neural-Nexus-Kappa', cpuModel: 'NVIDIA V100', nodeCount: 9, utilization: 94, instanceId: 'vm-mnlf2h3q', gpuCount: 4, vcpus: 16, ram: '196 GB', osImage: 'Ubuntu 24.04 LTS', ipAddress: '—', uptime: '—', gpuUtilization: 0, vramUsed: '0 / 80 GB' },
    { id: 'cnt-0z3v-99h', name: 'gpu-kvm-010', status: 'Scaling', clusterName: 'Neural-Nexus-Lambda', cpuModel: 'Intel Iris Xe', nodeCount: 10, utilization: 94, instanceId: 'vm-j0kx00ga', gpuCount: 8, vcpus: 16, ram: '196 GB', osImage: 'Ubuntu 22.04 LTS', ipAddress: '10.0.1.20', uptime: '2d 4h', gpuUtilization: 94, vramUsed: '75 / 80 GB' },
];

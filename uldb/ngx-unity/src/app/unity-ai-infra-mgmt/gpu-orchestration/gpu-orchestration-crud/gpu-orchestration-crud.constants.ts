// ──────────────────────────────────────────────
// GPU Orchestration CRUD — Static Mock Data
// This file will be replaced by server-side APIs in the future.
// ──────────────────────────────────────────────

// ── Dropdown Options ──────────────────────────
export const GPU_ENVIRONMENTS = ['AWS', 'Azure', 'GCP', 'Private Cloud'];
export const GPU_ACCOUNTS: { [key: string]: string[] } = {
    'AWS': ['AWS-Production', 'AWS-Staging', 'AWS-Sandbox'],
    'Azure': ['Azure-Main', 'Azure-Dev', 'Azure-Sandbox'],
    'GCP': ['GCP-Core', 'GCP-DataScience'],
    'Private Cloud': ['Datacenter-NY', 'Datacenter-SF']
};
export const GPU_REGIONS: { [key: string]: string[] } = {
    'AWS': ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-south-1'],
    'Azure': ['East US', 'West US', 'North Europe', 'Central India'],
    'GCP': ['us-central1', 'us-east4', 'europe-west1', 'asia-south1'],
    'Private Cloud': ['On-Prem Rack 1', 'On-Prem Rack 2']
};
export const GPU_TYPES: { [key: string]: string[] } = {
    'AWS': ['NVIDIA A100 80GB (P4d)', 'NVIDIA V100 32GB (P3)', 'NVIDIA T4 (G4)'],
    'Azure': ['NVIDIA H100 80GB (NDv5)', 'NVIDIA A100 80GB (NDm A100)', 'NVIDIA V100 (NCv3)'],
    'GCP': ['Google TPU v4', 'NVIDIA A100 80GB (A2)', 'NVIDIA V100 16GB'],
    'Private Cloud': ['NVIDIA H100 80GB PCIe', 'NVIDIA A100 80GB SXM', 'AMD MI250X']
};
export const GPU_COUNTS = [1, 2, 4, 8, 16, 32];
export const GPU_VCPUS = [1, 2, 3, 4, 5, 6, 7, 8];
export const GPU_VRAM_OPTIONS = ['32 GB', '64 GB', '96 GB', '128 GB', '196 GB', '256 GB'];
export const GPU_OS_IMAGES = ['Ubuntu 22.04 LTS', 'Ubuntu 20.04 LTS', 'RHEL 8', 'RHEL 9'];
export const GPU_STORAGE_SIZES = ['50 GB', '100 GB', '150 GB', '200 GB'];

// ── Mock Container Detail (for Edit mode) ─────
export const MOCK_GPU_CONTAINER_DETAIL = {
    vm_name: 'gpu-vm-001',
    environment: 'Azure',
    account: 'Azure-Main',
    account_region: 'East US',
    gpu_type: 'NVIDIA H100 80GB (NDv5)',
    gpu_count: 8,
    vcpus: 16,
    vram: '196 GB',
    os_image: 'Ubuntu 22.04 LTS',
    storage_size: '100 GB',
};

// ── Form Validation Messages ──────────────────
export const GPU_CONTAINER_FORM_VALIDATION_MESSAGES = {
    vm_name: { required: 'Instance Name is required' },
    environment: { required: 'Environment is required' },
    account: { required: 'Account is required' },
    account_region: { required: 'Region is required' },
    gpu_type: { required: 'GPU Type is required' },
    gpu_count: { required: 'GPU Count is required' },
    vcpus: { required: 'vCPUs is required' },
    vram: { required: 'vRAM is required' },
    os_image: { required: 'OS Image is required' },
    storage_size: { required: 'Storage Size is required' },
};

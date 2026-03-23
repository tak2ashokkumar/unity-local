export const clusterData: any = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "name": "UL-Nutanix-Test",
            "uuid": "00060fb7-099d-052c-4c21-588a5ae9acb7",
            "aos_version": "6.5.2",
            "host_count": 1,
            "vm_count": 3,
            "ip_address": null,
            "cpu_usage": "10.8755",
            "memory_usage": "25.2685",
            "total_storage": "4073",
            "used_storage": "66.43",
            "free_storage_pct": "98.37",
            "hypervisors": "AHV",
            "upgrade_status": null,
            "cluster_runway": null,
            "inefficient_vms": null
        }
    ]
}
export const diskData: any = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "disk_id": "18",
            "uuid": "e85f29b5-eed8-4d07-b9b6-d721b81ab3f9",
            "serial_number": null,
            "host_name": "NTNX-83323128-A",
            "hypervisor_ip": "10.192.5.210",
            "tier": "SSD",
            "status": true,
            "storage_capacity": "680",
            "storage_usage": "0",
            "storage_usage_pct": "1.59",
            "disk_io_bandwidth": "2kBps",
            "disk_avg_io_latency": "0.485",
            "disk_iops": "0"
        }]
}
export const hostData: any = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "name": "NTNX-83323128-A",
            "uuid": "e5babff0-40b7-4639-a7fb-a9395d2c9740",
            "host_ip": "10.192.5.210",
            "cvm_ip": "10.192.5.211",
            "memory_capacity": "377",
            "cpu_usage": 9.5235,
            "memory_usage": 25.2617,
            "cpu_cores": 32,
            "cpu_capacity": "67.168",
            "disk_io_latency": "0.449",
            "disk_iops": "5",
            "disk_io_bandwidth": "76",
            "total_disk_usage": "65GB of 4073GB",
            "total_disk_usage_pct": "1.62%",
            "hypervisor": "AHV"
        }]
}
export const sContainerData: any = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "name": "SelfServiceContainer",
            "uuid": "9b1ab956-ccd0-4182-9e60-11739cdfbc88",
            "replication_factor": 1,
            "node_uuid": null,
            "compression": false,
            "erasure_code": "off",
            "cache_deduplication": "OFF",
            "free_space": "4007",
            "used_space": "0",
            "max_capacity": "0",
            "reserved_capacity": "0",
            "controller_iops": "0",
            "controller_bw": "0mBps",
            "controller_latency": "0"
        }]
}
export const sPoolData: any = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "uuid": "d0dd1da6-88db-4538-a384-59dc805baf43",
            "name": "default-storage-pool-39150495798959",
            "disks": 7,
            "free_space": "4007",
            "used_space": "66",
            "max_capacity": "4073",
            "controller_iops": "-1",
            "controller_bw": "-1mBps",
            "controller_latency": "-1"
        }]
}
export const vmData: any = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "name": "prism-central",
            "uuid": "47c4d01f-f79b-436d-a62a-bf1117cc0f6d",
            "cluster": null,
            "power_state": "on",
            "host_name": "NTNX-83323128-A",
            "host_uuid": "e5babff0-40b7-4639-a7fb-a9395d2c9740",
            "ip_address": [],
            "cores": 6,
            "memory_capacity": "26",
            "total_storage": "641",
            "used_storage": "13",
            "cpu_usage": "13.4519",
            "memory_usage": "10.0184",
            "controller_read_iops": null,
            "controller_write_iops": "5",
            "controller_bandwidth": "33kBps",
            "controller_avg_latency": "3.51",
            "flash_mode": false
        }]
}
export const vDiskData: any = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "name": "ide.0",
            "uuid": "f19777da-b894-43e8-92e1-9042de0844b9",
            "flash_mode": false,
            "total_capacity": 0.0,
            "read_iops": -1,
            "read_latency": 0,
            "write_iops": -1,
            "write_latency": 0,
            "write_bw": "0kBps"
        },
      ]
}

export const ds: any = [
    {
        "name": "SelfServiceContainer",
        "summary": {
            "provisioned": "0.0 GB",
            "capacity": "3.91 TB",
            "freespace": "3.91 TB",
            "provisioned_percentage": "0.0",
            "access": "",
            "unity": false,
            "type": null
        }
    },
    {
        "name": "NutanixManagementShare",
        "summary": {
            "provisioned": "7.85 GB",
            "capacity": "3.92 TB",
            "freespace": "3.91 TB",
            "provisioned_percentage": "0.2",
            "access": "",
            "unity": false,
            "type": null
        }
    },
    {
        "name": "default-container-39150495798959",
        "summary": {
            "provisioned": "58.39 GB",
            "capacity": "3.97 TB",
            "freespace": "3.91 TB",
            "provisioned_percentage": "1.4",
            "access": "",
            "unity": false,
            "type": null
        }
    }
]
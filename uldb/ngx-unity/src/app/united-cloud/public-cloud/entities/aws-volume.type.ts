interface AWSVolume {
    uuid: string;
    availability_zone: string;
    encrypted: boolean;
    snapshot_id: string;
    kmskey_id: any;
    volume_type: string;
    volume_size: number;
    state: string;
    iops: number;
    create_time: string;
    volume_id: string;
    tags: any;
}
interface AWSSnapshot {
    SnapshotId: string;
    Description: string;
    Encrypted: boolean;
    VolumeId: string;
    State: string;
    VolumeSize: number;
    StartTime: string;
    OwnerId: string;
    Progress: string;
}

interface AWSAutoScaling {
    desired_capacity: string;
    max_size: string;
    min_size: string;
    name: string;
    instances: Instances;
    availability_zone: AvailabilityZone;
}

interface Instances {
    count: string;
}

interface AvailabilityZone{
    count: string;
}
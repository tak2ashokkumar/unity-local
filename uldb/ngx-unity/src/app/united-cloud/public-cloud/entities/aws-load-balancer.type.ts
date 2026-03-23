interface AWSLoadBalancer {
    Subnets: string;
    VPCId: string;
    Type: string;
    IpAddressType: string;
    State: string;
    Instances: InstancesItem[];
    DNSName: string;
    SecurityGroups: string;
    LoadBalancerName: string;
    CreatedTime: string;
    AvailabilityZones: string;
}
interface InstancesItem {
    InstanceId: string;
}

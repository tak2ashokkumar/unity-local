interface AWSDetails {
    PrivateDnsName: string;
    AvailabilityZone: string;
    KernelId: string;
    Tags: AWSDetailsTags[];
    InstanceId: string;
    InstanceState: string;
    MonitoringState: string;
    PublicDnsName: string;
    HostId: string;
    SecurityGroup: string;
    ImageId: string;
    PublicIp: string;
    GroupName: string;
    LoadBalancers: string;
    VpcId: string;
    LaunchTime: string;
    Platform: string;
    RamdiskId: string;
    KeyName: string;
    SubnetId: string;
    InstanceType: string;
}
interface AWSDetailsTags {
    Key: string;
    Value: string;
}
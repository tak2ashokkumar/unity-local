import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface AWSVm {
    private_dns_name: string;
    availability_zone: string;
    SecurityGroup: string;
    group_name: string;
    public_ip: string;
    instance_state: string;
    ram_disk_id: any;
    account_name: string;
    uuid: string;
    subnet_id: string;
    security_group_id: SecurityGroupIdItem[];
    platform: any;
    account_id: number;
    kernel_id: string;
    key_name: string;
    image_id: string;
    public_dns_name: string;
    host_id: any;
    monitoring_state: string;
    region: string;
    launch_time: string;
    name: string;
    instance_type: string;
    vpc_id: string;
    monitoring : DeviceMonitoringType;
}
export interface SecurityGroupIdItem {
    GroupName: string;
    GroupId: string;
}

//AWS Available Zone Api details
export interface AWSVmLaunchData {
    Subnet: AWSVmLaunchItem[];
    Name: string;
}
export interface AWSVmLaunchItem {
    SubnetId: string;
    VpcId: string;
}

//AWS VPC api details
export interface AWSVPCDetails {
    VpcId: string;
    InstanceTenancy: string;
    Tags?: AWSVPCTags[];
    CidrBlockAssociationSet: AWSVPCCidrBlockAssociationSetItem[];
    State: string;
    DhcpOptionsId: string;
    OwnerId: string;
    CidrBlock: string;
    IsDefault: boolean;
}
export interface AWSVPCTags {
    Key: string;
    Value: string;
}
export interface AWSVPCCidrBlockAssociationSetItem {
    AssociationId: string;
    CidrBlock: string;
    CidrBlockState: AWSVPCCidrBlockState;
}
export interface AWSVPCCidrBlockState {
    State: string;
}

//AWS Subnet by VPC Api details
export interface AWSSubnetByVPCDetails {
    MapPublicIpOnLaunch: boolean;
    AvailabilityZoneId: string;
    Tags: AWSSubnetTagsItem[];
    CidrBlock: string;
    SubnetArn: string;
    DefaultForAz: boolean;
    Ipv6CidrBlockAssociationSet: any[];
    State: string;
    VpcId: string;
    AvailabilityZone: string;
    SubnetId: string;
    OwnerId: string;
    AvailableIpAddressCount: number;
    AssignIpv6AddressOnCreation: boolean;
}
export interface AWSSubnetTagsItem {
    Key: string;
    Value: string;
}

export interface AWSInstanceType {
    InstanceType: string;
    // Value: string;
}

//AWS Security Groups by VPC
export interface AWSSecurityGroupByVPC {
    IpPermissionsEgress: AWSSecurityGroupPermissionsEgress[];
    Description: string;
    IpPermissions: AWSSecurityGroupPermissions[];
    GroupName: string;
    VpcId: string;
    OwnerId: string;
    GroupId: string;
}
export interface AWSSecurityGroupPermissionsEgress {
    IpProtocol: string;
    Ipv6Ranges: any[];
    IpRanges: AWSSecurityGroupPermissionsEgressIpRange[];
    UserIdGroupPairs: any[];
    PrefixListIds: any[];
}
export interface AWSSecurityGroupPermissionsEgressIpRange {
    CidrIp: string;
}
export interface AWSSecurityGroupPermissions {
    IpProtocol: string;
    Ipv6Ranges: AWSSecurityGroupPermissionsIpv6Range[];
    IpRanges: AWSSecurityGroupPermissionsEgressIpRange[];
    UserIdGroupPairs: any[];
    PrefixListIds: any[];
}
export interface AWSSecurityGroupPermissionsIpv6Range {
    CidrIpv6: string;
}

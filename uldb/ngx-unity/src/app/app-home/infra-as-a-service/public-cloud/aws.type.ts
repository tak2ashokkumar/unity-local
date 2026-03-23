interface AWSCloud {
    id: number;
    region: string[];
    user: User;
    aws_user: string;
    access_key: string;
    account_name: string;
    uuid: string;
}
interface User {
    url: string;
    id: number;
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    access_types: AccessTypesItem[];
    last_login: string;
}
interface AccessTypesItem {
    url: string;
    id: number;
    name: string;
    description: string;
}

interface AWSWidget {
    load_balancer: number;
    RDS_instance: number;
    s3_bucket: number;
    ec2_active_instance: number;
    elastic_ips: number;
    ec2_instance: number;
    ec2_inactive_instance: number;
}

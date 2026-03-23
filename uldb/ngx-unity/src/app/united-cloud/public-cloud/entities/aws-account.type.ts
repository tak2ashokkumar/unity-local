interface AWSAccount {
    id: number;
    region: string[];
    user: User;
    aws_user: string;
    access_key: string;
    account_name: string;
    uuid: string;
    name:string;
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

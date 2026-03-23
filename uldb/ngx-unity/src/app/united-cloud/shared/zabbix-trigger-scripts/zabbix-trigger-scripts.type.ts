export interface ZabbixTriggerScriptType{
    script_id:string;
    name: string;
    category: string;
    device_category: string;
    description: string;
    script_type: string;
    created_at: string;
    script_content: string;
    upload_script: string;
    required_credentials : boolean;
    uuid : string;
    os: string;
}
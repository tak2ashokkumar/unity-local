var app = angular.module('uldb');
var url_prefix = '/customer/';
var aws_url_prefix = "/customer/aws/:account_id/region/";

app.constant('apiPaths', {
    baseUrl: "http://localhost:9494"
})

.constant('zendeskConstant', {
    datacenter_id: 32509407 // Unique ID for fetching datacenter name from zendesk api
})

.constant('ClientApi', {
    serverUrl: "",
    custom_data_url: "/static/custom_data/:filename.json",
    create_vmware_modal: "/static/rest/app/templates/v3/vmware/:name.html",
    create_modal: "/static/rest/app/templates/v3/partials/:name.html",

    create_mschedules:                  url_prefix  + 'mschedules/',
    edit_mschedules:                    url_prefix  + 'mschedules/:schedule_id/',
    delete_mschedules:                  url_prefix  + 'mschedules/:schedule_id/',
    mark_as_completed_mschedules:       url_prefix  + 'mschedules/:schedule_id/',


    // ---------------------- Aws Urls ---------------------------
    get_aws_dashboard:                  '/customer/aws/',
    add_aws_region:                     aws_url_prefix,
    delete_aws_acccount:                url_prefix     + 'aws/:account_id/',
    edit_aws_acccount:                  url_prefix     + 'aws/:account_id/',
    validate_aws_customer:              aws_url_prefix + ':regionname/validate/',
    get_list_region:                    aws_url_prefix + 'us-west-2/list_regions/',
    get_user_list:                      aws_url_prefix + ':regionname/user/',
    get_instance_list:                  aws_url_prefix + ':regionname/instance/',
    get_avail_volume:                   aws_url_prefix + ':regionname/list_available_volume/',
    get_user_group:                     aws_url_prefix + ':regionname/user/:username/user_group/',
    get_user_detail:                    aws_url_prefix + ':regionname/user/:username/user_details/',
    get_entities:                       aws_url_prefix + ':regionname/list_entity/',
    aws_poweron:                        aws_url_prefix + ':regionname/instance/:instanceid/start_instance/',
    aws_poweroff :                      aws_url_prefix + ':regionname/instance/:instanceid/stop_instance/',
    aws_terminate:                      aws_url_prefix + ':regionname/instance/:instanceid/terminate_instance/',
    aws_instance_detail:                aws_url_prefix + ':regionname/instance/:instanceid/instance_detail/',
    aws_list_policy :                   aws_url_prefix + ':regionname/list_policies/',
    aws_snapshot_list:                  aws_url_prefix + ':regionname/snapshot/',
    aws_load_balancer:                  aws_url_prefix + ':regionname/load_balancer/',
    aws_list_volume:                    aws_url_prefix + ':regionname/volume/',
    aws_list_asg:                       aws_url_prefix + ':regionname/list_auto_scaling_group/',
    aws_list_netinter:                  aws_url_prefix + ':regionname/list_network_interface/',
    get_aws_list_secgroup_data:         aws_url_prefix + ':name/security_group/',
    get_images_list:                    aws_url_prefix + ':name/images/',
    add_aws_image:                      aws_url_prefix + ':name/instance/:instance_id/create_image/',
    attach_autoscaling_group:           aws_url_prefix + ':name/instance/:instance_id/attach_asg/',
    attach_network_interface:           aws_url_prefix + ':name/instance/:instance_id/attach_network_interface/',
    attach_loadbalancer:                aws_url_prefix + ':name/instance/:instance_id/attach_loadbalancer/',
    copy_snapshot:                      aws_url_prefix + ':name/snapshot/:snapshot_id/copy_snapshots/',
    get_subnet_availability_zone_data:  aws_url_prefix + ':name/instance_launch_data/',
    launch_instance:                    aws_url_prefix + ':name/instance/',
//    get_asg_list_data:                  aws_url_prefix + ':name/asg_dropdown/',
    get_asg_list_data:                  aws_url_prefix + ':name/instance/:instance_id/asg_dropdown/',
    get_network_interface_list:         aws_url_prefix + ':name/instance/:instance_id/network_interface_dropdown/',
    get_loadbalancer_list:              aws_url_prefix + ':name/instance/:instance_id/loadbalancer_dropdown/',

    //Azure Links

    azure_account:                       url_prefix  + 'azure/',
    azure_edit:                          url_prefix  + 'azure/:account_id/',
    azure_delete:                        url_prefix  + 'azure/:account_id/',
    azure_resource_group:                url_prefix  + 'azure/:account_id/resource_group/',
    azure_resource_group_edit:           url_prefix  + 'azure/:account_id/resource_group/:resource_id',
    azure_resource_group_delete:         url_prefix  + 'azure/:account_id/resource_group/:resource_id',
    azure_virtual_machine:               url_prefix  + 'azure/:account_id/virtual_machines/',
    azure_virtual_machine_edit:          url_prefix  + 'azure/:account_id/virtual_machines/:resource_id',
    azure_virtual_machine_delete:        url_prefix  + 'azure/:account_id/virtual_machines/delete_azure_vm/',
    azure_nic_attach_loadbalancer:        url_prefix  + 'azure/:account_id/nic/attach_load_balancer/',


})
.constant('TableHeaders', {

    tickets: [
        {key:'ticket_id',title: 'Ticket ID', is_sort_disabled : true},
        {key:'subject', title: 'Subject', is_sort_disabled : true},
        // {key:'cloud', title: 'Cloud', is_sort_disabled : true},
        {key:'status',title: 'Status',},
        {key:'priority',title: 'Priority',},
        {key:'created_at',title: 'Created on',},
        {key:'acknowledged_at',title: 'Acknowledged on',},
        {key:'resolved_at',title: 'Resolved on',},
        // {key:'updated_at',title: 'Updated on',}
    ],
    alerts: [
        {key:'source',title: 'Source'},
        {key:'name',title: 'Name'},
        {key:'datacenter',title: 'Datacenter'},
        {key:'resolution_state',title: 'Resolution State'},
        {key:'created',title: 'Created'},
        {key:'age',title: 'Age'}
    ],
    mschedules_headers: [
     {key: 'description',title: 'Description'},
     {key: 'status',title: 'Status'},
     {key: 'datacenter_name',title: 'Datacenter'},
     {key: 'start_date',title: 'Start Date'},
     {key: 'end_date',title: 'End Date'}
    ],

    lm_device_headers: [
        {key: 'name', title: 'Device Name'},
        {key: 'collector', title: 'Collector'}
    ],

    // VM backup headers
    openstack_vm_headers: [
         // {key: 'project',title: 'Project'},
         {key: 'name',title: 'Image Name'},
         {key: 'image_id',title: 'Image Id'},
         {key: 'status',title: 'Power State'},
         {key: 'updated_at',title: 'Updated At'},
         {key: 'public',title: 'Public'},
         {key: 'disk_format',title: 'Format'},
         {key: 'size',title: 'Size(MB)'},
         {key: 'back_up_status',title: 'Backup'},
         {key: 'backup_date',title: 'Backup Time'},
         {key: 'openstack_actions',title: 'Actions'}
    ],

    openstack_backup_headers: [
         // {key: 'project',title: 'Project'},
         {key: 'name',title: 'Instance Name'},
         {key: 'operating_system',title: 'Operating System'},
         {key: 'last_known_state',title: 'Power State'},
         {key: 'updated_at',title: 'Updated At'},
         {key: 'ip_address',title: 'IP Address'},
         {key: 'memory',title: 'Memory(MB)'},
         {key: 'backup_status',title: 'Backup'},
         {key: 'backup_date',title: 'Backup Time'},
         {key: 'openstack_actions',title: 'Actions'}
    ],

    openstack_migration_headers: [
         {key: 'name',title: 'Instance Name'},
         {key: 'vcpu',title: 'vCPUs'},
         {key: 'memory',title: 'Memory (MB)'},
         {key: 'disk',title: 'Disk(GB)'},
         {key: 'operating_system',title: 'Image'},
         {key: 'ip_address',title: 'IP Address'},
         {key: 'last_known_state',title: 'Power State'},
         {key: 'migration_status',title: 'Migration Status'},
         {key: 'migration_date',title: 'Migration Date'},
         {key: 'openstack_actions',title: 'Actions'}
    ],

    vmware_vm_headers: [
         {key: 'name',title: 'Virtual Machine'},
         {key: 'os_name',title: 'OS'},
         {key: 'host_name',title: 'Host Name'},
         {key: 'disk_space',title: 'Capacity (GB)'},
         {key: 'state',title: 'Power State'},
         {key: 'datacenter',title: 'Datacenter'},
         {key: 'guest_memory',title: 'RAM (MB)'},
         {key: 'backup_date',title: 'Backedup At'},
         {key: 'backup_status',title: 'Backup Status'},
         {key: 'vmware_actions',title: 'Actions'}
    ],

    vmware_migration_headers: [
         {key: 'name',title: 'Virtual Machine'},
         {key: 'os_name',title: 'OS'},
         {key: 'host_name',title: 'Host Name'},
         {key: 'disk_space',title: 'Capacity (GB)'},
         {key: 'state',title: 'Power State'},
         {key: 'datacenter',title: 'Datacenter'},
         {key: 'guest_memory',title: 'RAM (MB)'},
         {key: 'migration_date',title: 'Migration Date'},
         {key: 'migration_status',title: 'Migration Status'},
         {key: 'vmware_actions',title: 'Actions'}
    ],


    terraform_headers: [
         {key: 'vm_name',title: 'Virtual Machine'},
         {key: 'cloud', title: 'Cloud'},
         {key: 'cpus',title: 'No. of CPUs'},
         {key: 'ram_size',title: 'RAM size in MB'},
         {key: 'hostname',title: 'Hostname'},
         {key: 'internal_ip',title: 'Internal IP'},
         {key: 'routable_ip',title: 'Routable IP'},
         {key: 'status',title: 'Power State'},
         {key: 'created_at',title: 'Created on'},
         {key: 'actions',title: 'Actions'}
    ],

        //Azure customer list
    azure_customer_headers: [
         {key: 'account_name',title: 'Account Name'},
         {key: 'subscription_id', title:'Subscription Id'}
    ],

    azure_resource_group_headers: [
         {key: 'name',title: 'Resource group Name'},
         {key: 'location',title: 'Location'},
         {key: 'tags',title: 'Tags'},
    ],

    azure_resource_headers: [
         //{key: 'resource_group',title: 'Resource Group'},
         {key: 'name',title: 'Resource'},
         {key: 'type',title: 'Type'},
         {key: 'location',title: 'Location'},
         {key: 'tags',title: 'Tags'},
         {key: 'category',title: 'Category'},
         //{key: 'kind',title: 'Kind'},
         //{key: 'properties',title: 'Properties'},
        // {key: 'managed_by',title: 'Managed By'},
         {key: 'plan',title: 'Plan'},

         //{key: 'identity',title: 'Identity'},
    ],


    azure_vm_headers: [
         //{key: 'resource_group',title: 'Resource Group'},
         {key: 'name',title: 'Name'},
         {key: 'availability_set',title: 'Availability Set'},
         {key: 'tags',title: 'Tags'},
         {key: 'provisioning_state',title: 'Provisioning State'},
        // {key: 'plan',title: 'Plan'},
         {key: 'location',title: 'Location'},
         //{key: 'license_type',title: 'License Type'},
         // {key: 'load_balancer',title: 'Load Balancer'},
    ],



    aws_account_headers: [
         {key: 'aws_user',title: 'User Name'},
         {key: 'account_name',title: 'Account Name'},
         {key: 'region',title: 'Regions'}
    ],
    aws_region_list_headers: [
         {key: 'endpoint',title: 'EndPoint'},
         {key: 'region_name',title: 'Region Name'}
    ],
    aws_user_list_headers: [
         {key: 'UserName',title: 'User Name'},
         {key: 'CreateDate',title: 'Created Date'},
         {key: 'Arn',title: 'ARN'}
    ],
    aws_usergroup_list_headers: [
         {key: 'GroupName',title: 'Group Name'},
         {key: 'CreateDate',title: 'Created Date'},
         {key: 'GroupId',title: 'Group Id'},
         {key: 'Arn',title: 'ARN'},
         {key: 'Path',title: 'Path'}
    ],
    aws_userdetails_headers: [
         {key: 'UserName',title: 'User Name'},
         {key: 'Path',title: 'Path'},
         {key: 'CreateDate',title: 'Created Date'},
         {key: 'UserId',title: 'User Id'},
         {key: 'Arn',title: 'ARN'}
    ],
    aws_volume_list_headers: [
        {key:'availability_zone',title: 'Availability Zone'},
        {key:'encrypted',title: 'Encrypted'},
        {key:'volume_type',title: 'Volume Type'},
        {key:'volume_size',title: 'Size (GiB)'},
        {key:'state',title: 'State'},
        {key:'iops',title: 'IOPS'},
        {key:'create_time',title: 'Created Time'},
        {key:'tags',title: 'Tags'}
    ],
    aws_instance_list_headers: [
        {key:'instance_id',title: 'Instance ID'},
        {key:'instance_type',title: 'Type'},
        {key:'public_ip',title: 'Public IP'},
        {key:'availability_zone',title: 'Availability Zone'},
        {key:'instance_state',title: 'Power State'},
        {key:'launch_time',title: 'Launch Time'}
    ],
    aws_snapshot_list_headers: [
        {key:'Description',title: 'Description'},
        {key:'VolumeSize',title: 'Size (GiB)'},
        {key:'State',title: 'Status'},
        {key:'Encrypted',title: 'Encrypted'},
        {key:'StartTime',title: 'Start Time'},
        {key:'Progress',title: 'Progress'}
    ],
    aws_load_balancer_list_headers: [
        {key:'LoadBalancerName',title: 'Name'},
        {key:'Subnets',title: 'Subnets'},
        {key:'SourceSecurityGroup',title: 'Source Security Group'},
        {key:'SecurityGroups',title: 'Security Groups'},
        {key:'CreatedTime',title: 'Created Time'},
        {key:'AvailabilityZones',title: 'Availability Zones'}
    ],
    aws_available_volume_list_headers: [
        {key:'availability_zone',title: 'Availability Zone'},
        {key:'encrypted',title: 'Encrypted'},
        {key:'volume_type',title: 'Volume Type'},
        {key:'volume_size',title: 'Size (GiB)'},
        {key:'state',title: 'State'},
        {key:'iops',title: 'IOPS'},
        {key:'create_time',title: 'Created Time'},
        {key:'tags',title: 'Tags'}
    ],
    aws_instance_details_headers: [
        {key:'InstanceId',title: 'Instance Id'},
        {key:'ImageId',title: 'Image Id'},
        {key:'RamdiskId',title: 'Ramdisk Id'},
        {key:'KeyName',title: 'Key Name'},
        {key:'HostId',title: 'Host Id'},
        {key:'AvailabilityZone',title: 'Availability Zone'},
        {key:'PrivateDnsName',title: 'Private Dns Name'},
        {key:'PublicDnsName',title: 'Public Dns Name'},
        {key:'KernelId',title: 'Kernel Id'},
        {key:'InstanceState',title: 'InstanceState'},
        {key:'MonitoringState',title: 'MonitoringState'},
        {key:'SecurityGroup',title: 'Security Group'},
        {key:'GroupName',title: 'GroupName'},
        {key:'LaunchTime',title: 'LaunchTime'},
        {key:'Platform',title: 'Platform'},
        {key:'SubnetId',title: 'Subnet Id'},
        {key:'InstanceType',title: 'Instance Type'},
        {key:'LoadBalancers',title: 'LoadBalancers'},
        {key:'Tags',title: 'Tags'}
    ],
    aws_s3_buckets_headers: [
        { key: 'bucket_name', title: 'Bucket Name' },
        { key: 'region', title: 'Region' },
        { key: 'bucket_size', title: 'Bucket Size' },
        { key: 'creation_date', title: 'Creation Date' },
    ],
    aws_entities_group_headers: [
        {key:'GroupName',title: 'Group Name'}
    ],
    aws_entities_user_headers: [
        {key:'UserName',title: 'User Name'}
    ],
    aws_entities_role_headers: [
        {key:'RoleName',title: 'Role Name'}
    ],
    aws_asg_headers:[
        {key:'name',title: 'Name'},
        {key:'instances',title: 'Instances', decorator:'count'},
        {key:'availability_zone',title: 'Availability Zone',decorator:'results'},
        {key:'min_size',title: 'Min Size'},
        {key:'max_size',title: 'Max Size'},
        {key:'desired_capacity',title: 'Desired Capacity'}
    ],
    aws_network_interface_headers:[
        {key:'network_interface_id',title: 'Network Interface Id'},
        {key:'availability_zone',title: 'Availability Zone'},
        {key:'status',title: 'Status'},
        {key:'mac_address',title: 'MAC Address'},
        {key:'private_ip_address',title: 'Private IP Address'},
        {key:'private_dns_name',title: 'Private DNS Name'}
    ],
    aws_security_group_headers:[
        {key:'group_name',title: 'Security Group Name'},
        {key:'group_id',title: 'Security Group Id'},
        {key:'description',title: 'Description'},
        {key:'vpc_id',title: 'Vpc Id'},
        {key:'owner_id',title: 'Owner Id'}
    ],

})
.constant('userAPI', {});

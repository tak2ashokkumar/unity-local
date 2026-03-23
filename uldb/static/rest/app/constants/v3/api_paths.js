var openstack_url_prefix = "/rest/v3/controller/:adapter_id/";
var vmware_url_prefix = "/rest/v3/vmware/";
var aws_url_prefix = "/rest/v3/aws/:account_id/region/";
var v3_url_prefix = '/rest/v3/';
var url_prefix = '/rest/';

var app = angular.module('uldb');
app.constant('apiPaths', {
    baseUrl: "http://localhost:9494"
})

    .constant('AdminApi', {
        serverUrl: "",
        custom_data_url: "/static/custom_data/:filename.json",
        create_vmware_modal: "/static/rest/app/templates/v3/vmware/:name.html",
        create_modal: "/static/rest/app/templates/v3/partials/:name.html",
        //Vmware POST URIs Constats for add and update request
        vm_add_vcenter: vmware_url_prefix,
        vm_update_vcenter: vmware_url_prefix + ':vcenter_id/',
        vm_add_cluster: vmware_url_prefix + ':vcenter_id/datacenter/:datacenter_id/cluster/',
        vm_add_datacenter: vmware_url_prefix + ':vcenter_id/datacenter/',
        vm_add_hypervisor: vmware_url_prefix + ':vcenter_id/cluster/:cluster_id/hypervisor/',
        vm_add_virtualmachine: vmware_url_prefix + ':vcenter_id/cluster/:cluster_id/virtual_machine/',
        vm_add_resourcepool: vmware_url_prefix + ':vcenter_id/cluster/:cluster_id/resource_pool/',
        vm_snapshot_add: vmware_url_prefix + ':vcenter_id/virtual_machine/:vm_id/snapshot/',
        //Vmware GET Requests
        vm_get_vcenter: vmware_url_prefix,
        vm_get_validation: vmware_url_prefix + ':vcenter_id/validate_adapter/',
        vm_get_folder: vmware_url_prefix + ':vcenter_id/folder/',
        vm_get_resource_pool: vmware_url_prefix + ':vcenter_id/resource_pool/',
        vm_get_snapshot: vmware_url_prefix + ':vcenter_id/snapshot/',
        vm_get_datacenter: vmware_url_prefix + ':vcenter_id/datacenter/',
        vm_get_hypervisor: vmware_url_prefix + ':vcenter_id/hypervisor/',
        vm_get_datastore: vmware_url_prefix + ':vcenter_id/datastore/',
        vm_get_virtualmachine: vmware_url_prefix + ':vcenter_id/virtual_machine/',
        vm_get_cluster: vmware_url_prefix + ':vcenter_id/cluster/',
        vm_power_on: vmware_url_prefix + ':vcenter_id/virtual_machine/:virtual_machine_id/power_on/',
        vm_power_off: vmware_url_prefix + ':vcenter_id/virtual_machine/:virtual_machine_id/power_off/',
        vm_delete_resourcepool: vmware_url_prefix + ':vcenter_id/resource_pool/:resource_pool_id/delete_resourcepool/',
        vm_delete_vm: vmware_url_prefix + ':vcenter_id/virtual_machine/:virtual_machine_id/delete_vm/',
        vm_get_listsnapshot: vmware_url_prefix + ':vcenter_id/virtual_machine/:vm_id/list_snapshot/',


        //-------------------------- OpenStack Constatnt URIs ------------------
        //openStack POST URIs
        add_subnet: openstack_url_prefix + 'subnet/',
        add_credentials: openstack_url_prefix + 'credential/',
        add_keypair: openstack_url_prefix + 'tenant/:tenant_id/keypair/',
        add_endpoint: openstack_url_prefix + 'endpoint/',
        add_vm_tenant: openstack_url_prefix + 'tenant/:tenant_id/instances/',
        add_flavor: openstack_url_prefix + 'flavor/',
        add_tenant: openstack_url_prefix + 'tenantlist/',
        add_tenant_volumes: openstack_url_prefix + 'tenant/:tenant_id/volume/',
        add_tenant_images: openstack_url_prefix + 'image/',
        add_catalog_service: openstack_url_prefix + 'servicecatalog/',
        add_interface_port: openstack_url_prefix + 'virtual_machines/{virtual_machines_id}/task/create_port_interfaces',
        add_region_port: openstack_url_prefix + 'region/',
        add_os_tokens_data: openstack_url_prefix + 'tokens/',
        add_nova_controllers_data: '/rest/v3/controller/',

        //openStack GET URIs
        validate_nova_controller: openstack_url_prefix + 'validate/',
        get_catalog_service_data: openstack_url_prefix + 'servicecatalog/',
        get_subnet_data: openstack_url_prefix + 'subnet/',
        get_credentials_data: openstack_url_prefix + 'credential/',
        get_keypair_data: openstack_url_prefix + 'keypair/',
        get_tenant_network_data: openstack_url_prefix + 'tenant_network/',
        get_tenant_images_data: openstack_url_prefix + 'image/',
        get_tenant_volumes_data: openstack_url_prefix + 'volume/',
        get_host_security_group_data: openstack_url_prefix + 'securitygroup/',
        get_server_ip_data: openstack_url_prefix + 'ipserver/?server_id=:serverid',
        get_regions_data: openstack_url_prefix + 'region/',
        get_availability_zone_data: openstack_url_prefix + 'availability_zone/',
        get_os_tokens_data: openstack_url_prefix + 'token/',
        get_flavor_data: openstack_url_prefix + 'flavor/',
        get_vm_tenant_data: openstack_url_prefix + 'instances/',
        get_endpoint_data: openstack_url_prefix + 'endpoint/',
        get_os_host_data: openstack_url_prefix + 'oshost/',
        get_hypervisor_data: openstack_url_prefix + 'hypervisor/',
        get_tenant_list_data: openstack_url_prefix + 'tenant/',
        get_tenant_usage_data: openstack_url_prefix + 'tenantusage/',
        get_general_tenant_data: openstack_url_prefix + 'tenant/',
        get_nova_controllers_data: '/rest/v3/controller/',
        get_images_list_data: openstack_url_prefix + 'image/',
        get_tenant_keypairs: openstack_url_prefix + "tenant/:tenant_id/keypair/",
        get_tenant_flavors: openstack_url_prefix + "tenant/:tenant_id/flavors/",
        get_tenant_security_groups: openstack_url_prefix + "tenant/:tenant_id/security_groups/",
        get_tenant_images: openstack_url_prefix + "tenant/:tenant_id/images/",
        get_usage_info: openstack_url_prefix + "tenant/:tenant_id/usage",
        get_server_ip_info: openstack_url_prefix + "instances/:instance_id/server_ip",
        get_vms_info: openstack_url_prefix + "hypervisor/:hypervisor_id/instance/",
        get_flavor_access_info: openstack_url_prefix + "flavor/:flavor_id/flavor_access/",
        //Openstack Delete URLS
        delete_credentials: openstack_url_prefix + 'credential/',
        delete_tenants: openstack_url_prefix + 'tenant/',
        delete_regions: "",
        // ---------------------- Aws Urls ---------------------------
        get_aws_dashboard: '/rest/v3/aws/',
        add_aws_region: aws_url_prefix,
        edit_aws_region: v3_url_prefix + 'aws/:account_id/',
        aws_change_password: v3_url_prefix + 'aws/:account_id/change_password/',
        delete_aws_acccount: v3_url_prefix + 'aws/:account_id/',
        validate_aws_customer: aws_url_prefix + ':regionname/validate/',
        get_list_region: aws_url_prefix + 'us-west-2/list_regions/',
        get_user_list: aws_url_prefix + ':regionname/user/',
        get_instance_list: aws_url_prefix + ':regionname/instance/',
        get_avail_volume: aws_url_prefix + ':regionname/list_available_volume/',
        get_user_group: aws_url_prefix + ':regionname/user/:username/user_group/',
        get_user_detail: aws_url_prefix + ':regionname/user/:username/user_details/',
        get_entities: aws_url_prefix + ':regionname/list_entity/',
        aws_poweron: aws_url_prefix + ':regionname/instance/:instanceid/start_instance/',
        aws_poweroff: aws_url_prefix + ':regionname/instance/:instanceid/stop_instance/',
        aws_terminate: aws_url_prefix + ':regionname/instance/:instanceid/terminate_instance/',
        aws_instance_detail: aws_url_prefix + ':regionname/instance/:instanceid/instance_detail/',
        aws_list_policy: aws_url_prefix + ':regionname/list_policies/',
        aws_snapshot_list: aws_url_prefix + ':regionname/snapshot/',
        aws_load_balancer: aws_url_prefix + ':regionname/load_balancer/',
        aws_list_volume: aws_url_prefix + ':regionname/volume/',
        aws_list_asg: aws_url_prefix + ':regionname/list_auto_scaling_group/',
        aws_list_netinter: aws_url_prefix + ':regionname/list_network_interface/',
        get_aws_list_secgroup_data: aws_url_prefix + ':name/security_group/',
        get_images_list: aws_url_prefix + ':name/images/',
        add_aws_image: aws_url_prefix + ':name/instance/:instance_id/create_image/',
        attach_autoscaling_group: aws_url_prefix + ':name/instance/:instance_id/attach_asg/',
        attach_network_interface: aws_url_prefix + ':name/instance/:instance_id/attach_network_interface/',
        attach_loadbalancer: aws_url_prefix + ':name/instance/:instance_id/attach_loadbalancer/',
        copy_snapshot: aws_url_prefix + ':name/snapshot/:snapshot_id/copy_snapshots/',
        get_subnet_availability_zone_data: aws_url_prefix + ':name/instance_launch_data/',
        launch_instance: aws_url_prefix + ':name/instance/',
        //get_asg_list_data: aws_url_prefix + ':name/asg_dropdown/',
        get_asg_list_data: aws_url_prefix + ':name/instance/:instance_id/asg_dropdown/',
        get_network_interface_list: aws_url_prefix + ':name/instance/:instance_id/network_interface_dropdown/',
        get_loadbalancer_list: aws_url_prefix + ':name/instance/:instance_id/loadbalancer_dropdown/',

        //------------------------------ Dashboard V3 URLS ------------------------------------------
        dashboard_get_pinned_customers: url_prefix + 'pinned_organization',
        dashboard_get_datacenters: url_prefix + 'datacenter/',

        get_mschedules_url: v3_url_prefix + 'schedules/',
        create_mschedules: v3_url_prefix + 'mschedules/',
        edit_mschedules: v3_url_prefix + 'mschedules/:schedule_id/',
        delete_mschedules: v3_url_prefix + 'mschedules/:schedule_id/',
        mark_as_completed_mschedules: v3_url_prefix + 'mschedules/:schedule_id/',

        //Azure Links

        azure_account: v3_url_prefix + 'azure/',
        azure_edit: v3_url_prefix + 'azure/:account_id/',
        azure_delete: v3_url_prefix + 'azure/:account_id/',
        azure_resource_group: v3_url_prefix + 'azure/resource_group/',
        azure_resource_group_edit: v3_url_prefix + 'azure/:account_id/resource_group/:resource_id',
        azure_resource_group_delete: v3_url_prefix + 'azure/:account_id/resource_group/:resource_id',
        azure_virtual_machine: v3_url_prefix + 'azure/resource_group/',
        azure_virtual_machine_edit: v3_url_prefix + 'azure/:account_id/virtual_machine/:resource_id',
        azure_virtual_machine_delete: v3_url_prefix + 'azure/:account_id/virtual_machine/:resource_id',

        get_colocation: url_prefix + 'cabinet/get_colocations/',
        get_private_cloud: v3_url_prefix + 'private_cloud',
        get_public_cloud: v3_url_prefix + 'public_cloud',


        //vCenter Management Interface
        get_vmware_vcenter_dashboard: url_prefix + 'vcenter/',
        edit_vmware_vcenter: url_prefix + 'vcenter/:vcenter_id/',
        delete_vmware_vcenter: url_prefix + 'vcenter/:vcenter_id/',

        //ESXi Management Interface
        get_vmware_esxi_dashboard: url_prefix + 'esxi/',
        edit_vmware_esxi: url_prefix + 'esxi/:vesxi_id/',
        delete_vmware_esxi: url_prefix + 'esxi/:vesxi_id/',

        //OpenStack Management Interface
        get_openstack_dashboard: url_prefix + 'openstack/',
        edit_openstack: url_prefix + 'openstack/:openstack_id/',
        delete_openstack: url_prefix + 'openstack/:openstack_id/',

        //Load Balancer Management Interface
        get_f5lb_dashboard: url_prefix + 'f5loadbalancer/',
        edit_f5lb: url_prefix + 'f5loadbalancer/:f5lb_id/',
        delete_f5lb: url_prefix + 'f5loadbalancer/:f5lb_id/',

        //Cisco Management Interface
        get_cisco_dashboard: url_prefix + 'cisco/',
        edit_cisco: url_prefix + 'cisco/:cisco_id/',
        delete_cisco: url_prefix + 'cisco/:cisco_id/',

        //Citrix - Netscaler VPX device Management Interface
        get_citrix_vpx_dashboard: url_prefix + 'citrix_vpx_device/',
        edit_citrix_vpx: url_prefix + 'citrix_vpx_device/:citrix_vpx_id/',
        delete_citrix_vpx: url_prefix + 'citrix_vpx_device/:citrix_vpx_id/',

        //Citrix - Netscaler VPX device Management Interface
        get_juniper_dashboard: url_prefix + 'juniper_switch/',
        edit_juniper: url_prefix + 'juniper_switch/:juniper_id/',
        delete_juniper: url_prefix + 'juniper_switch/:juniper_id/',
    })
    .constant('TableHeaders', {

        tickets: [
            { key: 'ticket_id', title: 'Ticket ID' },
            { key: 'subject', title: 'Subject' },
            { key: 'customer', title: 'Customer' },
            { key: 'datacenter', title: 'Data Center' },
            { key: 'status', title: 'Status' },
            { key: 'priority', title: 'Priority' },
            { key: 'last_updated', title: 'Updated On' }
        ],
        alerts: [
            { key: 'source', title: 'Source' },
            { key: 'name', title: 'Name' },
            { key: 'datacenter', title: 'Datacenter' },
            // {key:'data_center',title: 'Date Center'},
            { key: 'resolution_state', title: 'Resolution State' },
            { key: 'created', title: 'Created' },
            { key: 'age', title: 'Age' }
        ],
        vm_vcenter_headers: [
            { key: 'name', title: 'Name' },
            { key: 'server', title: 'Server' },
            { key: 'datacenter', title: 'Datacenter' },
            { key: 'clusters', title: 'Clusters' },
            { key: 'hosts', title: 'Hosts' },
            { key: 'data_stores', title: 'Datastores' }
        ],
        vm_datacenters_header: [
            { key: 'name', title: 'Name' },
            { key: 'clusters', title: 'Clusters' },
            { key: 'hosts', title: 'Hosts' },
            { key: 'data_stores', title: 'Datastores' }
        ],
        vm_datastores_header: [
            { key: 'name', title: 'Name' },
            { key: 'capacity', title: 'Capacity (GB)' },
            { key: 'free', title: 'Free (GB)' },
            { key: 'uncommitted', title: 'Uncommitted (GB)' },
            { key: 'host', title: 'Host' },
            { key: 'virtual_machine', title: 'Virtual Machines' }
        ],
        vm_hypervisors_header: [
            { key: 'name', title: 'Name' },
            { key: 'power_state', title: 'Power State' },
            { key: 'cpu', title: 'CPU (MHz)' },
            { key: 'memory_size', title: 'Memory Size (GB)' },
            { key: 'cpu_count', title: 'CPU Count' },
            { key: 'nic_count', title: 'NIC Count' },
            { key: 'cpu_core_count', title: 'CPU Core Count' },
            { key: 'esxi_version', title: 'ESXI Version' },
            { key: 'uptime', title: 'Uptime' }
        ],
        vm_virtual_machines_header: [
            { key: 'name', title: 'Name' },
            { key: 'state', title: 'State' },
            { key: 'datacenter', title: 'Datacenter' },
            { key: 'used_space', title: 'Used Space (GB)' },
            { key: 'vcpus', title: 'VCPUs' },
            { key: 'guest_memory', title: 'Guest Memory (MB)' },
            { key: 'guest_os_name', title: 'Guest OS Name' }
        ],
        vm_clusters_header: [
            { key: 'name', title: 'Name' },
            { key: 'datacenter_name', title: 'Datacenter' },
            { key: 'vms', title: 'Virtual Machines' },
            { key: 'hosts', title: 'Hosts' }
        ],
        vm_customers_header: [
            { key: 'name', title: 'Name' },
            { key: 'datacenter', title: 'Number of Datacenter' },
            { key: 'number_of_hosts', title: 'Number of Hosts' },
            { key: 'number_of_vms', title: 'Number of VMs' }
        ],
        vm_folders_header: [
            { key: 'name', title: 'Name' },
            { key: 'datacenter', title: 'Datacenter' },
            { key: 'number_of_hosts', title: 'Number of Hosts' },
            { key: 'number_of_vms', title: 'Number of VMs' },
            { key: 'cluster', title: 'Cluster' },
            { key: 'data_stores', title: 'Datastores' },
            { key: 'folder', title: 'Folder' },
            { key: 'type', title: 'Type' }
        ],
        vm_resource_pool_header: [
            { key: 'name', title: 'Name' },
            { key: 'overall_cpu_usage', title: 'Overall CPU Usage (MHz)' },
            { key: 'host_memory_usage', title: 'Host Memory Usage (MB)' },
            { key: 'guest_memory_usage', title: 'Guest Memory Usage (MB)' },
            { key: 'cluster', title: 'Cluster' },
            { key: 'no_of_vm', title: 'Number Of VMs' },
            { key: 'swapped_memory', title: 'Swapped Memory (MB)' },
            { key: 'ballooned_memory', title: 'Ballooned Memory (MB)' }
        ],
        vm_listsnapshot_header: [
            { key: 'vm_name', title: 'Virtual Machine' },
            { key: 'snapshot_name', title: 'Snapshot Name' },
            { key: 'created_at', title: 'Created At' }
        ],
        vm_snapshot_header: [
            { key: 'vm_name', title: 'Virtual Machine' },
            { key: 'snapshot_name', title: 'Snapshot Name' },
            { key: 'created_at', title: 'Created At' }
        ],
        aws_account_headers: [
            { key: 'user', title: 'User' },
            { key: 'aws_user', title: 'Name' },
            { key: 'region', title: 'Regions' }
        ],
        aws_region_list_headers: [
            { key: 'endpoint', title: 'EndPoint' },
            { key: 'region_name', title: 'Region Name' }
        ],
        aws_user_list_headers: [
            { key: 'UserName', title: 'User Name' },
            { key: 'CreateDate', title: 'Created Date' },
            { key: 'Arn', title: 'ARN' }
        ],
        aws_usergroup_list_headers: [
            { key: 'GroupName', title: 'Group Name' },
            { key: 'CreateDate', title: 'Created Date' },
            { key: 'GroupId', title: 'Group Id' },
            { key: 'Arn', title: 'ARN' },
            { key: 'Path', title: 'Path' }
        ],
        aws_userdetails_headers: [
            { key: 'UserName', title: 'User Name' },
            { key: 'Path', title: 'Path' },
            { key: 'CreateDate', title: 'Created Date' },
            { key: 'UserId', title: 'User Id' },
            { key: 'Arn', title: 'ARN' }
        ],
        aws_volume_list_headers: [
            { key: 'availability_zone', title: 'Availability Zone' },
            { key: 'encrypted', title: 'Encrypted' },
            { key: 'volume_type', title: 'Volume Type' },
            { key: 'volume_size', title: 'Size (GiB)' },
            { key: 'state', title: 'State' },
            { key: 'iops', title: 'IOPS' },
            { key: 'create_time', title: 'Created Time' },
            { key: 'tags', title: 'Tags' }
        ],
        aws_instance_list_headers: [
            { key: 'instance_type', title: 'Type' },
            { key: 'public_ip', title: 'Public IP' },
            { key: 'availability_zone', title: 'Availability Zone' },
            { key: 'instance_state', title: 'Power State' },
            { key: 'launch_time', title: 'Launch Time' }
        ],
        aws_snapshot_list_headers: [
            { key: 'Description', title: 'Description' },
            { key: 'VolumeSize', title: 'Size (GiB)' },
            { key: 'State', title: 'Status' },
            { key: 'Encrypted', title: 'Encrypted' },
            { key: 'StartTime', title: 'Start Time' },
            { key: 'Progress', title: 'Progress' }
        ],
        aws_load_balancer_list_headers: [
            { key: 'LoadBalancerName', title: 'Name' },
            { key: 'Subnets', title: 'Subnets' },
            { key: 'SourceSecurityGroup', title: 'Source Security Group' },
            { key: 'SecurityGroups', title: 'Security Groups' },
            { key: 'CreatedTime', title: 'Created Time' },
            { key: 'AvailabilityZones', title: 'Availability Zones' }
        ],
        aws_available_volume_list_headers: [
            { key: 'availability_zone', title: 'Availability Zone' },
            { key: 'encrypted', title: 'Encrypted' },
            { key: 'volume_type', title: 'Volume Type' },
            { key: 'volume_size', title: 'Size (GiB)' },
            { key: 'state', title: 'State' },
            { key: 'iops', title: 'IOPS' },
            { key: 'create_time', title: 'Created Time' },
            { key: 'tags', title: 'Tags' }
        ],
        aws_instance_details_headers: [
            { key: 'InstanceId', title: 'Instance Id' },
            { key: 'ImageId', title: 'Image Id' },
            { key: 'RamdiskId', title: 'Ramdisk Id' },
            { key: 'KeyName', title: 'Key Name' },
            { key: 'HostId', title: 'Host Id' },
            { key: 'AvailabilityZone', title: 'Availability Zone' },
            { key: 'PrivateDnsName', title: 'Private Dns Name' },
            { key: 'PublicDnsName', title: 'Public Dns Name' },
            { key: 'KernelId', title: 'Kernel Id' },
            { key: 'InstanceState', title: 'InstanceState' },
            { key: 'MonitoringState', title: 'MonitoringState' },
            { key: 'SecurityGroup', title: 'Security Group' },
            { key: 'GroupName', title: 'GroupName' },
            { key: 'LaunchTime', title: 'LaunchTime' },
            { key: 'Platform', title: 'Platform' },
            { key: 'SubnetId', title: 'Subnet Id' },
            { key: 'InstanceType', title: 'Instance Type' },
            { key: 'LoadBalancers', title: 'LoadBalancers' },
            { key: 'Tags', title: 'Tags' }
        ],
        aws_s3_buckets_headers: [
            { key: 'bucket_name', title: 'Bucket Name' },
            { key: 'region', title: 'Region' },
            { key: 'creation_date', title: 'Creation Date' },
        ],
        aws_entities_group_headers: [
            { key: 'GroupName', title: 'Group Name' }
        ],
        aws_entities_user_headers: [
            { key: 'UserName', title: 'User Name' }
        ],
        aws_entities_role_headers: [
            { key: 'RoleName', title: 'Role Name' }
        ],
        aws_asg_headers: [
            { key: 'name', title: 'Name' },
            { key: 'instances', title: 'Instances', decorator: 'count' },
            { key: 'availability_zone', title: 'Availability Zone', decorator: 'results' },
            { key: 'min_size', title: 'Min Size' },
            { key: 'max_size', title: 'Max Size' },
            { key: 'desired_capacity', title: 'Desired Capacity' }
        ],
        aws_network_interface_headers: [
            { key: 'network_interface_id', title: 'Network Interface Id' },
            { key: 'availability_zone', title: 'Availability Zone' },
            { key: 'status', title: 'Status' },
            { key: 'mac_address', title: 'MAC Address' },
            { key: 'private_ip_address', title: 'Private IP Address' },
            { key: 'private_dns_name', title: 'Private DNS Name' }
        ],
        aws_security_group_headers: [
            { key: 'group_name', title: 'Security Group Name' },
            { key: 'group_id', title: 'Security Group Id' },
            { key: 'description', title: 'Description' },
            { key: 'vpc_id', title: 'Vpc Id' },
            { key: 'owner_id', title: 'Owner Id' }
        ],

        // Openstack headers

        availability_zone_headers: [
            { key: 'zone_name', title: 'Name' },
            { key: 'host_name', title: 'Host Name' },
            { key: 'zone_state', title: 'Available' }
        ],

        open_stack_token_headers: [
            { key: "access_secret", title: "Access Secret" }
        ],

        endpoints_table_headers: [
            { key: 'region_id', title: 'Region' },
            { key: 'url', title: 'URL' },
            { key: 'enabled', title: 'Enabled' },
            { key: 'interface', title: 'Interface' }
        ],
        tenant_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'host', title: 'Host' },
            { key: 'status', title: 'Status' },
            { key: 'image_name', title: 'Image' },
            { key: 'flavor_name', title: 'Flavor Name' },
            { key: 'created', title: 'Created Time' },
            { key: 'availability_zone', title: 'Availability Zone' }
        ],
        flavor_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'vcpus', title: 'VCPUS' },
            { key: 'memory_mb', title: 'RAM (MB)' },
            { key: 'root_gb', title: 'Root Disk (GB)' },
            { key: 'swap', title: 'Swap Disk (GB)' },
            { key: 'is_public', title: 'Public' }
        ],

        tenant_flavor_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'vcpus', title: 'VCPUS' },
            { key: 'ram', title: 'RAM (MB)' },
            { key: 'disk', title: 'Disk (GB)' },
        ],
        open_stacK_table_headers: [
            { key: 'links', title: 'Links' },
            { key: 'blob', title: 'BLOB' }
        ],

        keypairs_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'created_at', title: 'Created At' },
            { key: 'fingerprint', title: 'Fingerprint' }
        ],

        hosts_tenant_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'zone', title: 'Zone' },
            { key: 'service', title: 'Service' },
            { key: 'memory', title: 'Memory (MB)' },
            { key: 'cpu', title: 'CPU' },
            { key: 'disk', title: 'Disk (GB)' }
        ],
        service_catalog_table_headers: [
            { key: 'service_name', title: 'Service Name' },
            { key: 'service_type', title: 'Service Type' },
            { key: 'enabled', title: 'Enabled' },
            { key: 'admin_url', title: 'Admin URL' },
            { key: 'public_url', title: 'Public URL' },
            { key: 'internal_url', title: 'Internal URL' },
            { key: 'endpoint_data', title: 'Endpoint Data' },
            { key: 'extra', title: 'Extra' }
        ],
        regions_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'description', title: 'Description' },
            { key: 'parent_region_name', title: 'Parent Region' }
        ],
        hy_table_headers: [
            { key: 'hostname', title: 'Host Name' },
            { key: 'vcpus_used', title: 'VCPUs - Used' },
            { key: 'vcpus_total', title: 'VCPUs - Total' },
            { key: 'memory_used_mb', title: 'RAM (MB) - Used' },
            { key: 'memory_total_mb', title: 'RAM (MB) - Total' },
            { key: 'storage_used_gb', title: 'Storage (GB) - Used' },
            { key: 'storage_total_gb', title: 'Storage (GB) - Total' },
            { key: 'instance_count', title: 'Instances' },
            // {key:'status',title: 'Status'},
            // {key:'state',title: 'State'},
            // {key:'type',title: 'Type'},


        ],
        security_group_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'description', title: 'Description' }
        ],
        subnet_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'cidr', title: 'Network Address' },
            { key: 'gateway_ip', title: 'Gateway IP' },
            { key: 'enable_dhcp', title: 'DHCP' }
        ],
        general_tenant_table_headers: [
            { key: 'name', title: 'Name' },
            /*{key:'description',title: 'Description'},*/
            { key: 'enabled', title: 'Enabled' }
        ],
        image_list_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'image_type', title: 'Type' },
            { key: 'status', title: 'Status' },
            { key: 'public', title: 'Public' },
            { key: 'protected', title: 'Protected' },
            { key: 'disk_format', title: 'Format' },
            { key: 'size', title: 'Size (MB)' }
        ],
        credentials_headers: [
            { key: "links", title: "Links" },
            { key: "type", title: "Type" }
        ],
        openstack_server_ip_headers: [
            { key: "version", title: "Version" },
            { key: "address", title: "Address" }
        ],
        nova_table_headers: [
            { key: 'adapter_name', title: 'Controller Name' },
            { key: 'ip', title: "Controller IP" },
            { key: 'domain_name', title: 'Domain' }
        ],

        flavor_access_headers: [
            { key: 'tenant_id', title: 'Tenant' }
        ],

        tenat_usage_details: [
            { key: "name", title: "Instance Name" },
            { key: "uptime", title: " Uptime (Hours)" },
            { key: "memory_mb", title: "RAM Usage (MB)" },
            { key: "vcpus", title: "CPUs Usage" },
            { key: "local_gb", title: "Disk Usage (GB)" }
        ],
        tenant_table_headers_new: [
            { key: 'name', title: 'Name' },
            { key: 'host', title: 'Host' },
            { key: 'status', title: 'State' },
            // {key:'image_name', title: 'Image'},
            // {key:'flavor_id', title: 'Flavor'},
            // {key:'created', title: 'Created Time'}
        ],
        servers_table_headers: [
            { key: 'name', title: 'Name' },
            { key: 'host', title: 'Host' },
            { key: 'status', title: 'State' },
            // {key:'image_name', title: 'Image'},
            // {key:'flavor_id', title: 'Flavor'},
            // {key:'created', title: 'Created Time'}
        ],
        volumes_headers: [
            { key: "count", title: "Count" },
            { key: "previous", title: "Previous" },
            { key: "results", title: "Result" },
            { key: "next", title: "Next" }
        ],

        //Azure customer list
        azure_customer_headers: [
            { key: 'account_name', title: 'Account Name' },
            { key: 'user_email', title: 'User' },
            //{ key: 'location', title: 'Location' },
            { key: 'subscription_id', title: 'Subscription Id' }
        ],

        azure_resource_group_headers: [
            { key: 'name', title: 'Resource group Name' },
            { key: 'location', title: 'Location' },
            { key: 'tags', title: 'Tags' },
        ],

        azure_resource_headers: [
            { key: 'resource_group', title: 'Resource Group' },
            { key: 'name', title: 'Resource' },
            { key: 'location', title: 'Location' },
            { key: 'tags', title: 'Tags' },
            { key: 'category', title: 'Category' },
            //{key: 'kind',title: 'Kind'},
            //{key: 'properties',title: 'Properties'},
            // {key: 'managed_by',title: 'Managed By'},
            { key: 'plan', title: 'Plan' },
            { key: 'type', title: 'Type' },
            //{key: 'identity',title: 'Identity'},
        ],


        azure_vm_headers: [
            { key: 'resource_group', title: 'Resource Group' },
            { key: 'name', title: 'Name' },
            { key: 'availability_set', title: 'Availability Set' },
            { key: 'tags', title: 'Tags' },
            { key: 'provisioning_state', title: 'Provisioning State' },
            { key: 'plan', title: 'Plan' },
            { key: 'location', title: 'Location' },
            { key: 'license_type', title: 'License Type' },
        ],

        // VM backup headers
        openstack_vm_headers: [
            // {key: 'project',title: 'Project'},
            { key: 'name', title: 'Image Name' },
            { key: 'operating_system', title: 'Operating System' },
            { key: 'last_known_state', title: 'Power State' },
            { key: 'updated_at', title: 'Updated At' },
            { key: 'ip_address', title: 'IP Address' },
            // { key: 'disk_format', title: 'Format' },
            { key: 'memory', title: 'Memory(MB)' },
            { key: 'backup_status', title: 'Backup Status' },
            { key: 'backup_date', title: 'Backup Time' },
            { key: 'openstack_actions', title: 'Actions' }
        ],

        vmware_vm_headers: [
            { key: 'name', title: 'Virtual Machine' },
            { key: 'os_name', title: 'OS' },
            { key: 'host_name', title: 'Host Name' },
            { key: 'used_space', title: 'Used (GB)' },
            { key: 'state', title: 'Power State' },
            { key: 'datacenter', title: 'Datacenter' },
            { key: 'guest_memory', title: 'RAM (MB)' },
            { key: 'backup_date', title: 'Backedup At' },
            { key: 'backup_status', title: 'Backup Status' },
            { key: 'vmware_actions', title: 'Actions' }
        ],

        openstack_migration_headers: [
             {key: 'name',title: 'Instance Name'},
             {key: 'vcpu',title: 'CPUs'},
             {key: 'memory',title: 'Memory (MB)'},
             {key: 'disk',title: 'Disk'},
             {key: 'operating_system',title: 'Image'},
             {key: 'ip_address',title: 'IP Address'},
             {key: 'last_known_state',title: 'Power State'},
             {key: 'migration_status',title: 'Migration Status'},
             {key: 'migration_date',title: 'Migration Date'},
             {key: 'openstack_actions',title: 'Actions'}
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
            { key: 'vm_name', title: 'Virtual Machine'},
            { key: 'cpus', title: 'No. of CPUs'},
            { key: 'ram_size', title: 'RAM size in MB'},
            { key: 'hostname', title: 'Hostname'},
            { key: 'internal_ip', title: 'Internal IP'},
            { key: 'routable_ip', title: 'Routable IP'},
            { key: 'status', title: 'Power State'},
            { key: 'created_at', title: 'Created on'},
            { key: 'actions', title: 'Actions'}
        ],


        //Maintenance Schedules
        mschedules_headers: [
            { key: 'description', title: 'Description' },
            { key: 'status', title: 'Status' },
            { key: 'datacenter', title: 'Datacenter' },
            { key: 'impacted_customer', title: 'Impacted Customer' },
            { key: 'start_date', title: 'Start Date' },
            { key: 'end_date', title: 'End Date' }
        ],

        maintanence_schedules: [
            { key: 'datacenter', title: 'Datacenter' },
            { key: 'description', title: 'Description' },
            { key: 'impacted_customer', title: 'Impacted Customer' },
            { key: 'status', title: 'Status' },
            { key: 'start_date', title: 'Start Date' },
            { key: 'end_date', title: 'End Date' }
        ],

        // Management interface
        vcenter_headers: [
            { key: 'name', title: 'Name' },
            { key: 'backend_url', title: 'vCenter Server (Backend URL)' },
            { key: 'proxy_url', title: 'Access URL' },
            // {key: 'cloud',title: 'Private Cloud'}
        ],

        vesxi_headers: [
            { key: 'name', title: 'Name' },
            { key: 'backend_url', title: 'ESXi Server (Backend URL)' },
            { key: 'proxy_url', title: 'Access URL' },
            // {key: 'cloud',title: 'Private Cloud'}
        ],

        openstack_headers: [
            { key: 'name', title: 'Name' },
            { key: 'backend_url', title: 'OpenStack Controller (Backend URL)' },
            { key: 'proxy_url', title: 'Access URL' },
            // {key: 'cloud',title: 'Private Cloud'}
        ],

        f5lb_headers: [
            { key: 'name', title: 'Name' },
            { key: 'backend_url', title: 'F5 Load Balancer (Backend URL)' },
            { key: 'proxy_url', title: 'Access URL' },
            // {key: 'load_balancer',title: 'LoadBalancer'}
        ],
        cisco_headers: [
            { key: 'name', title: 'Name' },
            { key: 'backend_url', title: 'Cisco Server (Backend URL)' },
            { key: 'proxy_url', title: 'Access URL' },
            // {key: 'firewall',title: 'Firewall'}
        ],

        citrix_vpx_headers: [
            { key: 'name', title: 'Name' },
            { key: 'backend_url', title: 'Citrix VPX Device (Backend URL)' },
            { key: 'proxy_url', title: 'Access URL' },
            // {key: 'load_balancer',title: 'LoadBalancer'}
        ],

        juniper_headers: [
            { key: 'name', title: 'Name' },
            { key: 'backend_url', title: 'Juniper Host (Backend URL)' },
            { key: 'proxy_url', title: 'Access URL' },
            // {key: 'switch',title: 'Switch'}
        ],
    })
    .constant('userAPI', {});

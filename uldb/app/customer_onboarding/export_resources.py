from resources import *


class StatusRemarksModelResource(resources.ModelResource):
    delete = fields.Field(
        column_name='Delete',
    )

    status = fields.Field(
        column_name='Status',
    )

    remarks = fields.Field(
        column_name='Remarks',
        default=''
    )

    def dehydrate_status(self, obj):
        return 'Success'

    def dehydrate_delete(self, obj):
        return 'Retain Asset'


class ExportColoCloudResource(resources.ModelResource):
    name = fields.Field(
        column_name='Name',
        attribute='name',
    )

    location = fields.Field(
        column_name='Location',
        attribute='location',
    )

    status = fields.Field(
        column_name='Status',
    )

    remarks = fields.Field(
        column_name='Remarks',
        default=''
    )

    def dehydrate_status(self, obj):
        return 'Success'

    def dehydrate_delete(self, obj):
        return 'Retain Asset'

    class Meta:
        model = ColoCloud

        fields = (
            'name', 'location', 'status', 'remarks'
        )

        export_order = (
            'name', 'location', 'status', 'remarks'
        )


class ExportCabinetResource(StatusRemarksModelResource):
    name = fields.Field(
        column_name='Name',
        attribute='name',
    )

    cabinet_type = fields.Field(
        column_name='Type',
        attribute='cabinet_type',
        widget=ForeignKeyWidget(CabinetTypes, 'cabinet_type')
    )

    colocloud_set = fields.Field(
        column_name='Datacenter',
        attribute="colocloud_set",
        widget=ManyToManyWidget(ColoCloud, field='name')
    )

    cabinet_model = fields.Field(
        column_name='Model',
        attribute='cabinet_model',
        widget=ForeignKeyWidget(CabinetModels, 'model')
    )

    class Meta:
        fields = (
            'name', 'colocloud_set', 'cabinet_model', 'cabinet_type',
            'delete', 'status', 'remarks'
        )

        export_order = (
            'name', 'colocloud_set', 'cabinet_model', 'cabinet_type',
            'delete', 'status', 'remarks'
        )


class ExportSwitchResource(StatusRemarksModelResource):
    name = fields.Field(
        column_name='Name',
        attribute='name',
    )

    cabinet = fields.Field(
        column_name='Cabinet',
        attribute='cabinet',
        widget=ForeignKeyWidget(Cabinet, 'name')
    )

    manufacturer = fields.Field(
        column_name='Make',
        attribute='model__manufacturer__name',
    )

    model = fields.Field(
        column_name='Model',
        attribute='model',
        widget=ForeignKeyWidget(SwitchModel, 'name')
    )

    asset_tag = fields.Field(
        column_name='Asset Tag',
        attribute='asset_tag',
    )

    cloud_set = fields.Field(
        column_name='Cloud',
        attribute="cloud_set",
        widget=ManyToManyWidget(Cloud, field='name')
    )

    management_ip = fields.Field(
        column_name='Management IP',
        attribute='management_ip',
    )

    ip_address = fields.Field(
        column_name='IP Address',
        attribute='ip_address',
    )

    size = fields.Field(
        column_name='Size',
        attribute='size',
    )

    position = fields.Field(
        column_name='Position',
        attribute='position',
    )

    snmp_community = fields.Field(
        column_name='SNMP String',
        attribute='snmp_community',
    )

    web_url = fields.Field(
        column_name='Web URL',
    )

    class Meta:
        fields = (
            'name', 'cabinet', 'size', 'position', 'manufacturer', 'model', 'asset_tag',
            'cloud_set', 'management_ip', 'web_url', 'ip_address', 'snmp_community',
            'delete', 'status', 'remarks'
        )

        export_order = (
            'name', 'cabinet', 'size', 'position', 'manufacturer', 'model', 'asset_tag',
            'cloud_set', 'management_ip', 'web_url', 'ip_address', 'snmp_community',
            'delete', 'status', 'remarks'
        )


class ExportFirewallResource(StatusRemarksModelResource):
    name = fields.Field(
        column_name='Name',
        attribute='name',
    )

    cabinet = fields.Field(
        column_name='Cabinet',
        attribute='cabinet',
        widget=ForeignKeyWidget(Cabinet, 'name')
    )

    manufacturer = fields.Field(
        column_name='Make',
        attribute='model__manufacturer__name',
    )

    model = fields.Field(
        column_name='Model',
        attribute='model',
        widget=ForeignKeyWidget(FirewallModel, 'name')
    )

    asset_tag = fields.Field(
        column_name='Asset Tag',
        attribute='asset_tag',
    )

    cloud_set = fields.Field(
        column_name='Cloud',
        attribute="cloud_set",
        widget=ManyToManyWidget(Cloud, field='name')
    )

    management_ip = fields.Field(
        column_name='Management IP',
        attribute='management_ip',
    )

    ip_address = fields.Field(
        column_name='IP Address',
        attribute='ip_address',
    )

    size = fields.Field(
        column_name='Size',
        attribute='size',
    )

    position = fields.Field(
        column_name='Position',
        attribute='position',
    )

    snmp_community = fields.Field(
        column_name='SNMP String',
        attribute='snmp_community',
    )

    web_url = fields.Field(
        column_name='Web URL',
    )

    class Meta:
        fields = (
            'name', 'cabinet', 'size', 'position', 'manufacturer', 'model', 'asset_tag',
            'cloud_set', 'management_ip', 'web_url', 'ip_address', 'snmp_community',
            'delete', 'status', 'remarks'
        )

        export_order = (
            'name', 'cabinet', 'size', 'position', 'manufacturer', 'model', 'asset_tag',
            'cloud_set', 'management_ip', 'web_url', 'ip_address', 'snmp_community',
            'delete', 'status', 'remarks'
        )


class ExportLoadbalancerResource(StatusRemarksModelResource):
    name = fields.Field(
        column_name='Name',
        attribute='name',
    )

    cabinet = fields.Field(
        column_name='Cabinet',
        attribute='cabinet',
        widget=ForeignKeyWidget(Cabinet, 'name')
    )

    manufacturer = fields.Field(
        column_name='Make',
        attribute='model__manufacturer__name',
    )

    model = fields.Field(
        column_name='Model',
        attribute='model',
        widget=ForeignKeyWidget(LoadBalancerModel, 'name')
    )

    asset_tag = fields.Field(
        column_name='Asset Tag',
        attribute='asset_tag',
    )

    cloud_set = fields.Field(
        column_name='Cloud',
        attribute="cloud_set",
        widget=ManyToManyWidget(Cloud, field='name')
    )

    management_ip = fields.Field(
        column_name='Management IP',
        attribute='management_ip',
    )

    ip_address = fields.Field(
        column_name='IP Address',
        attribute='ip_address',
    )

    size = fields.Field(
        column_name='Size',
        attribute='size',
    )

    position = fields.Field(
        column_name='Position',
        attribute='position',
    )

    snmp_community = fields.Field(
        column_name='SNMP String',
        attribute='snmp_community',
    )

    web_url = fields.Field(
        column_name='Web URL',
    )

    class Meta:
        fields = (
            'name', 'cabinet', 'size', 'position', 'manufacturer', 'model', 'asset_tag',
            'cloud_set', 'management_ip', 'web_url', 'ip_address', 'snmp_community',
            'delete', 'status', 'remarks'
        )

        export_order = (
            'name', 'cabinet', 'size', 'position', 'manufacturer', 'model', 'asset_tag',
            'cloud_set', 'management_ip', 'web_url', 'ip_address', 'snmp_community',
            'delete', 'status', 'remarks'
        )


class VMWarePrivateCloudResource(StatusRemarksModelResource):
    hostname = fields.Field(
        column_name='vCenter SSL URL',
        attribute='hostname',
        widget=VcenterURLWidget()
    )

    username = fields.Field(
        column_name='Username',
        attribute='username',
    )

    name = fields.Field(
        column_name='Name',
        attribute='private_cloud__name',
    )

    colocation_cloud = fields.Field(
        column_name='Datacenter',
        attribute='private_cloud__colocation_cloud__name',
    )

    def dehydrate_hostname(self, value):
        return 'https://{}'.format(value)

    class Meta:
        fields = (
            'hostname', 'name', 'colocation_cloud', 'username', 'delete', 'status', 'remarks'
        )

        export_order = (
            'hostname', 'name', 'colocation_cloud', 'username', 'delete', 'status', 'remarks'
        )


class ExportPDUResource(StatusRemarksModelResource):
    name = fields.Field(
        column_name='Name',
        attribute='name',
    )

    cabinet = fields.Field(
        column_name='Cabinet',
        attribute='cabinet',
        widget=ForeignKeyWidget(Cabinet, 'name')
    )

    model = fields.Field(
        column_name='Model',
        attribute='model',
        widget=ForeignKeyWidget(PDUModel, 'model_number')
    )

    pdu_type = fields.Field(
        column_name='PDU Type',
        attribute='pdu_type',
    )

    position = fields.Field(
        column_name='Position',
        attribute='position',
        default=0
    )

    sockets = fields.Field(
        column_name='Number of sockets',
        attribute='sockets',
    )

    ip_address = fields.Field(
        column_name='IP Address',
        attribute='ip_address',
    )

    snmp_community = fields.Field(
        column_name='SNMP String',
        attribute='snmp_community',
    )

    assettag = fields.Field(
        column_name='Asset Tag',
        attribute='assettag',
    )

    class Meta:
        export_order = (
            'name', 'cabinet', 'pdu_type', 'position', 'sockets',
            'model', 'ip_address', 'snmp_community', 'assettag',
            'delete', 'status', 'remarks'
        )


class ExportHyperVisorResource(StatusRemarksModelResource):
    name = fields.Field(
        column_name='Name',
        attribute='system__name',
    )

    os_name = fields.Field(
        column_name='Operating System',
        attribute='os__name',
    )

    os_version = fields.Field(
        column_name='OS Version',
        attribute='os__version',
    )

    cabinet = fields.Field(
        column_name='Cabinet',
        attribute='system__cabinet',
    )

    capcity_gb = fields.Field(
        column_name='Storage',
        attribute='system__capcity_gb',
    )

    num_cpus = fields.Field(
        column_name='CPUs',
        attribute='system__num_cpus',
    )

    memory_mb = fields.Field(
        column_name='Memory',
        attribute='system__memory_mb',
    )

    size = fields.Field(
        column_name='Size',
        attribute='system__size',
    )

    position = fields.Field(
        column_name='Position',
        attribute='system__position',
        default=0,
    )

    private_cloud = fields.Field(
        column_name='Cloud',
        attribute='system__private_cloud',
    )

    asset_tag = fields.Field(
        column_name='Asset Tag',
        attribute='system__asset_tag',
    )

    ip_address = fields.Field(
        column_name='IP Address',
        attribute='system__ip_address',
    )

    cpu_model = fields.Field(
        column_name='CPU Model',
    )

    management_ip = fields.Field(
        column_name='Mgmt Hostname',
    )

    web_url = fields.Field(
        column_name='Web URL',
    )

    snmp_community = fields.Field(
        column_name='SNMP String',
        attribute='system__snmp_community',
    )

    class Meta:
        export_order = (
            'name', 'cabinet', 'size', 'position', 'cpu_model',
            'num_cpus', 'memory_mb', 'capcity_gb', 'os_name', 'os_version',
            'management_ip', 'asset_tag', 'private_cloud', 'web_url',
            'ip_address', 'snmp_community', 'delete', 'status', 'remarks'
        )


class ExportBMResource(StatusRemarksModelResource):
    name = fields.Field(
        column_name='Name',
        attribute='server__name',
    )

    bmc_type = fields.Field(
        column_name='BM Type',
        attribute='bmc_type',
    )

    manufacturer = fields.Field(
        column_name='Hardware Manufacturer',
    )

    os_name = fields.Field(
        column_name='Operating System',
        attribute='os__name',
    )

    os_version = fields.Field(
        column_name='OS Version',
        attribute='os__version',
    )

    cabinet = fields.Field(
        column_name='Cabinet',
        attribute='server__cabinet',
    )

    capcity_gb = fields.Field(
        column_name='Storage',
        attribute='server__capcity_gb',
    )

    num_cpus = fields.Field(
        column_name='CPUs',
        attribute='server__num_cpus',
    )

    memory_mb = fields.Field(
        column_name='Memory',
        attribute='server__memory_mb',
    )

    size = fields.Field(
        column_name='Size',
        attribute='server__size',
    )

    position = fields.Field(
        column_name='Position',
        attribute='server__position',
        default=0,
    )

    private_cloud = fields.Field(
        column_name='Cloud',
        attribute='system__private_cloud',
    )

    asset_tag = fields.Field(
        column_name='Asset Tag',
        attribute='system__asset_tag',
    )

    ip_address = fields.Field(
        column_name='IP Address',
        attribute='system__ip_address',
    )

    cpu_model = fields.Field(
        column_name='CPU Model',
    )

    management_ip = fields.Field(
        column_name='Client/Machine SSH/RDP IP',
        attribute='management_ip',
    )

    port = fields.Field(
        column_name='Clinet/Machine SSH Port',
    )

    web_url = fields.Field(
        column_name='Web URL',
    )

    snmp_community = fields.Field(
        column_name='SNMP String',
        attribute='system__snmp_community',
    )

    ipmi_ip = fields.Field(
        column_name='Management/IPMI IP',
    )

    username = fields.Field(
        column_name='IPMI Username',
    )

    password = fields.Field(
        column_name='IPMI Password',
    )

    def dehydrate_ipmi_ip(self, obj):
        if hasattr(obj, 'bm_controller'):
            if obj.bm_controller is not None:
                return obj.bm_controller.ip
        return None

    def dehydrate_username(self, obj):
        if hasattr(obj, 'bm_controller'):
            if obj.bm_controller is not None:
                return obj.bm_controller.username
        return None

    def dehydrate_password(self, obj):
        if hasattr(obj, 'bm_controller'):
            if obj.bm_controller is not None:
                return obj.bm_controller.password
        return None

    class Meta:

        export_order = (
            'name', 'bmc_type', 'manufacturer', 'cabinet', 'size',
            'position', 'management_ip', 'port', 'ipmi_ip', 'username',
            'password', 'cpu_model', 'num_cpus', 'memory_mb',
            'capcity_gb', 'os_name', 'os_version', 'asset_tag',
            'private_cloud', 'web_url', 'ip_address', 'snmp_community',
            'delete', 'status', 'remarks'
        )

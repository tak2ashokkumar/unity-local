# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#   All Rights Reserved.

"""models.py

Model code for ULDB inventory.

# Comments: Created - 111/2013A
"""

from __future__ import absolute_import
from __future__ import unicode_literals

from app.Utils.utility import generate_uuid
from django.core.exceptions import ValidationError

from app.inventory import *
from app.inventory.models import *
from app.organization.models import *
from app.user2.models import *
from app.common.models import *


class CircuitOption(models.Model):
    circuitoption_id = models.AutoField(primary_key=True)
    circuits = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        unique=True,
        verbose_name='Circuits')
    power_type = models.CharField(
        max_length=128,
        default='AC',
        verbose_name='Power Type')
    power_size = models.CharField(
        max_length=128,
        default='120V',
        verbose_name='Power Size')
    power_configuration = models.CharField(
        max_length=128, verbose_name='Configuration')

    def __unicode__(self):
        return u'%s' % self.circuitoption_id

    def __repr__(self):
        return u'%s' % self.circuitoption_id

    class Meta:
        verbose_name = 'Circuit'
        db_table = 'circuitoption'
        ordering = ['circuits']
        permissions = (('view', 'Can view circuitoption'),)


class CabinetOption(models.Model):
    cabinetoption_id = models.AutoField(primary_key=True)
    cabinet_options = models.CharField(
        max_length=128,
        default='Full',
        unique=True,
        verbose_name='Cabinet Options')

    def __unicode__(self):
        return u'%s' % self.cabinet_options

    def __repr__(self):
        return u'%s' % self.cabinet_options

    class Meta:
        verbose_name = 'Cabinet'
        db_table = 'cabinetoption'
        ordering = ['cabinet_options']
        permissions = (('view', 'Can view cabinetoption'),)

    def clean(self):
        if self.cabinet_options and not self.cabinetoption_id:
            if CabinetOption.objects.filter(
                    cabinet_options__iexact=self.cabinet_options):
                raise ValidationError(
                    {'cabinet_options': 'Cabinet_options must be in unique'})
        if self.cabinet_options and self.cabinetoption_id:
            if CabinetOption.objects.filter(
                    cabinet_options=self.cabinet_options, cabinetoption_id=self.cabinetoption_id):
                pass
            else:
                if CabinetOption.objects.filter(
                        cabinet_options__iexact=self.cabinet_options):
                    raise ValidationError(
                        {'cabinet_options': 'Cabinet options must be in unique'})
        return


class Racks(TimeStampModel, UserStampModel):
    colocation_id = models.AutoField(primary_key=True)
    colocation_name = models.CharField(max_length=45, default='San Francisco')
    cages = models.CharField(max_length=45, null=True, blank=True)
    cabinet = models.ForeignKey(
        'datacenter.Cabinet',
        db_column='cabinet_id',
        blank=True,
        null=True)
    cabinetoption = models.ForeignKey(
        CabinetOption,
        db_column='cabinetoption_id',
        blank=True,
        null=True)
    circuitoption = models.ForeignKey(
        CircuitOption,
        db_column='circuitoption_id',
        blank=True,
        null=True)
    switch = models.ForeignKey(
        'inventory.Switch',
        db_column='switch_id',
        blank=True,
        null=True)
    customer = models.ForeignKey(
        Organization,
        db_column='organization_id',
        blank=True,
        null=True)
    assigned_date = models.DateTimeField(auto_now_add=True)
    ordered_date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return u'%s' % self.colocation_name

    def __repr__(self):
        return u'%s' % self.colocation_name

    @property
    def organization_id(self):
        return self.customer.id

    class Meta:
        verbose_name = 'Racks'
        db_table = 'colocation'
        ordering = ['colocation_id']
        permissions = (('view', 'Can view racks'),)


class CloudTypes(models.Model):
    MEASURE_TYPE = (
        (u'GB', u'GB'),
        (u'TB', u'TB'),
        (u'MB', u'MB'),
    )

    cloud_type_id = models.AutoField(primary_key=True)
    cloud_type = models.CharField(
        max_length=128,
        default='Custom',
        unique=True,
        verbose_name='Type')
    vcpu = models.IntegerField(verbose_name='vCPU')
    memorysize = models.IntegerField(null=True, verbose_name='Memory Size')
    memory_measuretype = models.CharField(
        max_length=12,
        choices=MEASURE_TYPE,
        default=MEASURE_TYPE[0][0],
        verbose_name='Type')
    disksize = models.IntegerField(null=True, verbose_name='Disk Size')
    disk_measuretype = models.CharField(
        max_length=12,
        choices=MEASURE_TYPE,
        default=MEASURE_TYPE[0][0],
        verbose_name='Type')
    ethports = models.IntegerField()

    def __unicode__(self):
        return u'%s' % self.cloud_type

    def __repr__(self):
        return u'%s' % self.cloud_type

    class Meta:
        verbose_name = 'Cloud Types'
        db_table = 'cloudtypes'
        permissions = (('view', 'Can view cloudtypes'),)


class InstanceTypes(models.Model):
    instance_type_id = models.AutoField(primary_key=True)
    instance_type = models.CharField(
        max_length=128,
        default='PHYSICAL',
        unique=True,
        verbose_name='Instance Type')

    def __unicode__(self):
        return u'%s' % self.instance_type

    def __repr__(self):
        return u'%s' % self.instance_type

    class Meta:
        db_table = 'instancetypes'
        ordering = ['instance_type']
        permissions = (('view', 'Can view instancetypes'),)

    def clean(self):
        if self.instance_type and not self.instance_type_id:
            if InstanceTypes.objects.filter(
                    instance_type__iexact=self.instance_type):
                raise ValidationError(
                    {'instance_type': 'Server type must be in unique'})
        if self.instance_type and self.instance_type_id:
            if InstanceTypes.objects.filter(
                    instance_type=self.instance_type, instance_type_id=self.instance_type_id):
                pass
            else:
                if InstanceTypes.objects.filter(instance_type__iexact=self.instance_type):
                    raise ValidationError(
                        {'instance_type': 'Server type must be in unique'}
                    )
        return


class HostMixin(AddressableModel, InventoryModel, AssetMixin):
    INSTANCE_TYPES = (
        ('Hypervisor', 'Hypervisor'),
        ('Physical', 'Physical'),
        ('SAN', 'SAN'),
        ('Virtual', 'Virtual'),
    )
    hostname = models.CharField(max_length=256)
    domain = models.CharField(max_length=256)
    host_type = models.CharField(max_length=32,
                                 choices=INSTANCE_TYPES,
                                 db_column='instance_type_id',
                                 null=True,
                                 blank=True)
    os = models.ForeignKey('inventory.OperatingSystem',
                           null=True,
                           on_delete=models.SET_NULL)

    class Meta:
        abstract = True


class Instance(AddressableModel, UserStampModel):
    instance_id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=128,
        blank=False,
        null=False,
        verbose_name='Instance Name')
    INSTANCE_TYPES = (
        ('Hypervisor', 'Hypervisor'),
        ('Physical', 'Physical'),
        ('SAN', 'SAN'),
        ('Virtual', 'Virtual'),
    )
    instance_type = models.CharField(max_length=32,
                                     choices=INSTANCE_TYPES,
                                     db_column='instance_type_id',
                                     null=True,
                                     blank=True)
    virtualization_type = models.CharField(max_length=32, default="None")
    state = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='State')
    os_rootuser = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        verbose_name='Root User')
    os_rootpassword = EncryptedPasswordField( null=True, blank=True)
    os_privatekey = EncryptedPasswordField( null=True, blank=True)
    functional_hostname = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='Functional Hostname')
    os = models.ForeignKey(
        'inventory.OperatingSystem',
        db_column='os_id',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
        )
    system = models.OneToOneField(
        'inventory.Server',
        db_column='system_id',
        null=True,
        blank=True,
        related_name='instance',
        on_delete=models.CASCADE)
    virtualsystem = models.OneToOneField(
        'inventory.VirtualMachine',
        db_column='virtualsystem_id',
        null=True,
        blank=True,
        verbose_name='Virtual System',
        related_name='instance',
        on_delete=models.CASCADE)
    customer = models.ForeignKey(
        Organization,
        db_column='customer_id',
        null=True,
        blank=True)
    is_allocated = models.BooleanField(
        default=False, verbose_name='Instance Allocation State')
    is_vdc = models.BooleanField(default=False, verbose_name='SET VDC')
    assigned_date = models.DateTimeField(
        auto_now_add=True, verbose_name='Assigned Date')
    ordered_date = models.DateTimeField(default=timezone.now, verbose_name='Ordered Date')
    ulapi_uuid = models.UUIDField(
        null=True, blank=True, verbose_name='ULAPI_UUID')
    uuid = models.UUIDField(null=True, blank=True, verbose_name='UUID', default=generate_uuid)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    @property
    def organization_id(self):
        return self.customer.id

    class Meta:
        verbose_name = 'Instance'
        db_table = 'instance'
        ordering = ['name']
        permissions = (('view', 'Can View instance'),)

    def save(self, *args, **kwargs):
        if self.customer:
            self.is_allocated = True
        else:
            self.is_allocated = False
        super(Instance, self).save(*args, **kwargs)

    def clean(self):
        if self.name and not self.instance_id:
            if Instance.objects.filter(
                    name__iexact=self.name):
                raise ValidationError(
                    {'name': 'Instance name must be in unique'})
        if self.name and self.instance_id:
            if Instance.objects.filter(
                    name=self.name, instance_id=self.instance_id):
                pass
            else:
                if Instance.objects.filter(
                        name__iexact=self.name):
                    raise ValidationError(
                        {'name': 'Instance name must be in unique'})
        return

    def is_physical(self):
        return not self.virtualsystem

    def is_virtual(self):
        return not self.is_physical()

    @property
    def get_physical_server_specs(self):

        """
        :return: a spec representing how many cpus and its specs
        """
        # Collect disk, cpu and memory specifications for physical instance(s)
        # from app.inventory.models import *
        cpu_spec = ''
        mem_spec = ''
        disk_spec = ''
        ins = Instance.objects.get(instance_id=self.instance_id)
        sys = Server.objects.get(id=ins.system_id)
        # Get associated cpu details from system
        cpu_list = MotherboardPeripheralMap.objects.filter(motherboard_id=sys.motherboard_id,
                                                           peripheral_type__peripheral_type='CPU').values_list(
            'peripheral_id', flat=True)
        cpu = CPU.objects.filter(cpu_id__in=cpu_list)
        if cpu:
            cpu_spec = 'CPU: ' + str(len(cpu)) + ' X ' + cpu[0].cpu_type.model + ' @ ' + str(
                cpu[0].cpu_type.cpu_speed) + 'Ghz'

        # Get associated memory details from system
        memory_list = MotherboardPeripheralMap.objects.filter(motherboard_id=sys.motherboard_id,
                                                              peripheral_type__peripheral_type='MEMORY').values_list(
            'peripheral_id', flat=True)
        memory = Memory.objects.filter(memory_id__in=memory_list)
        if memory:
            msize = 0
            for mem in memory:
                msize += mem.capacity_gb
            msize = str(msize)
            msize = msize.replace(".0", "")
            mem_spec = 'MEM: ' + str(len(memory)) + ' DIMMs, ' + msize + ' GiB Total - ' + memory[
                0].memory_type.memory_type

        # Get disk details from system_disk_map
        diskobj = Disk.objects.filter(system=ins.system_id)
        # Collect total disk capacity
        if diskobj:
            size = 0
            for disk in diskobj:
                size += disk.disk_type.capacity_gb
            size = str(size)
            size = size.replace(".0", "")
            disk_spec = 'HDD: ' + str(len(diskobj)) + ' No\'s, ' + size + ' Gib Total - ' + disk.disk_type.formfactor + \
                        ' ' + disk.disk_type.disk_interface

        return disk_spec + '\n ' + mem_spec + '\n ' + cpu_spec

    @property
    def get_virtual_server_specs(self):
        # from app.inventory.models import *
        # Collect disk, cpu and memory specifications for virtual instance(s)
        virt_specs = []
        ins = Instance.objects.get(instance_id=self.instance_id)
        virtsystem = VirtualMachine.objects.filter(
            virtualsystem_id=ins.virtualsystem_id)
        if virtsystem:
            cloudtype = virtsystem[0].cloud_type
            if cloudtype:
                cloudtype = cloudtype.cloud_type
            else:
                cloudtype = 'Custom'
            specs = 'vCPU: ' + str(virtsystem[0].vcpu) + ' - Memory: ' + str(virtsystem[0].memory) + ' ' + \
                    virtsystem[0].memory_measuretype + ' - Disk: ' + str(virtsystem[0].disk) + ' ' + \
                    virtsystem[0].disk_measuretype + \
                    ' - No of Eths: ' + str(virtsystem[0].ethports)
            return specs


class InstanceConnectionDetails(models.Model):
    icd_id = models.AutoField(primary_key=True)
    instance = models.ForeignKey(
        Instance,
        db_column='instance_id',
        null=True,
        blank=True)
    system = models.ForeignKey(
        'inventory.Server',
        db_column='system_id',
        null=True,
        blank=True)
    interface_name = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='Interface')
    interface_type = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='Interface Type')
    nic_macaddress = models.CharField(
        max_length=30,
        null=True,
        blank=True,
        verbose_name='NIC MAC Address')
    nic_ipaddress = models.GenericIPAddressField(
        null=True, blank=True, verbose_name='NIC IP Address')
    default_gateway = models.GenericIPAddressField(
        null=True, blank=True, default=None, verbose_name='Default Gateway')
    vlan_tag = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        verbose_name='VLAN Tag')
    pxeinterface = models.BooleanField(
        default=False, verbose_name='PXE Interface')
    management_interface = models.BooleanField(
        default=False, verbose_name='Management Interface')
    bridge_mode = models.BooleanField(
        default=False, verbose_name='Bridge mode')

    def __unicode__(self):
        return u'%s' % self.icd_id

    def __repr__(self):
        return u'%s' % self.icd_id

    @property
    def organization_id(self):
        return self.system.customer.id

    class Meta:
        verbose_name = 'Instance connection'
        db_table = 'instanceconnectiondetails'
        permissions = (('view', 'Can view Instance connection details'),)


class SystemSwitchMap(models.Model):
    ss_id = models.AutoField(primary_key=True)
    system = models.ForeignKey(
        'inventory.Server',
        db_column='system_id',
        null=True,
        blank=True)
    interface_name = models.CharField(max_length=128, null=True, blank=True)
    switch = models.ForeignKey(
        'inventory.Switch',
        db_column='switch_id',
        null=True,
        blank=True)
    switch_port_number = models.IntegerField(null=True, blank=True)

    def __unicode__(self):
        return u'%s' % self.ss_id

    def __repr__(self):
        return u'%s' % self.ss_id

    @property
    def organization_id(self):
        return self.system.customer.id

    class Meta:
        db_table = 'systemswitchmap'


class SystemPDUMap(models.Model):
    spdu_id = models.AutoField(primary_key=True)
    system = models.ForeignKey(
        'inventory.Server',
        db_column='system_id',
        null=True,
        blank=True)
    system_port = models.ForeignKey(
        'inventory.SystemPowerSupplyPort',
        db_column='system_port_id',
        null=True,
        blank=True)
    pdu = models.ForeignKey(
        'inventory.PDU',
        db_column='pdu_id',
        null=True,
        blank=True)
    pdu_port_number = models.IntegerField(null=True, blank=True)

    def __unicode__(self):
        return u'%s' % self.spdu_id

    def __repr__(self):
        return u'%s' % self.spdu_id

    @property
    def organization_id(self):
        return self.system.customer.id

    class Meta:
        db_table = 'systempdumap'


class CabinetItemMap(models.Model):
    cimap_id = models.AutoField(primary_key=True)
    item_id = models.IntegerField(null=True, blank=True)
    item_type = models.CharField(max_length=128, blank=True, null=True)
    cabinet = models.ForeignKey(
        'datacenter.Cabinet',
        db_column='cabinet_id',
        null=True,
        blank=True)

    #    cabinet_id = models.IntegerField()

    def __unicode__(self):
        return unicode(self.cimap_id)

    def __repr__(self):
        return u'%s' % self.cimap_id

    @property
    def organization_id(self):
        return self.cabinet.customer.id

    class Meta:
        db_table = 'cabinetitemmap'


class CustomerInstanceMap(models.Model):
    cust_ins_map_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(
        Organization,
        db_column='customer_id',
        blank=True,
        null=True)
    instance = models.ForeignKey(
        Instance,
        db_column='instance_id',
        blank=True,
        null=True)

    def __unicode__(self):
        return u'%s' % self.cust_ins_map_id

    def __repr__(self):
        return u'%s' % self.cust_ins_map_id

    @property
    def organization_id(self):
        return self.customer.id

    class Meta:
        verbose_name = 'Instance'
        db_table = 'customerinstancemap'


class CabinetCustomerMapping(models.Model):
    cab_cust_map_id = models.AutoField(primary_key=True)
    cabinet = models.ForeignKey(
        'datacenter.Cabinet',
        db_column='cabinet_id',
        blank=True,
        null=True)
    customer = models.ForeignKey(
        Organization,
        db_column='customer_id',
        blank=True,
        null=True)
    cabinet_option = models.ForeignKey(
        'CabinetOption',
        db_column='cabinet_option_id',
        blank=True,
        null=True)

    def __unicode__(self):
        return u'%s' % self.cab_cust_map_id

    def __repr__(self):
        return u'%s' % self.cab_cust_map_id

    @property
    def organization_id(self):
        return self.customer.id

    class Meta:
        verbose_name = 'Cabinet'
        db_table = 'cabinetcustomermapping'


class MotherboardPeripheralMap(models.Model):
    mb_map_id = models.AutoField(primary_key=True)
    motherboard = models.ForeignKey(
        'inventory.Motherboard',
        db_column='motherboard_id',
        null=False)
    peripheral_id = models.IntegerField(blank=True)
    onboard_peripheral = models.BooleanField(default=False)
    peripheral_type = models.ForeignKey(
        'inventory.PeripheralTypes',
        db_column='peripheral_type_id',
        null=True,
        blank=True)

    def __unicode__(self):
        return u'%s' % self.mb_map_id

    def __repr__(self):
        return u'%s' % self.mb_map_id

    @property
    def organization_id(self):
        return self.motherboard.server.customer.id

    class Meta:
        verbose_name = 'Motherboard'
        db_table = 'motherboardperipheralmap'
        ordering = ['mb_map_id']


class ProductTypes(models.Model):
    product_type = models.CharField(max_length=256, unique=True)

    def __unicode__(self):
        return u'%s' % self.product_type

    def __repr__(self):
        return u'%s' % self.product_type

    class Meta:
        db_table = 'producttypes'
        ordering = ['id']
        permissions = (('view', 'Can view producttypes'),)

    @staticmethod
    def get_product_type_id(producttype):
        prtype = ProductTypes.objects.filter(product_type=producttype)
        if prtype:
            return prtype[0].id
        else:
            # Add item into producttype table
            prd = ProductTypes(product_type=producttype)
            prd.save()
            return prd.id

    def clean(self):
        if self.product_type and not self.id:
            if ProductTypes.objects.filter(
                    product_type__iexact=self.product_type):
                raise ValidationError(
                    {'product_type': 'Product type must be in unique'})
        if self.product_type and self.id:
            if ProductTypes.objects.filter(
                    product_type=self.product_type, id=self.id):
                pass
            else:
                if ProductTypes.objects.filter(
                        product_type__iexact=self.product_type):
                    raise ValidationError(
                        {'product_type': 'Product type must be in unique'})
        return


class ProductAdminMapping(models.Model):
    product_id = models.IntegerField()
    product_type = models.ForeignKey(
        ProductTypes,
        db_column='product_type_id',
        null=True,
        blank=True)
    admin = models.ForeignKey(
        User,
        db_column='admin_id',
        null=True,
        blank=True)

    def __unicode__(self):
        return u'%s' % self.product_id

    def __repr__(self):
        return u'%s' % self.product_id

    @property
    def organization_id(self):
        return self.admin.org.id

    class Meta:
        db_table = 'productadminmapping'
        ordering = ['product_id']

    @staticmethod
    def get_admin_id(productid):
        obj = ProductAdminMapping.objects.get(produc_id=productid)
        if len(obj) > 0:
            return obj.admin_id
        else:
            return None


class InstanceDatacenterMview(models.Model):
    objects = MaterializedViewManager()
    instance = models.ForeignKey(Instance, db_column='instance_id', on_delete=models.DO_NOTHING)
    server = models.ForeignKey('inventory.Server', db_column='server_id', on_delete=models.DO_NOTHING)
    cabinet = models.ForeignKey('datacenter.Cabinet', db_column='cabinet_id', on_delete=models.DO_NOTHING)
    datacenter = models.ForeignKey('datacenter.Datacenter', db_column='datacenter_id', on_delete=models.DO_NOTHING)

    class Meta:
        db_table = 'instance_datacenter_mview'
        managed = False

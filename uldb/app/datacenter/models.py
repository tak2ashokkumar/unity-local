# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#
# All Rights Reserved.

"""models.py
"""

from __future__ import absolute_import
from __future__ import unicode_literals

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify

from app.common.models import *

from app.common.func import _fix_salesforce, generate_uuid
from app.inventory.mixins import TagMixin, CabinetDetailMixin
from integ.salesforce.models import SalesforceMixin
from django.conf import settings


class Location(InventoryModel):
    name = models.CharField(max_length=128, unique=True)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name='Latitude',
        blank=True,
        null=True
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name='Longitude',
        blank=True,
        null=True
    )

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    def get_location(self):
        """
        First vertical coordinate (y), such as latitude (negative
        number south of equator and positive north of equator)

        Second horizontal coordinate (x), such as longitude
        (negative values west of Prime Meridian and positive values
        east or Prime Meridian)

        https://en.wikipedia.org/wiki/ISO_6709
        """
        return (self.latitude, self.longitude)

    class Meta:
        permissions = (('view', 'Can view location'),)
        verbose_name = 'Datacenter Location'


class Datacenter(InventoryModel):
    name = models.CharField(max_length=128, default='SF9')
    location = models.CharField(max_length=128, null=True, blank=True)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        permissions = (('view', 'Can view datacenter'),)
        verbose_name = 'DataCenter'


class OutletTypes(models.Model):
    outlet_type = models.CharField(
        max_length=64,
        unique=True,
        # default='NEMA-L5-20P',
        verbose_name='Outlet Type')

    def __unicode__(self):
        return u'%s' % self.outlet_type

    def __repr__(self):
        return u'%s' % self.outlet_type

    class Meta:
        verbose_name = 'Power Outlet Types'
        db_table = 'outlettypes'
        ordering = ['id']
        permissions = (('view', 'Can view power outlet types'),)


class AmpsTypes(models.Model):
    AMPS_TYPE = (
        (u'10A', u'10A'),
        (u'15A', u'15A'),
        (u'20A', u'20A'),
        (u'30A', u'30A'),
        (u'40A', u'40A'),
        (u'50A', u'50A'),
    )
    amps_type = models.CharField(
        max_length=10,
        unique=True,
        choices=AMPS_TYPE,
        default=AMPS_TYPE[0][0],
        verbose_name='Amps Type')

    def __unicode__(self):
        return u'%s' % self.amps_type

    def __repr__(self):
        return u'%s' % self.amps_type

    class Meta:
        verbose_name = 'Power Amps Types'
        db_table = 'ampstypes'
        permissions = (('view', 'Can view power amps types'),)


class VoltageTypes(models.Model):
    VOLTAGE_TYPE = (
        (u'50V', u'50V'),
        (u'110V', u'110V'),
        (u'160V', u'160V'),
        (u'180V', u'180V'),
        (u'220V', u'220V'),
        (u'240V', u'240V'),
    )
    voltage_type = models.CharField(max_length=10, unique=True, choices=VOLTAGE_TYPE, default=VOLTAGE_TYPE[0][0],
                                    verbose_name='Voltage Type')

    def __unicode__(self):
        return u'%s' % self.voltage_type

    def __repr__(self):
        return u'%s' % self.voltage_type

    class Meta:
        verbose_name = 'Power Voltage Types'
        db_table = 'voltagetypes'
        permissions = (('view', 'Can view power voltate types'),)

    def save(self, *args, **kwargs):
        if self.voltage_type:
            self.voltage_type = self.voltage_type.upper()
        super(VoltageTypes, self).save(*args, **kwargs)


class ElectricalPanel(models.Model):
    name = models.CharField(max_length=128, null=False, unique=True)
    max_num_breakers = models.IntegerField(null=False, blank=False, default=42)

    def __unicode__(self):
        return u'%s-%s' % (self.name, self.max_num_breakers)

    def __repr__(self):
        return u'%s-%s' % (self.name, self.max_num_breakers)

    class Meta:
        verbose_name = 'Electrical Panel'
        db_table = 'electricalpanel'
        ordering = ['name']
        permissions = (('view', 'Can view electrical panel'),)


class ElectricalCircuit(models.Model):
    name = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        unique=True,
        verbose_name='Circuit Name')
    panel = models.ForeignKey(
        'ElectricalPanel',
        blank=False,
        null=True,
        db_column='panel_id')

    def __unicode__(self):
        return u'%s-%s' % (self.name, self.panel)

    def __repr__(self):
        return u'%s-%s' % (self.name, self.panel)

    class Meta:
        verbose_name = 'Electrical Circuit'
        db_table = 'electricalcircuit'
        ordering = ['name']
        permissions = (('view', 'Can view electrical circuit'),)


class PowerCircuit(TimestampedModel, SalesforceMixin):
    id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=128,
        null=True,
        unique=True,
        verbose_name='Name',
    )
    assettag = models.SlugField(
        max_length=128,
        blank=True,
        null=True,
        verbose_name='AssetTag')
    datacenter = models.ForeignKey(
        Datacenter,
        blank=False,
        null=True,
        db_column='datacenter_id')
    customer = models.ForeignKey(
        'organization.Organization',
        null=True,
        blank=False,
        db_column='customer_id')
    panel = models.ForeignKey(
        'ElectricalPanel',
        blank=False,
        null=True,
        db_column='panel_id')
    #    circuit = models.CharField(max_length=128, verbose_name = 'Circuit ID')
    circuit = models.ForeignKey(
        'ElectricalCircuit',
        blank=True,
        null=True,
        db_column='circuit_id',
        verbose_name='Breaker')
    voltagetype = models.ForeignKey(
        'VoltageTypes',
        blank=False,
        null=True,
        db_column='voltage_type_id')
    ampstype = models.ForeignKey(
        'AmpsTypes',
        blank=False,
        null=True,
        db_column='amps_type_id')
    outlettype = models.ForeignKey(
        'OutletTypes',
        blank=False,
        null=True,
        db_column='outlet_type_id')
    is_allocated = models.BooleanField(default=False)
    salesforce_id = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        unique=True,
        verbose_name='Salesforce ID')

    def __unicode__(self):
        return u'%s-%s' % (self.panel, self.circuit)

    def __repr__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = 'Power Circuit'
        db_table = 'powercircuit'
        ordering = ['name']
        permissions = (('view', 'Can view power circuit'),)

    def save(self, *args, **kwargs):
        self.assettag = slugify('%s-%s-%s-%s' % (self.circuit,
                                                 self.voltagetype,
                                                 self.ampstype,
                                                 self.outlettype))
        if not self.salesforce_id:
            self.salesforce_id = None
        _fix_salesforce(self)
        # if self.customers.all():
        #     self.is_allocated = True
        # else:
        #     self.is_allocated = False
        super(PowerCircuit, self).save(*args, **kwargs)

    @property
    def organization_id(self):
        return self.customer.id


class ElectricalPanelBreaker(models.Model):
    panel = models.ForeignKey('ElectricalPanel')
    circuit = models.ForeignKey('ElectricalCircuit')
    number = models.IntegerField(blank=False, null=False)

    def __unicode__(self):
        return u'%s-%s' % (self.panel, self.circuit)

    def __repr__(self):
        return u'%s-%s' % (self.panel, self.circuit)

    class Meta:
        verbose_name = 'Electrical Panel'
        db_table = 'electricalpanelbreaker'
        ordering = ['id']
        permissions = (('view', 'Can view electrical panel breaker'),)


class Cage(TimestampedModel, SalesforceMixin):
    """This is the Cage Object Class. The "cage_id" string
       which points to the cabinet."""
    id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=128,
        verbose_name='Name',
        unique=True,
        null=True,
    )
    datacenter = models.ForeignKey(
        Datacenter,
        null=True,
        blank=False,
        db_column='datacenter_id')
    is_allocated = models.BooleanField(default=False, verbose_name='State')
    customer = models.ForeignKey(
        'organization.Organization',
        null=True,
        blank=False,
        db_column='customer_id')
    salesforce_id = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        unique=True,
        verbose_name='Salesforce ID')
    uuid = models.UUIDField(null=True, blank=True, verbose_name='UUID', default=generate_uuid)

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    @property
    def organization_id(self):
        return self.customer.id

    def save(self, *args, **kwargs):
        if not self.salesforce_id:
            self.salesforce_id = None
        _fix_salesforce(self)
        if self.customer:
            self.is_allocated = True
        else:
            self.is_allocated = False
        super(Cage, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'Cage'
        db_table = 'cage'
        ordering = ['name']
        permissions = (('view', 'Can view cage'),)


class CabinetModels(models.Model):
    model = models.CharField(
        max_length=128,
        unique=True,
        verbose_name='Cabinet Model')
    size = models.CharField(
        max_length=128,
        default='42U',
        verbose_name='Cabinet Size')
    manufacturer = models.ForeignKey(
        'inventory.Manufacturer',
        null=True,
        blank=True,
        verbose_name='Manufacturer')

    def __unicode__(self):
        return u'%s' % self.model

    def __repr__(self):
        return u'%s' % self.model

    class Meta:
        verbose_name = 'Cabinets'
        db_table = 'cabinet_model'
        ordering = ['model']
        permissions = (('view', 'Can view cabinet models'),)


class CabinetTypes(models.Model):
    cabinet_type = models.CharField(
        max_length=64,
        unique=True,
        default='SHARED',
        verbose_name='Cabinet Type')

    def __unicode__(self):
        return u'%s' % self.cabinet_type

    def __repr__(self):
        return u'%s' % self.cabinet_type

    class Meta:
        verbose_name = 'Cabinet Types'
        db_table = 'cabinettypes'
        ordering = ['cabinet_type']
        permissions = (('view', 'Can view cabinet types'),)


class CabinetManager(models.Manager):
    def visible(self):
        return self.filter(
            cabinet_type__cabinet_type__in=settings.CABINET_VISIBLE_TO_CUSTOMER
        )


class Cabinet(TimestampedModel, SalesforceMixin, TagMixin, CabinetDetailMixin):
    id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=128,
        verbose_name='Name',
        null=True)

    cage = models.ForeignKey(
        'Cage',
        blank=True,
        null=True,
        db_column='cage_id')
    model = models.CharField(
        max_length=128,
        null=True,
        verbose_name='Cabinet Model')
    size = models.IntegerField(
        verbose_name='Cabinet Size',
        default=42,
    )
    cabinet_type = models.ForeignKey(
        CabinetTypes,
        null=True,
        blank=False,
        db_column='cabinet_type_id')
    is_allocated = models.BooleanField(default=False, verbose_name='State')

    customers = models.ManyToManyField(
        'organization.Organization',
        related_name="%(class)s_customers"
    )
    salesforce_id = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        unique=True,
        verbose_name='Salesforce ID')
    available_size = models.CharField(
        max_length=128, default='42U', null=True, blank=True)
    uuid = models.UUIDField(null=True, blank=True, verbose_name='UUID',
                            default=generate_uuid)
    annual_escalation = models.FloatField(null=True, blank=True)
    cost = models.FloatField(null=True, blank=True)
    contract_start_date = models.DateTimeField(null=True, blank=True)
    contract_end_date = models.DateTimeField(null=True, blank=True)
    renewal = models.CharField(max_length=64, null=True, blank=True)

    objects = CabinetManager()

    def __unicode__(self):
        return u'%s' % self.name

    def __repr__(self):
        return u'%s' % self.name

    @property
    def organization_id(self):
        return self.customers.all()

    class Meta:
        verbose_name = 'Cabinet'
        db_table = 'cabinet'
        ordering = ['name']
        permissions = (('view', 'Can view cabinet'),)

    def save(self, *args, **kwargs):
        if not self.salesforce_id:
            self.salesforce_id = None
        _fix_salesforce(self)
        # if self.customers.all():
        #     self.is_allocated = True
        # else:
        #     self.is_allocated = False
        super(Cabinet, self).save(*args, **kwargs)

    def clean(self):
        if self.name and not self.cabinet_id:
            if Cabinet.objects.filter(name__iexact=self.name):
                raise ValidationError({'name': 'Name must be in unique'})
        if self.name and self.cabinet_id:
            if Cabinet.objects.filter(
                    name=self.name, cabinet_id=self.cabinet_id):
                pass
            else:
                if Cabinet.objects.filter(name__iexact=self.name):
                    raise ValidationError({'name': 'Name must be in unique'})

        if self.salesforce_id and not self.cabinet_id:
            if Cabinet.objects.filter(
                    salesforce_id__iexact=self.salesforce_id):
                raise ValidationError(
                    {'salesforce_id': 'Salesforce ID must be in unique'})
        if self.salesforce_id and self.cabinet_id:
            if Cabinet.objects.filter(
                    salesforce_id=self.salesforce_id, cabinet_id=self.cabinet_id):
                pass
            else:
                if Cabinet.objects.filter(
                        salesforce_id__iexact=self.salesforce_id):
                    raise ValidationError(
                        {'salesforce_id': 'Salesforce ID must be in unique'})
        return

    @property
    def co2_emission_value(self):
        co2_emission_value = 0.0
        for pdu in self.pdu_set.all():
            co2_emission_value += pdu.co2_emission_value
        return co2_emission_value

    def get_co2_emission_value(self):
        co2_emission_value = 0.0
        for pdu in self.pdu_set.all():
            co2_emission_value += pdu.get_co2_emission_value()
        return co2_emission_value

# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.


"""
    app.ip.models

    :copyright: (C) 2016 UnitedLayer, LLC. All Rights Reserved.
    :author: rtapia@unitedlayer.com
    :version: 1.0

"""
from __future__ import absolute_import
from __future__ import unicode_literals

import logging

import ipaddr
from app.common.models import AddressableModel
from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.db import transaction

from app.inventory.models import Switch, PDU, TerminalServer, VirtualMachine
from app.server.models import Instance
from app.organization.models import Organization
from app.common.fields import NullableCharField
from .exceptions import AllocationError, IPSpecialUseError
from .utils import cidr_to_bitmask

logger = logging.getLogger(__name__)

REGION_PREFIX_LEN = 32
MAX_PREFIX_LEN = 30
MIN_PREFIX_LEN_FOR_CHILD_IPS = 24


class IPv6ModelMixin(models.Model):
    """
    Abstract base class/mixin for IPv6 Models
    """
    prefix = models.GenericIPAddressField()
    prefixlen = models.IntegerField()
    description = NullableCharField(max_length=256)

    @property
    def addr(self):
        return ipaddr.IPNetwork(self.cidr_form)

    @property
    def cidr_form(self):
        return "%s/%s" % (self.prefix, self.prefixlen)

    @property
    def prefix_int(self):
        return ipaddr.IPNetwork(self.cidr_form)._ip

    def save(self, *args, **kwargs):
        return super(IPv6ModelMixin, self).save(*args, **kwargs)

    def __unicode__(self):
        return u"%s/%s" % (self.prefix, self.prefixlen)

    def __repr__(self):
        return u"%s/%s" % (self.prefix, self.prefixlen)

    def generate_linked_subnet(self,
                               prefixlen,  # must be smaller
                               subnet_model_class,
                               related_field_name,
                               save=True,
                               **kwargs):
        """
        Returns an object of class :subnet_model_class:
        :return:
        """
        if not prefixlen > self.prefixlen:
            raise AllocationError("Attempted to allocate subnet not "
                                  "strictly smaller than self.")
        if not isinstance(subnet_model_class, (type,)):
            raise AllocationError(
                "Expected a class for 'subnet_model_class', "
                "not an instantiation")
        if IPv6ModelMixin not in subnet_model_class.__bases__:
            raise AllocationError("Can only link IPv6ModelMixin-* objects")
        ip_gen = self.addr.iter_subnets(prefixlen - self.prefixlen)
        filter_kwargs = {related_field_name: self}
        # @formatter:off
        current_assignments = set([
            ipaddr.IPNetwork("%s/%s" % (prefix, prefixlen))
            for prefix, prefixlen
            in subnet_model_class.objects.filter(**filter_kwargs).values_list(
                'prefix',
                'prefixlen'
            )
        ])
        # @formatter:off
        for ip in ip_gen:
            if ip not in current_assignments:
                # At this point, we know this is the IP to use.
                prefix = ip.network.compressed
                prefixlen = ip.prefixlen
                filter_kwargs.update(**kwargs)
                assignment = subnet_model_class(
                    prefix=prefix,
                    prefixlen=prefixlen,
                    **filter_kwargs
                )
                if save:
                    assignment.save()
                return assignment
        raise AllocationError("Could not allocate a /48 within %s" % self.cidr_form)

    class Meta:
        abstract = True
        unique_together = ('prefix', 'prefixlen',)


class IPv6Allocation(IPv6ModelMixin):
    """
    Represents an allocation to the Organization (UnitedLayer)

    e.g.
        prefix = 2607:f3a0::0        # get all possible subnets

        prefixlen = 32

    """
    name = NullableCharField(max_length=128, verbose_name='Allocation Name')

    def create_region(self,
                      region_name,
                      prefixlen=35,
                      create_tiers=True):
        """
        This model method creates a valid /35 under the Allocation.

             /32
              |
             /35 (next available, there should be 8 total,
                  throws exception if none left)

        :param create_tiers: Creates internal and customer /36s along with this /35
        :raises AllocationError: if cannot create region
        """
        logger.info('IPv6Allocation- create_region API - start')
        net = ipaddr.IPNetwork(self.cidr_form)
        subnets = net.subnet(prefixlen - self.prefixlen)
        # @formatter:off
        existing_subnets = set([
            str(prefix)
            for prefix
            in IPv6Region.objects.filter(allocation=self).values_list('prefix', flat=True)
        ])
        available_subnets = [
            subnet for subnet in subnets
            if subnet.network.compressed not in existing_subnets
        ]
        # @formatter:on
        if not available_subnets:
            raise AllocationError(
                "Cannot create region, %s is full." % self.name)
        subnet = available_subnets[0]
        region = IPv6Region(
            prefix=subnet.network.compressed,
            prefixlen=subnet.prefixlen,
            name=region_name,
            allocation=self
        )
        region.save()
        if create_tiers:
            for tier in region.generate_tiers():
                tier.save()
        logger.info('IPv6Allocation- create_region API - end')
        return region

    class Meta:
        db_table = 'ipv6_allocation'
        ordering = ['id']
        verbose_name = 'ipv6 allocation'
        permissions = (('view', 'Can view ipv6 allocation'),)


class IPv6Region(IPv6ModelMixin):
    """
    Regions are large population centers containing datacenters,
    such as San Francisco, LA, or Ashburn.

    Represented by a /35 by default.
    """
    name = models.CharField(max_length=128, verbose_name='Region Name')

    # the parent /32
    allocation = models.ForeignKey(
        IPv6Allocation,
        verbose_name='Parent Allocation',
        on_delete=models.CASCADE
    )

    def generate_tiers(self, prefixlen=36):
        """
        Returns a pair of subregions, each a /36 by default.
        """
        logger.info('IPv6Region generate_tiers API - start')
        subnets = ipaddr.IPNetwork(self.cidr_form).subnet()
        internal = IPv6Tier(
            prefix=subnets[0].network.compressed,
            prefixlen=prefixlen,
            region=self,
            purpose=IPv6Tier.INTERNAL,
        )
        customer = IPv6Tier(
            prefix=subnets[1].network.compressed,
            prefixlen=prefixlen,
            region=self,
            purpose=IPv6Tier.CUSTOMER,
        )
        return internal, customer

    def save(self, *args, **kwargs):
        return super(IPv6Region, self).save(*args, **kwargs)

    def __unicode__(self):
        return u'%s - %s' % (self.name, self.cidr_form)

    def __repr__(self):
        return u'%s - %s' % (self.name, self.cidr_form)

    class Meta:
        db_table = 'ipv6_region'
        ordering = ['id']
        verbose_name = 'ipv6 region'
        permissions = (('view', 'Can view ipv6 region'),)


class IPv6Tier(IPv6ModelMixin):
    """
    internal or customer /36.

    has /48s below
    """
    INTERNAL = 1
    CUSTOMER = 2
    CHOICES = (
        (INTERNAL, 'Internal'),
        (CUSTOMER, 'Customer'),
    )
    purpose = models.IntegerField(choices=CHOICES)
    region = models.ForeignKey(IPv6Region)  # parent /35

    def generate_linked_subnet(self,
                               prefixlen=48,
                               # subnet_model_class,
                               # related_field_name,
                               customer=None,
                               save=True,
                               **kwargs):
        return super(IPv6Tier, self).generate_linked_subnet(
            prefixlen=prefixlen,
            subnet_model_class=IPv6Assignment,
            related_field_name='tier',
            save=True,
            customer=customer,
        )

    class Meta:
        db_table = 'ipv6_tier'
        ordering = ['id']
        verbose_name = 'ipv6 tier'
        permissions = (('view', 'Can view ipv6 tier'),)


class IPv6Assignment(IPv6ModelMixin):
    """
    The IPv6 block given to a customer. (/48)
    """
    tier = models.ForeignKey('IPv6Tier', related_name='assignments')
    customer = models.ForeignKey('organization.Organization',
                                 blank=True,
                                 null=True,
                                 on_delete=models.SET_NULL)
    allocation = models.ForeignKey('IPv6Allocation',
                                   null=True,
                                   blank=True,
                                   verbose_name='Parent Allocation',
                                   on_delete=models.CASCADE)
    is_allow_64 = models.BooleanField(default=False)

    def generate_linked_subnet(self,
                               prefixlen=64,  # must be smaller
                               customer=None,
                               save=True,
                               **kwargs):
        """
        Generates /64 for a single colo customer or a single interface
        """
        return super(IPv6Assignment, self).generate_linked_subnet(
            prefixlen=prefixlen,
            subnet_model_class=IPv6Interface,
            related_field_name='assignment',
            save=True,
            customer=customer,
        )

    @property
    def organization_id(self):
        return self.customer.id

    class Meta:
        db_table = 'ipv6_assignment'
        ordering = ['id']
        verbose_name = 'ipv6 assignment'
        permissions = (('view', 'Can view ipv6 assignment'),)


class IPv6Interface(IPv6ModelMixin):
    """
    /64, typically for a customer interface
    """
    customer = models.ForeignKey('organization.Organization', blank=True, null=True)
    assignment = models.ForeignKey('IPv6Assignment', related_name='interfaces', on_delete=models.CASCADE)

    @property
    def organization_id(self):
        return self.customer.id

    class Meta:
        db_table = 'ipv6_interface'
        ordering = ['id']
        verbose_name = 'ipv6 interface'
        permissions = (('view', 'Can view ipv6 interface'),)


class IPv4BlockModel(models.Model):
    name = models.CharField(max_length=64, blank=True, null=True)
    description = models.CharField(max_length=256, null=True, blank=True)
    prefix = models.GenericIPAddressField(protocol='IPv4')
    prefixlen = models.IntegerField(verbose_name="Prefix Length")
    version = models.IntegerField(default=4)

    # created upon saving
    network_int = models.BigIntegerField(blank=True, null=True)
    subnet_mask_int = models.BigIntegerField(blank=True, null=True)
    subnet_mask_str = models.CharField(max_length=32, blank=True, null=True)

    @property
    def subnet_binary_str(self):
        return bin(cidr_to_bitmask(self.prefixlen, self.version))

    @property
    def full_name(self):
        return "%s/%s" % (self.prefix, self.prefixlen)

    def generate_arithmetic_fields(self):
        self.network_int = int(ipaddr.IPv4Network(self.prefix).network._ip)
        self.subnet_mask_int = cidr_to_bitmask(self.prefixlen, version=4)
        self.subnet_mask_str = str(ipaddr.IPv4Address(self.subnet_mask_int).exploded)

    def save(self, *args, **kwargs):
        self.generate_arithmetic_fields()
        super(IPv4BlockModel, self).save(*args, **kwargs)

    @property
    def num_hosts(self):
        return 2 ** (32 - int(self.prefixlen))

    @classmethod
    def create_from_name(cls, full_name):
        prefix, prefixlen = full_name.split('/')
        b = cls(prefix=prefix, prefixlen=int(prefixlen))
        return b

    def __unicode__(self):
        return u'%s' % self.full_name

    def __repr__(self):
        return u'%s' % self.full_name

    class Meta:
        abstract = True


class PublicIPv4PrimaryBlock(IPv4BlockModel):
    """
    Has handle to interface with ARIN.
    """
    arin_handle = models.CharField(max_length=128, verbose_name="ARIN Handle")

    def get_collision(self):
        cidr = self.full_name
        net = ipaddr.IPv4Network(cidr)
        nets = [ipaddr.IPv4Network(n.full_name)
                for n in self.__class__.objects.all()]
        for existing_net in nets:
            if net in existing_net or existing_net in net:
                return existing_net
        return None

    def save(self, *args, **kwargs):
        cidr = self.full_name
        net = ipaddr.IPv4Network(cidr)
        if net.is_private:
            raise IPSpecialUseError("IP network %s is private" % cidr)
        if net.is_reserved:
            raise IPSpecialUseError("IP network %s is reserved" % cidr)
        if net.is_loopback:
            raise IPSpecialUseError("IP network is loopback")
        if net.is_unspecified:
            raise IPSpecialUseError("RFC5735 section (3) error")
        with transaction.atomic():
            collision = self.get_collision()
            if collision is not None:
                raise AllocationError("Could not allocate %s due to collision with %s"
                                      % (net, collision))
        super(PublicIPv4PrimaryBlock, self).save(*args, **kwargs)

    class Meta:
        db_table = 'ipv4_primaryblock'
        ordering = ('network_int',)
        verbose_name = 'ipv4 primary block'
        permissions = (('view', 'Can view ipv4 primaryblock'),)


class PrivateIPv4PrimaryBlock(IPv4BlockModel):
    def save(self, *args, **kwargs):
        cidr = self.full_name
        net = ipaddr.IPv4Network(cidr)
        if not net.is_private:
            raise IPSpecialUseError("IP network %s is not private." % cidr)
        super(PrivateIPv4PrimaryBlock, self).save(*args, **kwargs)

    class Meta:
        db_table = 'ipv4_primaryblock_private'
        ordering = ('network_int',)
        verbose_name = 'ipv4 primary block private'
        permissions = (('view', 'Can view private ipv4 primaryblock'),)


class IPv4AllocatedBlock(IPv4BlockModel):
    """
    Base class for most assignments.

    Needs "parent" replaced.
    """
    customer = models.ForeignKey(
        'organization.Organization',
        blank=True,
        null=True)
    splittable = models.BooleanField(default=True)
    aggregatable = models.BooleanField(default=False)
    num_hosts_int = models.IntegerField(blank=True, null=True)

    # keep expected sibling data
    sibling_network_int = models.BigIntegerField(null=True, blank=True)

    def is_splittable(self):
        """
        True if and only if the block can be split.  Generally, we don't want to
        split if the prefix length is 30 bits or longer.
        """
        if self.prefixlen >= MAX_PREFIX_LEN:
            return False
        return True

    @property
    def organization_id(self):
        return self.customer.id

    @transaction.atomic
    def split(self):
        """
        {original}/{mask}
            |
            |
        {original prefix, new object}/{mask + 1} + {generated sibling}/{mask + 1}
        """
        if self.is_splittable():
            # create new object with greater prefix length
            next_prefixlen = self.prefixlen + 1
            new_self = self.__class__(parent=self.parent,
                                      customer=self.customer,
                                      prefix=self.prefix,  # keep the prefix
                                      prefixlen=next_prefixlen,
                                      name=self.name)
            new_self.save()
            # create sibling
            sibling = self.__class__(parent=self.parent,
                                     customer=self.customer,
                                     prefixlen=next_prefixlen,
                                     name=self.name)
            sibling.prefix = new_self.get_sibling_network()  # needs to be the new sibling
            sibling.save()

            self.delete()
            return (new_self, sibling)
        return (self,)

    @property
    def direct_antecedent_full_name(self):
        """
        for ip address "ADDR/x", returns "PARENT_ADDR/(x-1)"

        useful if you need to compute a valid parent.

        network_int and prefixlen must be up to date
        """
        network_int = int(ipaddr.IPv4Network(self.prefix).network._ip)
        parent_net_int = network_int & cidr_to_bitmask(int(self.prefixlen) - 1, version=4)
        parent_net_addr = ipaddr.IPv4Address(parent_net_int).exploded
        full_name = "%s/%s" % (parent_net_addr, int(self.prefixlen) - 1)
        logger.debug("antecedent of %s -> %s" % (self, full_name))
        return full_name

    def get_sibling_network(self):
        # there can be only one
        sibs_networks = [v.network._ip
                         for v in ipaddr.IPv4Network(self.direct_antecedent_full_name).subnet(1)
                         if v.network._ip != self.network_int]
        if len(sibs_networks) < 1:
            raise RuntimeError(
                "Unexpected error finding siblings, got an empty list")
        return ipaddr.IPv4Address(sibs_networks[0]).exploded

    def get_sibling(self, same_customer_constraint=True):
        """
        :raises ObjectDoesNotExist:
        """
        kws = {
            'prefix': self.get_sibling_network(),
            'parent': self.parent,
            'prefixlen': self.prefixlen,
        }
        if same_customer_constraint:
            kws['customer'] = self.customer
        return self.__class__.objects.get(**kws)

    @property
    def is_leftmost(self):
        return self.direct_antecedent_full_name.split('/')[0] == self.prefix

    @property
    def can_be_aggregated(self):
        """
        A block can be aggregated if and only if it has a sibling owned by the same customer.
        """
        try:
            self.get_sibling(same_customer_constraint=True)
        except ObjectDoesNotExist:
            return False
        return True

    @transaction.atomic
    def aggregate(self):
        """
        :return: (created_block, [list of deleted blocks])
        """
        logger.debug('IPv4AllocatedBlock :: aggregate method called')
        if self.can_be_aggregated:
            antecedent = self.__class__.create_from_name(
                self.direct_antecedent_full_name)
            antecedent.parent = self.parent
            antecedent.customer = self.customer
            antecedent.name = self.name
            antecedent.generate_arithmetic_fields()
            antecedent.save()

            sib = self.get_sibling()
            deleted = [self.full_name, sib.full_name]
            sib.delete()
            self.delete()
            return (antecedent, deleted)

    def compute_sibling(self):
        """
        Updates sibling_network_int

        Does not depend on the existence of a sibling.
        """
        net = ipaddr.IPv4Network(self.full_name)
        self.sibling_network_int = (n for n in net.supernet().subnet(1) if n._ip != net._ip).next()._ip

    @transaction.atomic
    def generate_child_ips(self):
        """
        Creates an object for each non-boundary child IP, if one does not exist already.

        Does not generate child IPs if the prefix length is < 24 bits.
            - Prevents millions of child IPs from being generated for large blocks
            - Effectively orphans child IPs when two /24s get aggregated.
        """
        if self.prefixlen >= MIN_PREFIX_LEN_FOR_CHILD_IPS:
            logger.debug("Generating IPs for block: %s" % self.full_name)
            net = ipaddr.IPv4Network(self.full_name)
            logger.debug("Net is: %s" % str(net))
            for host in net.iterhosts():
                # get or create
                ip, created = self.CHILD_CLASS.objects.get_or_create(address=host.exploded, block=self)
                if not created:
                    # if we found a stranded ip object (for whatever reason), point it at this block
                    ip.block = self
                    ip.save(force_update=True)
                    logger.debug("Found and remapped: %s" % ip.address)
        else:
            logger.debug("not generating IPs for %s" % self.full_name)

    def save(self, *args, **kwargs):
        """
        States to handle:
            - assigned a sibling to a different customer
            - split a sibling
            - aggregated two siblings into a sibling of another
            - aggregated two siblings into a nonsibling
        """
        self.splittable = self.is_splittable()
        # if customer gets reassigned, we need to mark aggregatable
        self.aggregatable = self.can_be_aggregated
        self.num_hosts_int = 1 << (32 - self.prefixlen)
        self.compute_sibling()
        super(IPv4AllocatedBlock, self).save(*args, **kwargs)
        self.generate_child_ips()

    class Meta:
        abstract = True


class PublicIPv4Assignment(IPv4AllocatedBlock):
    parent = models.ForeignKey(PublicIPv4PrimaryBlock)

    @property
    def CHILD_CLASS(self):
        return globals()['PublicIPv4Address']

    class Meta:
        db_table = 'ipv4_allocatedblock'
        ordering = ('network_int',)
        verbose_name = 'Public IPv4 Assignment'
        permissions = (('view', 'Can view public IPv4 Assignments'),)


class PrivateIPv4Assignment(IPv4AllocatedBlock):
    parent = models.ForeignKey(PrivateIPv4PrimaryBlock)

    @property
    def CHILD_CLASS(self):
        return globals()['PrivateIPv4Address']

    class Meta:
        db_table = 'ipv4_allocatedblock_private'
        ordering = ('network_int',)
        verbose_name = 'Private IPv4 Assignment'
        permissions = (('view', 'Can view private IPv4 Assignments'),)


class AddressableObjectMetaclass(models.base.ModelBase):
    """
    Used as prototype for addressable device through a single foreign key.
    """

    def __call__(cls, *args, **kwargs):
        obj = super(AddressableObjectMetaclass, cls).__call__(*args, **kwargs)
        return obj.get_object()


class IPv4AddressableObject(models.Model):
    """
    Object to derive into specific adapters for switch, etc.
    """
    __metaclass__ = AddressableObjectMetaclass
    object_class = models.CharField(max_length=64)

    def save(self, *args, **kwargs):
        if not self.object_class:
            self.object_class = self._meta.model_name
        super(IPv4AddressableObject, self).save(*args, **kwargs)

    def get_object(self):
        """
        either returns this class, or returns an extended class that "proxies" this one
        :return:
        """
        if not self.object_class or self.object_class == self._meta.model_name:
            # return the base class (this one)
            return self
        else:
            # return IPv4Instance, etc...
            return getattr(self, self.object_class)


class IPv4VirtualMachine(IPv4AddressableObject):
    """
    Container model class.

    Derives IPv4AddressableObject and provides a foreign key to VirtualMachine
    """
    object = models.ForeignKey(VirtualMachine, related_name='vm_ipv4_addresses')

    @property
    def organization_id(self):
        return self.object.customer.id

    def __repr__(self):
        return u'%s' % self.object.name


class IPv4Instance(IPv4AddressableObject):
    """
    Container model class.
    """
    # 1:1
    object = models.ForeignKey(Instance, related_name='instance_ipv4_addresses')

    @property
    def organization_id(self):
        return self.object.customer.id

    def __repr__(self):
        return u'%s' % self.object.name


class IPv4Switch(IPv4AddressableObject):
    """
    Container model class.

    Derives IPv4AddressableObject and provides a foreign key to Switch
    """
    object = models.ForeignKey(Switch, related_name='switch_ipv4_addresses')

    @property
    def organization_id(self):
        return self.object.customer.id

    def __repr__(self):
        return u'%s' % self.object.name


class IPv4PDU(IPv4AddressableObject):
    """
    Container model class.

    Derives IPv4AddressableObject and provides a foreign key to PDU
    """
    object = models.ForeignKey(PDU, related_name='pdu_ipv4_addresses')

    @property
    def organization_id(self):
        return self.object.customer.id

    def __repr__(self):
        return u'%s' % self.object.assettag


class IPv4TerminalServer(IPv4AddressableObject):
    """
    Container model class.

    Derives IPv4AddressableObject and provides a foreign key to TerminalServer
    """
    object = models.ForeignKey(TerminalServer, related_name='terminal_server_ipv4_addresses')

    @property
    def organization_id(self):
        return self.object.customer.id

    def __repr__(self):
        return u'%s' % self.object.name


class IPv4Address(models.Model):
    """
    Field that represents an IPv4 Address and a related object.

    The addressable_object can be a Switch, TerminalServer, Instance, or PDU
    """
    address = models.GenericIPAddressField(protocol='IPv4')
    address_int = models.BigIntegerField()
    device = models.ForeignKey(
        AddressableModel,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    def save(self, *args, **kwargs):
        self.address_int = ipaddr.IPv4Address(self.address)._ip
        super(IPv4Address, self).save(*args, **kwargs)

    def __unicode__(self):
        return u'%s' % self.address

    def __repr__(self):
        return u'%s' % self.address

    class Meta:
        abstract = True


class PublicIPv4Address(IPv4Address):
    block = models.ForeignKey(
        PublicIPv4Assignment,
        null=True, blank=True,
        related_name='addresses',
        on_delete=models.SET_NULL
    )

    class Meta:
        db_table = 'ipv4_address_public'


class PrivateIPv4Address(IPv4Address):
    block = models.ForeignKey(
        PrivateIPv4Assignment,
        null=True, blank=True,
        related_name='addresses',
        on_delete=models.SET_NULL
    )

    class Meta:
        db_table = 'ipv4_address_private'

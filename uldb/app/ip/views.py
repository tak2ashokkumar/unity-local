# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.

from __future__ import absolute_import
from __future__ import unicode_literals

# import json

from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.views.decorators.http import require_POST
from django.views.generic import ListView, View
from django.views.generic.detail import SingleObjectMixin
from django.views.generic.edit import CreateView
from django.core.urlresolvers import reverse
from django.contrib import messages

from app.organization.models import *

from .models import (PublicIPv4PrimaryBlock, PublicIPv4Assignment,
                     IPv6Allocation, IPv6Region, IPv6Tier,
                     IPv6Assignment)
import logging

logger = logging.getLogger(__name__)  # logger from settings.py


def index(request, message=None):
    parent_blocks = PublicIPv4PrimaryBlock.objects.all()
    allocations = PublicIPv4Assignment.objects.all()
    ipv6allocations = IPv6Allocation.objects.all()
    ipv6regions = IPv6Region.objects.all()
    ipv6tiers = IPv6Tier.objects.all()
    ipv6assignments = IPv6Assignment.objects.all()
    customers = Organization.objects.all()
    context = {
        'parents': sorted(parent_blocks, key=lambda x: x.network_int),
        'allocations': sorted(allocations, key=lambda x: x.network_int),
        'message': message,
        'ipv6allocations': ipv6allocations,
        'ipv6regions': ipv6regions,
        'ipv6tiers': ipv6tiers,
        'ipv6assignments': ipv6assignments,
        'customers': customers,
    }
    return render(request, 'ipmanager/index.html', context)


@require_POST
def split(request):
    # check if POST is form data
    if request.POST:
        allocation = PublicIPv4Assignment.objects.get(id=request.POST['id'])
        # split the block, for now we'll have the model do the splitting
        messages.info(request, 'Block %s split' % allocation.full_name)
        allocation.split()
    else:
        messages.error(request, 'Invalid form data.')
    return HttpResponseRedirect(reverse('index'))


@require_POST
def aggregate(request):
    if request.POST:
        allocation = PublicIPv4Assignment.objects.get(id=request.POST['id'])
        if allocation.can_be_aggregated:
            new_block, deleted_blocks = allocation.aggregate()
            messages.info(request, 'Aggregated %s to %s' %
                          (deleted_blocks, new_block))
        else:
            messages.info(request, 'Allocation cannot be aggregated.')
    return HttpResponseRedirect(reverse('index'))


class IPv6AllocationListView(ListView):
    template_name = "ipmanager/ipv6allocation_list.html"
    model = IPv6Allocation
    context_object_name = 'ipv6allocations'


class CustomerListView(ListView):
    template_name = "ipmanager/customer_list.html"
    model = Organization
    context_object_name = 'customers'


class IPv6RegionListView(ListView):
    template_name = "ipmanager/ipv6region_list.html"
    model = IPv6Region
    context_object_name = 'ipv6regions'

    def get_context_data(self, **kwargs):
        context = super(IPv6RegionListView, self).get_context_data(**kwargs)
        context['ipv6allocations'] = IPv6Allocation.objects.all()
        return context


class IPv6AssignmentListView(ListView):
    template_name = "ipmanager/ipv6assignment_list.html"
    model = IPv6Assignment
    context_object_name = 'ipv6assignment'

    def get_context_data(self, **kwargs):
        context = super(
            IPv6AssignmentListView,
            self).get_context_data(
            **kwargs)
        context['ipv6tiers'] = IPv6Tier.objects.all()  # subregions
        context['customers'] = Organization.objects.all()
        return context


@require_POST
def add_ipv6_allocation(request):
    prefix = request.POST['prefix']
    prefixlen = request.POST['prefixlen']
    try:
        alloc = IPv6Allocation(prefix=prefix, prefixlen=prefixlen)
        alloc.save()
    except Exception as e:
        messages.error(request, "Could not create allocation: %s" % str(e))
    return HttpResponseRedirect(reverse('ipv6_allocations'))


@require_POST
def create_region(request):
    alloc = IPv6Allocation.objects.get(id=request.POST['allocation_id'])
    region_name = request.POST['region_name']
    try:
        alloc.create_region(region_name)
        messages.info(request, "Created Region.")
    except Exception as e:
        messages.error(request, "Could not create allocation: %s" % str(e))
    return HttpResponseRedirect(reverse('regionlist_view'))


@require_POST
def generate_assignment(request, pk):
    subregion = IPv6Tier.objects.get(id=pk)
    try:
        assignment = subregion.generate_linked_subnet(save=True)
        messages.info(request, "Created /48: %s" % assignment.cidr_form)
    except Exception as e:
        messages.error(request, "Could not generate assignment: %s" % str(e))
    return HttpResponseRedirect(reverse('assignmentlist_view'))


@require_POST
def create_customer(request):  # Add customer
    try:
        customer = Organization(
            name=request.POST['customer_name'],
            ulid=request.POST['customer_ulid'],
        )
        customer.save(force_insert=True)  # make sure to create new customer
    except Exception as e:
        messages.error(request, "Could not create customer. [%s]" % str(e))
    return HttpResponseRedirect(reverse('customerlist_view'))


@require_POST
def assignment_set_customer(request, pk):
    if request.POST['alloc_customer']:
        logger.info('Customer Id: %s' % str(request.POST['alloc_customer']))
        customer = Organization.objects.get(id=request.POST['alloc_customer'])
    else:
        customer = None
    assignment = IPv6Assignment.objects.get(id=pk)

    if 'update' in request.POST:
        _assignment_set_customer(request, pk, assignment, customer)
    if 'create' in request.POST:
        _assignment_create_interface(request, pk, assignment, customer)

    return HttpResponseRedirect(reverse('assignmentlist_view'))


def _assignment_set_customer(request, pk, assignment, customer):
    try:
        logger.info('Customer: %s' % customer)
        assignment.customer = customer
        assignment.save()
    except Exception as e:
        messages.error(
            request,
            "Could not assign customer %s to %s. Error: %s " %
            (customer, assignment, e)
        )


def _assignment_create_interface(request, pk, assignment, customer):
    try:
        assignment.generate_linked_subnet(customer=customer)
        messages.info(request, "Created /64 on %s" % assignment.cidr_form)
    except Exception as e:
        messages.error(
            request,
            "Could not create /64 on %s. Error: %s " %
            (assignment, e)
        )

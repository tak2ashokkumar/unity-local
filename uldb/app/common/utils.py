# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2018 UnitedLayer, LLC.
#   All Rights Reserved.

"""
utils.py
"""
from __future__ import absolute_import

import sys
import uuid
import json
import time
import socket
import logging
import paramiko
from io import StringIO
from django.apps import apps
from django.conf import settings
from rest_framework import status
from paramiko.transport import Transport
from rest_framework.response import Response

from libraries.auditlog.models import LogEntry
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F, IntegerField
from django.db.models.functions import Cast
from rest_framework.decorators import detail_route, list_route
from paramiko.ssh_exception import AuthenticationException, SSHException
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from rest.core.exceptions import SSHServiceError
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import get_template

# Import for PlainTextParser
import codecs

from django.conf import settings

from paramiko.transport import Transport
Transport._preferred_kex = settings.SSH_KEX_ALGORITHMS + Transport._preferred_kex  # Updating KEX Algo

from rest_framework.exceptions import ParseError
from rest_framework.parsers import BaseParser

logger = logging.getLogger(__name__)

Transport._preferred_kex = settings.SSH_KEX_ALGORITHMS + Transport._preferred_kex  # Updating KEX Algo


VM_OS_DICT = {
    "windowsGuest": "Windows",
    "linuxGuest": "Linux",
    "otherGuest": "Other"
}


class SSHManager(object):
    def __init__(self, ip_address, username, password=None, key_path=None, port=22):
        self.ip_address = ip_address
        self.username = username
        self.password = password
        self.port = port

        self.ssh = paramiko.SSHClient()
        self.ssh.load_system_host_keys()
        self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        if key_path:
            key = paramiko.RSAKey.from_private_key_file(key_path)
            self.ssh.connect(hostname, port=port, username=username, pkey=key)
        elif password:
            self.ssh.connect(
                self.ip_address,
                username=self.username,
                password=self.password,
                port=self.port,
                look_for_keys=False,
                timeout=15
            )

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception_value, traceback):
        self.close()

    def close(self):
        if self.ssh:
            self.ssh.close()

    def read_docker_file(self, container_name, file_path):
        command = "docker exec %s cat %s 2>/dev/null || echo ''" % (container_name, file_path)

        stdout, stderr, exit_code = self.execute_command(command, use_sudo=True)
        if exit_code == 0:
            print "Successfully read {} in container {}".format(file_path, container_name)
            return True, stdout
        else:
            print " Failed to read file: {}".format(stderr)
            return False, stderr

    def update_docker_file(self, container_name, file_path, content):
        content = content.strip()
        command = '''docker exec -u 0 %s bash -c "cat > %s << 'END_ODBC'
%s
END_ODBC"''' % (container_name, file_path, content)

        print "Executing command: %s" % command

        stdout, stderr, code = self.execute_command(command, use_sudo=True)

        if code == 0:
            print "File updated successfully"
            return True, "File updated"
        else:
            print "Direct method failed: %s" % stderr
            return False, stderr

    def execute_command(self, command, get_output=True, use_sudo=False):

        if use_sudo:
            command = 'bash -c \'echo "%s" | sudo -S %s\'' % (self.password.replace('"', '\\"'), command)

        stdin, stdout, stderr = self.ssh.exec_command(command)

        if get_output:
            stdout_str = stdout.read().decode().strip()
            stderr_str = stderr.read().decode().strip()
            exit_code = stdout.channel.recv_exit_status()

            return stdout_str, stderr_str, exit_code
        else:
            # Just execute, don't wait for output (for long-running commands)
            return None, None, None
        

class CommonSShAuthCheck:

    @detail_route(methods=['POST'])
    def check_auth(self, request, *args, **kwargs):
        try:
            hostname = request.data.get("host")
            port = request.data.get("port", 22)
            username = request.data.get("username")
            password = request.data.get("password")
            azure = request.GET.get('azure', False)
            if azure:
                instance = self.get_object()
                os_type = instance.os_type
                ip_type = instance.ip_type
            else:
                instance = self.get_object()
            azure_ssh_public = False
            azure_ssh_private = False

            if azure:
                if os_type:
                    if 'Windows' in os_type:
                        azure_rdp = True
                    else:
                        if ip_type and ip_type == 'public':
                            azure_ssh_public = True
                        elif ip_type and ip_type == 'private':
                            azure_ssh_private = True
            # For Private key authentication
            pkey_file = request.FILES.get('pkey')
            pkey_content = None

            if pkey_file:
                pkey_content = pkey_file.read()
                try:
                    private_key = StringIO(unicode(pkey_content))
                    paramiko.RSAKey.from_private_key(private_key)
                except paramiko.ssh_exception.SSHException:
                    return Response("Not a valid RSA private key file for host: %s:%s" % (hostname, port),
                                    status=status.HTTP_400_BAD_REQUEST)

            logger.debug(hostname)
            agent = self.get_object().collector
            logger.debug(agent)
            agent_conn_exists = False
            if (agent and not azure) or azure_ssh_private:
                agent_username = agent.ssh_username
                agent_password = agent.ssh_password
                agent_port = agent.ssh_port
                agent_server = agent.ip_address
                destination_server = hostname
                destination_port = port
                sock = paramiko.ProxyCommand("sshpass -p {} ssh -o StrictHostKeyChecking=no -p {} {}@{} nc {} {}".format(
                    agent_password, agent_port, agent_username, agent_server, destination_server, destination_port))
                sock.settimeout(20)

                try:
                    client = paramiko.SSHClient()
                    client.load_system_host_keys()
                    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                    logger.debug("Trying connection...............")

                    if pkey_file:
                        private_key = StringIO(unicode(pkey_content))
                        pkobj = paramiko.RSAKey.from_private_key(private_key)
                        client.connect(
                            hostname=destination_server,
                            username=username,
                            pkey=pkobj,
                            port=port, sock=sock, banner_timeout=30)
                    else:
                        client.connect(
                            hostname=destination_server,
                            username=username,
                            password=password,
                            port=port, sock=sock, banner_timeout=30)

                    logger.debug(client)

                    agent_conn_exists = True
                    changes = {
                        'Xterm Access': ['Success']
                    }
                    LogEntry.objects.log_create(
                        instance,
                        action=LogEntry.Action.XTERM_ACCESS,
                        changes=json.dumps(changes),
                    )
                    client.close()
                    logger.debug("No....Exception")
                    response = {
                        "agent_id": agent.uuid,
                        "org_id": agent.customer.id,
                        'pkey': pkey_content
                    }
                    return Response(response, status=status.HTTP_200_OK)
                except AuthenticationException:
                    logger.error("AuthenticationException")
                except SSHException:
                    logger.error("SSHException")
                except socket.error:
                    logger.error("socket.error")

            elif (not agent and not azure) or azure_ssh_public:
                ssh = paramiko.SSHClient()
                ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                try:
                    if pkey_file:
                        private_key = StringIO(unicode(pkey_content))
                        pkobj = paramiko.RSAKey.from_private_key(private_key)
                        ssh.connect(
                            hostname=hostname,
                            port=int(port),
                            username=username,
                            pkey=pkobj,
                            look_for_keys=False,
                            timeout=10
                        )
                    else:
                        ssh.connect(
                            hostname=hostname,
                            port=int(port),
                            username=username,
                            password=password,
                            look_for_keys=False,
                            timeout=10
                        )
                    logger.debug("Checking connection/............")
                    changes = {
                        'Xterm Access': ['Success']
                    }
                    LogEntry.objects.log_create(
                        instance,
                        action=LogEntry.Action.XTERM_ACCESS,
                        changes=json.dumps(changes),
                    )
                    ssh.close()
                    logger.debug("Connection Sucessful!!")
                    response = {
                        "agent_id": None,
                        "org_id": None,
                        'pkey': pkey_content
                    }
                    return Response(response, status=status.HTTP_200_OK)
                except AuthenticationException:
                    logger.debug("AuthenticationException")
                    return Response("Username or Password did not match.", status=status.HTTP_400_BAD_REQUEST)
                except SSHException:
                    logger.debug("SSHException")
                    return Response("Could not connect to host: %s:%s" % (hostname, port),
                                    status=status.HTTP_400_BAD_REQUEST)
                except socket.error:
                    logger.debug("socket.error")
                    return Response("Could not connect to host: %s:%s" % (hostname, port),
                                    status=status.HTTP_400_BAD_REQUEST)

            # If connection failed from all agents
            if not agent_conn_exists:
                msg = "Unable to connect from any of the agent"
                logger.info(msg)
                return Response(msg, status=status.HTTP_400_BAD_REQUEST)

        except ObjectDoesNotExist:
            return Response("Device does not exists!!!", status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.debug("Exception")
            logger.error({"Exception : ": e})
            return Response("Error occcured while connecting..", status=status.HTTP_400_BAD_REQUEST)


class ProxyLogEntry:

    @detail_route(methods=['POST'])
    def update_activity_log(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            changes = {
                'Management Console Access': ['Success']
            }
            LogEntry.objects.log_create(
                instance,
                action=LogEntry.Action.MANAGEMENT_CONSOLE_ACCESS,
                changes=json.dumps(changes),
            )
            return Response(status=status.HTTP_200_OK)
        except Exception as error:
            return Response("Error occcured while adding activity log : {}".format(error),
                            status=status.HTTP_400_BAD_REQUEST)


def flatten(lst):
    '''
        Combines lists of list to a single list
    '''
    return sum(([x] if not isinstance(x, list) else flatten(x)
                for x in lst), [])


def check_device_position_exists(cabinet, position, size, device_uuid=None):
    '''
        Check device postion for saving devices in cabinet
    '''
    if not position or not size:
        return False
    if position is 0:
        return False
    pdu = apps.get_model('inventory', 'PDU').objects.exclude(uuid=device_uuid)
    if str(position).upper() in ('A', 'B', 'C', 'D'):
        return pdu.filter(cabinet__uuid=cabinet, position=position).exists()

    models = (
        'Firewall', 'Switch', 'LoadBalancer', 'Server',
        'StorageDevice', 'CustomDevice', 'PanelDevice'
    )
    devices = pdu.filter(
        cabinet__uuid=cabinet, pdu_type='HORIZONTAL', position__gt=0
    ).annotate(_position=Cast('position', IntegerField())).values('_position', 'size')

    for model_name in models:
        model = apps.get_model('inventory', model_name)
        devices = devices.union(
            model.objects.filter(
                cabinet__uuid=cabinet, position__gt=0
            ).annotate(_position=F('position')).exclude(
                uuid=device_uuid
            ).values('_position', 'size')
        )

    for device in devices:
        d_position, d_size = int(device['_position']), device['size']
        if not ((d_position < position and d_size <= position - d_position) or (
                d_position > position and d_position >= position + size)):
            return True
    return False


def device_crud_position_size_validation(cabinet_uuid, device_position, device_size, cabinet_size, device_uuid=None):
    device_size_not_valid = device_size > cabinet_size
    device_position_not_valid = device_position > cabinet_size
    position_size_combiation_invalid = (device_position + device_size - 1) > cabinet_size
    device_position_already_occupied = check_device_position_exists(cabinet_uuid, device_position, device_size, device_uuid)
    err = {}
    if device_size < 1:
        err['size'] = ["Device size can't be less than 1."]
    if device_size_not_valid:
        err['size'] = ["Device size should not exceed cabinet size"]
    if device_position_not_valid:
        err['position'] = ["Position should not exceed cabinet size"]
    if position_size_combiation_invalid:
        err['size'] = ["Device size should not exceed cabinet size from its position"]
    if device_position_already_occupied:
        err['position'] = ["This position is already taken by other device"]
    if err:
        return err


class OnboardStatus:
    onboard_status_dict = {
        'vpn_req': 1,
        'excel_start': 2,
        'excel_end': 4,
        'monitoring_start': 8,
        'monitoring_error': 16,
        'monitoring_end': 32,
        'manage_start': 64,
        'manage_error': 128,
        'manage_end': 256
    }

    status = {
        'vpn_req': False,
        'excel_start': False,
        'excel_end': False,
        'monitoring_start': False,
        'monitoring_error': False,
        'monitoring_end': False,
        'manage_start': False,
        'manage_error': False,
        'manage_end': False
    }

    def get_status_by_value(self, onboard_db_status):
        return_status = {}
        for k, v in self.onboard_status_dict.iteritems():
            if (v & onboard_db_status):
                return_status[k] = True
            else:
                return_status[k] = False
        return return_status

    def set_db_status(self, status, onboard_db_status):
        for k, v in status.iteritems():
            onboard_db_status = self.onboard_status_dict[k] | onboard_db_status
            if v is False:
                onboard_db_status -= self.onboard_status_dict[k]
        return onboard_db_status

    def update_db_status(self, customer, new_status):
        onboarding_status = customer.onboarding_status
        db_status = self.get_status_by_value(onboarding_status)
        db_status.update(new_status)
        value_to_update = self.set_db_status(db_status, onboarding_status)
        customer.onboarding_status = value_to_update
        customer.save()


class Color(object):
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def write_green(s):
    sys.stdout.write(Color.OKGREEN + s + Color.ENDC + '\n')


def write_red(s):
    sys.stdout.write(Color.FAIL + s + Color.ENDC + '\n')


def write_blue(s):
    sys.stdout.write(Color.OKBLUE + s + Color.ENDC + '\n')


def url_check(url):
    try:
        validate = URLValidator()
        validate(url)
        return True
    except ValidationError:
        False


def percentage(num, denom):
    try:
        return round(((num * 100) / denom), 1)
    except ZeroDivisionError:
        if num == 0 and denom == 0:
            return 0
        return round(100, 1)


def convert_mb_gb(size):
    try:
        size = int(size)
    except:
        return 0
    else:
        return size / 1024


def convert_Mhz_vcpu(mhz, vcpu_speed=1):
    Ghz = float(mhz) / 1000
    return int(Ghz / vcpu_speed)


def convert_tb_gb(size):
    return int(size) * 1024


def convert_gb_tb_float(size):
    return '{:.2f}'.format(float(size) / 1024) + ' TB' if float(size) > 1024 else str(float(size)) + ' GB'


def convert_bytes_gb(size):
    return int(size) / (1024 * 1024 * 1024)


def convert_bytes_gb_float(size):
    return '{:.2f}'.format(float(size) / (1024 * 1024 * 1024))


def convert_bytes_mb(size):
    return int(size) / (1024 * 1024)


def sizeof_fmt(num):
    """
    Returns the human readable version of a file size
    :param num:
    :return:
    """
    units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    for item in units:
        if num < 1024.0:
            return "%3.1f %s" % (num, item)
        num /= 1024.0
    return "%3.1f %s" % (num, 'YB')


def str_to_gb(size_str):
    units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    size_str = size_str.strip()

    found_unit = None
    for unit in units:
        if unit in size_str:
            found_unit = unit
            break

    if not found_unit:
        return 0.0

    num_part = size_str.split(found_unit)[0].strip()
    num = float(num_part)
    power = units.index(found_unit)
    total_bytes = num * (1024.0 ** power)
    if total_bytes < ((1024.0 ** 2) * 500):
        return 0.0
    gb_digit = total_bytes / (1024.0 ** 3)
    return gb_digit


def sizeof_freq(freq):
    """
    Returns the human-readable version of a frequency size.
    :param freq: The frequency in Hertz (Hz)
    :return: A human-readable frequency size string
    """
    units = ['Hz', 'kHz', 'MHz', 'GHz', 'THz', 'PHz', 'EHz', 'ZHz', 'YHz']
    for unit in units:
        if freq < 1000.0:
            return "%3.1f %s" % (freq, unit)
        freq /= 1000.0
    return "%3.1f %s" % (freq, 'YHz')


class BaseUnitConverter(object):
    BASE = 1024
    UNITS = ()

    @classmethod
    def base_unit_to_max_unit(cls, size):
        base = float(cls.BASE)
        for unit in cls.UNITS:
            if size < base:
                return round(size, 2), unit
            size = size / base

    @classmethod
    def from_unit_to_max_unit(cls, size, from_unit):
        from_index = cls.UNITS.index(from_unit)
        base = float(cls.BASE)
        for unit in cls.UNITS[from_index:]:
            if size < base:
                return round(size, 2), unit
            size = size / base

    @classmethod
    def convert(cls, size, from_unit, to_unit):
            from_index = cls.UNITS.index(from_unit)
            to_index = cls.UNITS.index(to_unit)
            size = float(size)

            if from_index < to_index:
                for unit in cls.UNITS[from_index + 1: to_index + 1]:
                    size = size / cls.BASE
            elif from_index > to_index:
                for unit in cls.UNITS[to_index: from_index]:
                    size = size * cls.BASE
            return round(size, 2)


class StorageUnitConverter(object):
    BASE = 1024
    BYTES = 'B'
    KB = 'KB'
    MB = 'MB'
    GB = 'GB'
    TB = 'TB'
    UNITS = (BYTES, KB, MB, GB, TB)

    @classmethod
    def bytes_to_max_unit(cls, size):
        base = float(cls.BASE)
        for unit in cls.UNITS:
            if size < base:
                return round(size, 2), unit
            size = size / base

    @classmethod
    def convert(cls, size, from_unit, to_unit):
            from_index = cls.UNITS.index(from_unit)
            to_index = cls.UNITS.index(to_unit)
            size = float(size)

            if from_index < to_index:
                for unit in cls.UNITS[from_index + 1: to_index + 1]:
                    size = size / cls.BASE
            elif from_index > to_index:
                for unit in cls.UNITS[to_index: from_index]:
                    size = size * cls.BASE
            return round(size, 2)


class DataUnitConverter(BaseUnitConverter):
    BASE = 1024
    bps = 'bps'
    Kbps = 'Kbps'
    Mbps = 'Mbps'
    Gbps = 'Gbps'
    Tbps = 'Tbps'
    UNITS = (bps, Kbps, Mbps, Gbps, Tbps)


class PowerUnitConverter(BaseUnitConverter):
    BASE = 1000
    w = 'W'
    Kw = 'kW'
    Mw = 'MW'
    Gw = 'GW'
    Tw = 'TW'
    UNITS = (w, Kw, Mw, Gw, Tw)


def validate_uuid4(uuid_string):
    try:
        val = uuid.UUID(uuid_string, version=4)
    except (TypeError, ValueError):
        return False
    return val.hex == uuid_string.replace("-", "")


retry = 2
delay = 5
timeout = 3


def isOpen(ip, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    try:
        s.connect((ip, int(port)))
        s.shutdown(socket.SHUT_RDWR)
        return True
    except:
        return False
    finally:
        s.close()


def checkHost(ip, port):
    ipup = False
    for i in range(retry):
        if isOpen(ip, port):
            ipup = True
            break
        else:
            time.sleep(delay)
    return ipup


def value_to_float(x):
    if type(x) == float or type(x) == int:
        return x
    elif type(x) is str or type(x) is unicode:
        try:
            return float(x)
        except ValueError:
            pass

    x = x.lower()
    if 'k' in x:
        if len(x) > 1:
            return float(x.replace('k', '')) * 1000
        return 1000.0
    if 'm' in x:
        if len(x) > 1:
            return float(x.replace('m', '')) * 1000000
        return 1000000.0
    if 'b' in x:
        return float(x.replace('b', '')) * 1000000000
    return 0.0


class Device(object):
    # device types
    switch = 'switch'
    firewall = 'firewall'
    load_balancer = 'load_balancer'
    storage = 'storage'
    hypervisor = 'hypervisor'
    bms = 'baremetal'
    pdu = 'pdu'
    mac_device = 'mac_device'
    mobile = 'mobile'
    database = 'database'
    custom = 'custom'
    vm = 'vm'
    container = 'container'
    azure_resource = 'azure_resource'
    aws_resource = 'aws_resource'
    oci_resource = 'oci_resource'
    gcp_resource = 'gcp_resource'
    pure_storage = 'pure_storage'
    ontap_storage = 'ontap_storage'

    # private cloud types
    nutanix = 'nutanix'
    open_stack = 'open_stack'
    vmware = 'vmware'
    vcloud = 'vcloud'
    esxi = 'esxi'
    proxmox = 'proxmox'
    g3kvm = 'g3kvm'
    hyperv = 'hyperv'
    customvm = 'virtual_machine'

    # public cloud types
    azure = 'azure'
    aws = 'aws'
    gcp = 'gcp'
    oci = 'oci'
    azure_vm = 'azure_vm'
    gcp_vm = 'gcp_vm'
    oci_vm = 'oci_vm'
    aws_vm = 'aws_vm'

    # Container Types
    docker = 'docker'
    # kubernetes = 'kubernetes'
    kubernetes_pods = 'kubernetes_pods'
    kubernetes_nodes = 'kubernetes_nodes'
    # ontap storage types
    ontap_storage_cluster = 'ontap_storage_cluster'
    ontap_storage_node = 'ontap_storage_node'
    ontap_storage_disk = 'ontap_storage_disk'
    ontap_storage_svm = 'ontap_storage_svm'
    ontap_storage_volume = "ontap_storage_volume"
    ontap_storage_aggregate = "ontap_storage_aggregate"
    ontap_storage_lun = "ontap_storage_lun"
    ontap_storage_snapmirror = "ontap_storage_snapmirror"
    ontap_storage_cluster_peer = "ontap_storage_cluster_peer"
    ontap_storage_ethernet = "ontap_storage_ethernet"
    ontap_storage_fc = "ontap_storage_fc"
    ontap_storage_shelve = "ontap_storage_shelve"
    ontap_storage_fileshare = "ontap_storage_fileshare"

    # vmware cluster
    vmware_cluster = "vmware_cluster"

    # pure storage child types
    pure_array = 'pure_array'
    pure_volumes = 'pure_volumes'
    pure_hosts = 'pure_hosts'
    pure_pods = 'pure_pods'
    pure_host_groups = 'pure_host_groups'
    pure_volume_groups = 'pure_volume_groups'
    pure_volume_snapshots = 'pure_volume_snapshots'
    pure_protection_groups = 'pure_protection_groups'
    pure_pg_snapshots = 'pure_pg_snapshots'

    bgp_peer_data = 'bgp_peer_data'
    service = 'service'
    interface = 'interface'
    mac_address = 'mac_address'
    database_entity = 'database_entity'

    server_storage_device = "server_storage_device"
    server_storage_adapter = "server_storage_adapter"
    server_virtual_switch = "server_virtual_switch"
    server_kernel_adapter = "server_kernel_adapter"
    server_physical_adapter = "server_physical_adapter"
    server_firewall = "server_firewall"

    # Integration Accounts
    meraki = 'meraki'
    meraki_device = 'meraki_device'
    meraki_organization = 'meraki_organization'
    viptela = 'viptela'
    veeam = 'veeam'
    viptela_device = 'viptela_device'
    vmware_account = 'VMware'

    # BMC Device Categories
    network_device = 'Network'
    hardware_device = 'Hardware'
    server_device = 'Server Device'
    virtual_device = 'Virtualization Device'
    cloud_resource = 'Cloud Resource'
    storage_device = 'Storage Device'
    container_device = 'Container Device'
    mobile_device = 'Mobile Device'
    custom_device = 'Custom Device'
    device_service = 'Device Service'

    # BMC Device Types
    switch_type = 'Switch'
    firewall_type = 'Network'
    lb_type = 'Hardware'
    interface_type = 'Card'

    # BMC Device Item
    interface_item = 'Network interface card'
    switch_item = 'Data Switch'
    firewall_item = 'Firewall'
    lb_item = 'Load balancer'
    bgp_data_item = 'BGP Peer'

    # IOT / Non IT Devices
    smart_pdu = 'smart_pdu'
    sensor = 'sensor'
    rfid_reader = 'rfid_reader'

    MONITORABLE_DEVICES = (
        switch,
        firewall,
        load_balancer,
        storage,
        hypervisor,
        bms,
        pdu,
        mac_device,
        database,
        vm,
        container,
        custom,
        azure_resource,
        meraki,
        meraki_device,
        meraki_organization,
        viptela,
        veeam,
        viptela_device,
        vmware_account,
        smart_pdu,
        sensor,
        rfid_reader
    )
    model_map = {
        switch: 'Switch',
        firewall: 'Firewall',
        load_balancer: 'LoadBalancer',
        storage: 'StorageDevice',
        hypervisor: 'Server',
        bms: 'BMServer',
        pdu: 'PDU',
        database: 'DatabaseServer',
        mac_device: 'MacDevice',
        custom: 'CustomDevice',
        azure_resource: 'AzureResource',
        vm: {
            open_stack: 'OpenStackVmMigration',
            vmware: 'VmwareVmMigration',
            vcloud: 'VCloudVirtualMachines',
            esxi: 'VmwareVmMigration',
            proxmox: 'ProxmoxVM',
            g3kvm: 'ProxmoxVM',
            hyperv: 'HypervVM',
            customvm: 'VirtualMachine'
        },
        container: {
            docker: 'DockerManagerAccount',
            # kubernetes: 'KubernetesAccount'
        },
        meraki: 'CiscoMerakiAccount',
        meraki_device: 'CiscoMerakiDevice',
        meraki_organization: 'CiscoMerakiOrganization',
        viptela: 'ViptelaAccount',
        viptela_device: 'ViptelaDevice',
        veeam: 'Veeam',
        vmware_account: 'VMwareVcenter',
        smart_pdu: 'SmartPDU',
        sensor: 'Sensor',
        rfid_reader: 'RfidReader'
    }

    credentials_map_devices = {
        switch: 'Switch',
        firewall: 'Firewall',
        load_balancer: 'LoadBalancer',
        storage: 'StorageDevice',
        hypervisor: 'Hypervisor',
        bms: 'BMServer',
        database: 'DatabaseServer',
        mac_device: 'MacDevice',
        open_stack: 'OpenStackVmMigration',
        vmware: 'VmwareVmMigration',
        vcloud: 'VCloudVirtualMachines',
        esxi: 'VmwareVmMigration',
        hyperv: 'HypervVM',
        customvm: 'VirtualMachine',
        smart_pdu: 'SmartPDU',
        sensor: 'Sensor',
        rfid_reader: 'RfidReader'
    }

    model_name_fields = {
        switch: 'Switch',
        firewall: 'Firewall',
        load_balancer: 'LoadBalancer',
        storage: 'StorageDevice',
        pure_storage: 'StorageDevice',
        ontap_storage: 'StorageDevice',
        hypervisor: 'Server',
        bms: 'BMServer',
        pdu: 'PDU',
        database: 'DatabaseServer',
        mac_device: 'MacDevice',
        mobile: 'Mobile',
        custom: 'CustomDevice',
        open_stack: 'OpenStackVmMigration',
        vmware: 'VmwareVmMigration',
        vcloud: 'VCloudVirtualMachines',
        esxi: 'VmwareVmMigration',
        proxmox: 'ProxmoxVM',
        g3kvm: 'ProxmoxVM',
        hyperv: 'HypervVM',
        customvm: 'VirtualMachine',
        docker: 'DockerManagerAccount',
        # kubernetes: 'KubernetesAccount',
        kubernetes_pods: 'KubernetesPods',
        kubernetes_nodes: 'KubernetesNodes',
        aws_resource: 'AwsResource',
        azure_resource: 'AzureResource',
        gcp_resource: 'GCPResource',
        gcp_vm: 'GCPVirtualMachines',
        oci_vm: 'OCIResourceVM',
        ontap_storage_cluster: 'Cluster',
        ontap_storage_node: 'Node',
        ontap_storage_disk: 'Disk',
        ontap_storage_svm: 'SVM',
        ontap_storage_volume: 'Volume',
        ontap_storage_aggregate: 'Aggregate',
        ontap_storage_lun: 'LUN',
        ontap_storage_snapmirror: 'Snapmirror',
        ontap_storage_cluster_peer: 'ClusterPeer',
        ontap_storage_ethernet: 'Ethernet',
        ontap_storage_fc: 'FC',
        ontap_storage_shelve: 'Shelve',
        meraki: 'CiscoMerakiAccount',
        meraki_device: 'CiscoMerakiDevice',
        meraki_organization: 'CiscoMerakiOrganization',
        viptela: 'ViptelaAccount',
        viptela_device: 'ViptelaDevice',
        veeam: 'Veeam',
        vmware_account: 'VMwareVcenter',
        bgp_peer_data: 'NetworkDeviceBGPPeerData',
        service: 'DeviceServices',
        interface: 'DeviceInterfaceRemoteData',
        mac_address: 'DeviceInterfaceMacAddress',
        pure_array: 'PureStorageArray',
        pure_volumes: 'PureStorageVolume',
        pure_hosts: 'PureStorageHost',
        pure_pods: 'PureStoragePod',
        pure_host_groups: 'PureStorageHostGroup',
        pure_volume_groups: 'PureStorageVolumeGroup',
        pure_volume_snapshots: 'PureStorageSnapShot',
        pure_protection_groups: 'PureStorageProtectionGroup',
        pure_pg_snapshots: 'PureStorageProtectionGroupSnapshot',
        server_storage_device: 'HypervisorStorageDevices',
        server_storage_adapter: 'HypervisorStorageAdapters',
        server_firewall: 'HypervisorFirewalls',
        server_virtual_switch: 'HypervisorVirtualSwitches',
        server_kernel_adapter: 'HypervisorVMkernelAdapters',
        server_physical_adapter: 'HypervisorPhysicalAdapters',
        smart_pdu: 'SmartPDU',
        sensor: 'Sensor',
        rfid_reader: 'RfidReader',
        database_entity: 'DatabaseEntity',
        vmware_cluster: 'VmwareVcenterCluster'
    }

    observium_model_map = {
        switch: 'observium_switch',
        firewall: 'observium_firewall',
        load_balancer: 'observium_loadbalancer',
        hypervisor: 'observium_server',
        storage: 'observium_storagedevice',
        pdu: 'observium_pdu',
        mac_device: 'observium_macdevice',
        vm: {
            open_stack: 'observium_openstack_vm',
            vmware: 'observium_vmware_vm',
            vcloud: 'observium_vcloud_vm',
            esxi: 'observium_vmware_vm',
            proxmox: 'observium_proxmox_vm',
            g3kvm: '',
            hyperv: 'observium_hyperv_vm',
            customvm: 'observium_custom_vm'
        },
        # container: {
        #     docker: 'DockerManagerAccount',
        #     # kubernetes: 'KubernetesAccount'
        # }
    }

    @classmethod
    def get_credentials_device_map(cls):
        from app.inventory import models as inventory_models
        from cloud.openstack_app.models import OpenStackVmMigration
        from cloud.VmwareAdapter.models import VmwareVmMigration
        from cloud.vcloud.models import VCloudVirtualMachines
        from cloud.hyperv.models import HypervVM
        from rest.customer.related_serializers import (
            CustomerSwitchFastSerializer, CustomerFirewallFastSerializer, CustomerLoadBalancerFastSerializer,
            CustomerStorageDeviceFastSerializer, CustomerHypervisorFastSerializer, CustomerBMServerFastSerializer,
            CustomerDatabaseServerFastSerializer, CustomerMacDeviceFastSerializer, CustomerOpenStackVMFastSerializer,
            CustomerVMwareVMFastSerializer, CustomerVCloudVMFastSerializer, CustomerHyperVVMFastSerializer,
            CustomerCustomVMFastSerializer, CustomerSmartPDUFastSerializer, CustomerSensorFastSerializer,
            # CustomerRfidReaderFastSerializer
        )
        device_type_model_map = {
            cls.switch: (inventory_models.Switch, CustomerSwitchFastSerializer),
            cls.firewall: (inventory_models.Firewall, CustomerFirewallFastSerializer),
            cls.load_balancer: (inventory_models.LoadBalancer, CustomerLoadBalancerFastSerializer),
            cls.storage: (inventory_models.StorageDevice, CustomerStorageDeviceFastSerializer),
            cls.hypervisor: (inventory_models.Hypervisor, CustomerHypervisorFastSerializer),
            cls.bms: (inventory_models.BMServer, CustomerBMServerFastSerializer),
            cls.database: (inventory_models.DatabaseServer, CustomerDatabaseServerFastSerializer),
            cls.mac_device: (inventory_models.MacDevice, CustomerMacDeviceFastSerializer),
            cls.open_stack: (OpenStackVmMigration, CustomerOpenStackVMFastSerializer),
            cls.vmware: (VmwareVmMigration, CustomerVMwareVMFastSerializer),
            cls.vcloud: (VCloudVirtualMachines, CustomerVCloudVMFastSerializer),
            cls.esxi: (VmwareVmMigration, CustomerVMwareVMFastSerializer),
            cls.hyperv: (HypervVM, CustomerHyperVVMFastSerializer),
            cls.customvm: (inventory_models.VirtualMachine, CustomerCustomVMFastSerializer),
            cls.smart_pdu: (inventory_models.SmartPDU, CustomerSmartPDUFastSerializer),
            cls.sensor: (inventory_models.Sensor, CustomerSensorFastSerializer),
            # cls.rfid_reader: (inventory_models.RfidReader, CustomerRfidReaderFastSerializer)
        }
        return device_type_model_map

    @classmethod
    def get_observium_device_model(cls, device_type, platform_type=None):
        from integ.ObserviumBackend import models as observium_models
        model_map = {
            cls.switch: 'ObserviumSwitch',
            cls.firewall: 'ObserviumFirewall',
            cls.load_balancer: 'ObserviumLoadBalancer',
            cls.hypervisor: 'ObserviumServer',
            cls.storage: 'ObserviumStorageDevice',
            cls.pdu: 'ObserviumPDU',
            cls.mac_device: 'ObserviumMacDevice',
            cls.vm: {
                cls.open_stack: 'ObserviumOpenStackVM',
                cls.vmware: 'ObserviumVMwareVM',
                cls.vcloud: 'ObserviumVCloudVM',
                cls.esxi: 'ObserviumVMwareVM',
                cls.proxmox: 'ObserviumProxmoxVM',
                cls.g3kvm: '',
                cls.hyperv: 'ObserviumHypervVM',
                cls.customvm: 'ObserviumCustomCloudVM'
            },
            cls.container: {
                cls.docker: 'DockerManagerAccount',
                # cls.kubernetes: 'KubernetesAccount'
            },
            cls.meraki: 'CiscoMerakiAccount',
            cls.meraki_device: 'CiscoMerakiDevice',
            cls.meraki_organization: 'CiscoMerakiOrganization',
            cls.viptela: 'ViptelaAccount',
            cls.viptela_device: 'ViptelaDevice',
            cls.veeam: 'Veeam',
            cls.smart_pdu: 'SmartPDU',
            cls.sensor: 'Sensor',
            cls.rfid_reader: 'RfidReader'
        }
        if platform_type:
            return getattr(observium_models, model_map.get(device_type).get(platform_type))
        return getattr(observium_models, model_map.get(device_type))

    @classmethod
    def get_zabbix_device_model(cls, device_type, platform_type=None):
        from integ.zabbix import models as zabbix_models
        model_map = {
            cls.switch: 'ZabbixHostSwitchMap',
            cls.firewall: 'ZabbixHostFirewallMap',
            cls.load_balancer: 'ZabbixHostLoadBalancerMap',
            cls.hypervisor: 'ZabbixHostServerMap',
            cls.bms: 'ZabbixHostBMServerMap',
            cls.storage: 'ZabbixHostStorageDeviceMap',
            cls.pdu: 'ZabbixHostPDUMap',
            cls.mac_device: 'ZabbixHostMacDeviceMap',
            cls.azure_resource: 'ZabbixAzureResourceMap',
            cls.vm: {
                cls.open_stack: 'ZabbixHostOpenStackVMMap',
                cls.vmware: 'ZabbixHostVMWareVMMap',
                cls.vcloud: 'ZabbixHostVCloudVMMap',
                cls.esxi: 'ZabbixHostESXiVMMap',
                # cls.proxmox: '',
                # cls.g3kvm: '',
                cls.hyperv: 'ZabbixHostHypervVMMap',
                cls.customvm: 'ZabbixHostCustomVMMap'
            },
            cls.container: {
                cls.docker: 'ZabbixHostDockerMap',
                # cls.kubernetes: 'ZabbixHostKubernetesMap'
            },
            cls.meraki: 'ZabbixHostMerakiMap',
            cls.meraki_device: 'ZabbixMerakiDeviceMap',
            cls.meraki_organization: 'ZabbixMerakiOrganizationMap',
            cls.viptela: 'ZabbixHostViptelaMap',
            cls.viptela_device: 'ZabbixHostViptelaDeviceMap',
            cls.veeam: 'ZabbixHostVeeamMap',
            cls.vmware_account: 'ZabbixHostVCenterCloudMap',
            cls.smart_pdu: 'ZabbixSmartPDUHostMap',
            cls.sensor: 'ZabbixSensorHostMap',
            cls.rfid_reader: 'ZabbixRfidReaderHostMap'
        }
        if platform_type:
            return getattr(zabbix_models, model_map.get(device_type).get(platform_type))
        if isinstance(model_map.get(device_type), dict):
            return {k: getattr(zabbix_models, v) for k, v in model_map.get(device_type).iteritems()}
        return getattr(zabbix_models, model_map.get(device_type))

    @classmethod
    def device_model_class_map(cls):
        from app.inventory import models as inventory_models
        from cloud.openstack_app.models import OpenStackVmMigration
        from cloud.vcloud.models import VCloudVirtualMachines
        from cloud.VmwareAdapter.models import VmwareVmMigration
        from cloud.proxmox.models import ProxmoxVM
        from cloud.hyperv.models import HypervVM
        from cloud.AzureAdapter.models import AzureVM, AzureResource
        from cloud.AWSAdapter.models import AwsVirtualMachine
        from cloud.gcp.models import GCPVirtualMachines
        from cloud.oci_cloud.models import OCIResourceVM
        from cloud.docker.models import DockerManagerAccount
        # from cloud.kubernetes.models import KubernetesAccount
        from integ.CiscoMeraki.models import CiscoMerakiAccount, CiscoMerakiDevice, CiscoMerakiOrganization
        from integ.sdwan.models import ViptelaAccount, ViptelaDevice
        from integ.veeam.models import Veeam
        from cloud.vmware.models import VMwareVcenter
        model_map = {
            cls.switch: inventory_models.Switch,
            cls.firewall: inventory_models.Firewall,
            cls.load_balancer: inventory_models.LoadBalancer,
            cls.hypervisor: inventory_models.Hypervisor,
            cls.bms: inventory_models.BareMetal,
            cls.storage: inventory_models.StorageDevice,
            cls.pdu: inventory_models.PDU,
            cls.mac_device: inventory_models.MacDevice,
            cls.mobile: inventory_models.MobileDevice,
            cls.database: inventory_models.DatabaseServer,
            cls.custom: inventory_models.CustomDevice,
            cls.azure_resource: AzureResource,
            cls.vm: {
                cls.open_stack: OpenStackVmMigration,
                cls.vmware: VmwareVmMigration,
                cls.vcloud: VCloudVirtualMachines,
                cls.esxi: VmwareVmMigration,
                cls.proxmox: ProxmoxVM,
                cls.g3kvm: ProxmoxVM,
                cls.hyperv: HypervVM,
                cls.customvm: inventory_models.VirtualMachine,
                cls.azure_vm: AzureVM,
                cls.aws_vm: AwsVirtualMachine,
                cls.gcp_vm: GCPVirtualMachines,
                cls.oci_vm: OCIResourceVM,
            },
            cls.container: {
                cls.docker: DockerManagerAccount,
                # cls.kubernetes: KubernetesAccount
            },
            cls.meraki: CiscoMerakiAccount,
            cls.meraki_device: CiscoMerakiDevice,
            cls.meraki_organization: CiscoMerakiOrganization,
            cls.viptela: ViptelaAccount,
            cls.viptela_device: ViptelaDevice,
            cls.veeam: Veeam,
            cls.vmware_account: VMwareVcenter,
            cls.smart_pdu: inventory_models.SmartPDU,
            cls.sensor: inventory_models.Sensor,
            cls.rfid_reader: inventory_models.RfidReader
        }
        return model_map

    @classmethod
    def device_model_class_map_flat(cls):
        model_map = cls.device_model_class_map()
        vms_model_map = model_map.pop(cls.vm)
        model_map.update(vms_model_map)
        return model_map

    @classmethod
    def get_device_model(cls, device_type, platform_type=None):
        model_map = cls.device_model_class_map()
        if platform_type:
            return model_map.get(device_type).get(platform_type)
        return model_map.get(device_type)

    @classmethod
    def get_device_model_name(cls, device_type, platform_type=None):
        from app.inventory import models as inventory_models
        from cloud.openstack_app.models import OpenStackVmMigration
        from cloud.VmwareAdapter.models import VmwareVmMigration
        from cloud.vcloud.models import VCloudVirtualMachines
        from cloud.VmwareAdapter.models import VmwareVmMigration
        from cloud.vmware.models import VmwareVcenterCluster
        from cloud.proxmox.models import ProxmoxVM
        from cloud.hyperv.models import HypervVM
        from cloud.AWSAdapter.models import AwsResource
        from cloud.AzureAdapter.models import AzureResource
        from cloud.gcp.models import GCPVirtualMachines
        from cloud.oci_cloud.models import OCIResourceVM
        from cloud.docker.models import DockerManagerAccount
        # from cloud.kubernetes.models import KubernetesAccount
        from integ.netapp.ontap.models import (
            Cluster, Disk, Node, SVM, Shelve, Snapmirror, ClusterPeer, Aggregate, Volume, LUN, FC, Ethernet
        )
        from unity_discovery.models import (
            NetworkDeviceBGPPeerData, DeviceServices, DeviceInterfaceRemoteData, DeviceInterfaceMacAddress
        )
        from integ.CiscoMeraki.models import CiscoMerakiAccount, CiscoMerakiDevice, CiscoMerakiOrganization
        from integ.sdwan.models import ViptelaAccount, ViptelaDevice
        from integ.veeam.models import Veeam
        from cloud.vmware.models import VMwareVcenter
        from integ.purestorage.models import (
            PureStorageArray, PureStoragePod, PureStorageHost, PureStorageVolume, PureStorageVolumeGroup, PureStorageProtectionGroup,
            PureStorageSnapShot, PureStorageHostGroup, PureStorageProtectionGroupSnapshot
        )
        from cloud.kubernetes.models import KubernetesPods, KubernetesNodes
        model_map = {
            cls.switch: inventory_models.Switch,
            cls.firewall: inventory_models.Firewall,
            cls.load_balancer: inventory_models.LoadBalancer,
            cls.hypervisor: inventory_models.Server,
            cls.bms: inventory_models.BMServer,
            cls.storage: inventory_models.StorageDevice,
            cls.pure_storage: inventory_models.StorageDevice,
            cls.ontap_storage: inventory_models.StorageDevice,
            cls.pdu: inventory_models.PDU,
            cls.mac_device: inventory_models.MacDevice,
            cls.mobile: inventory_models.MobileDevice,
            cls.database: inventory_models.DatabaseServer,
            cls.custom: inventory_models.CustomDevice,
            cls.open_stack: OpenStackVmMigration,
            cls.vmware: VmwareVmMigration,
            cls.vcloud: VCloudVirtualMachines,
            cls.esxi: VmwareVmMigration,
            cls.proxmox: ProxmoxVM,
            cls.g3kvm: ProxmoxVM,
            cls.hyperv: HypervVM,
            cls.customvm: inventory_models.VirtualMachine,
            cls.docker: DockerManagerAccount,
            # cls.kubernetes: KubernetesAccount,
            cls.kubernetes_nodes: KubernetesNodes,
            cls.kubernetes_pods: KubernetesPods,
            cls.aws_resource: AwsResource,
            cls.azure_resource: AzureResource,
            cls.gcp_vm: GCPVirtualMachines,
            cls.oci_vm: OCIResourceVM,
            cls.ontap_storage_cluster: Cluster,
            cls.ontap_storage_node: Node,
            cls.ontap_storage_disk: Disk,
            cls.ontap_storage_svm: SVM,
            cls.ontap_storage_volume: Volume,
            cls.ontap_storage_aggregate: Aggregate,
            cls.ontap_storage_lun: LUN,
            cls.ontap_storage_snapmirror: Snapmirror,
            cls.ontap_storage_cluster_peer: ClusterPeer,
            cls.ontap_storage_ethernet: Ethernet,
            cls.ontap_storage_fc: FC,
            cls.ontap_storage_shelve: Shelve,
            cls.meraki: CiscoMerakiAccount,
            cls.meraki_device: CiscoMerakiDevice,
            cls.meraki_organization: CiscoMerakiOrganization,
            cls.viptela: ViptelaAccount,
            cls.viptela_device: ViptelaDevice,
            cls.veeam: Veeam,
            cls.vmware_account: VMwareVcenter,
            cls.bgp_peer_data: NetworkDeviceBGPPeerData,
            cls.service: DeviceServices,
            cls.interface: DeviceInterfaceRemoteData,
            cls.mac_address: DeviceInterfaceMacAddress,
            cls.pure_array: PureStorageArray,
            cls.pure_volumes: PureStorageVolume,
            cls.pure_hosts: PureStorageHost,
            cls.pure_pods: PureStoragePod,
            cls.pure_host_groups: PureStorageHostGroup,
            cls.pure_volume_groups: PureStorageVolumeGroup,
            cls.pure_volume_snapshots: PureStorageSnapShot,
            cls.pure_protection_groups: PureStorageProtectionGroup,
            cls.pure_pg_snapshots: PureStorageProtectionGroupSnapshot,
            cls.server_storage_device: inventory_models.HypervisorStorageDevices,
            cls.server_storage_adapter: inventory_models.HypervisorStorageAdapters,
            cls.server_firewall: inventory_models.HypervisorFirewalls,
            cls.server_virtual_switch: inventory_models.HypervisorVirtualSwitches,
            cls.server_kernel_adapter: inventory_models.HypervisorVMkernelAdapters,
            cls.server_physical_adapter: inventory_models.HypervisorPhysicalAdapters,
            cls.smart_pdu: inventory_models.SmartPDU,
            cls.sensor: inventory_models.Sensor,
            cls.rfid_reader: inventory_models.RfidReader,
            cls.database_entity: inventory_models.DatabaseEntity,
            cls.vmware_cluster: VmwareVcenterCluster
        }
        return model_map.get(device_type)

    @classmethod
    def get_model_fast_serializer(cls, device_type):
        from rest.customer.related_serializers import (
            CustomerSwitchFastSerializer, CustomerHypervisorFastSerializer, CustomerServerFastSerializer,
            CustomerStorageDeviceFastSerializer, CustomerFirewallFastSerializer, CustomerLoadBalancerFastSerializer,
            CustomerBMServerFastSerializer, CustomerDatabaseServerFastSerializer, CustomerCustomVMFastSerializer, CustomerVMwareVMFastSerializer,
            CustomerHyperVVMFastSerializer, CustomerMacDeviceFastSerializer, CustomerOpenStackVMFastSerializer, CustomerVCloudVMFastSerializer
        )
        serializer_map = {
            cls.switch: CustomerSwitchFastSerializer,
            cls.firewall: CustomerFirewallFastSerializer,
            cls.load_balancer: CustomerLoadBalancerFastSerializer,
            cls.hypervisor: CustomerHypervisorFastSerializer,
            cls.bms: CustomerBMServerFastSerializer,
            cls.mac_device: CustomerMacDeviceFastSerializer,
            cls.storage: CustomerStorageDeviceFastSerializer,
            cls.customvm: CustomerCustomVMFastSerializer,
            cls.vmware: CustomerVMwareVMFastSerializer,
            cls.esxi: CustomerVMwareVMFastSerializer,
            cls.hyperv: CustomerHyperVVMFastSerializer,
            cls.open_stack: CustomerOpenStackVMFastSerializer,
            cls.vcloud: CustomerVCloudVMFastSerializer,
            cls.database: CustomerDatabaseServerFastSerializer,
        }
        return serializer_map.get(device_type)

    @classmethod
    def cloud_model_class_map(cls):
        from cloud.AzureAdapter.models import AzureAccount
        from cloud.AWSAdapter.models import AWSAccount
        from cloud.gcp.models import GCPAccount
        from cloud.oci_cloud.models import OCIAccount
        model_map = {
            'Azure': AzureAccount,
            'AWS': AWSAccount,
            'GCP': GCPAccount,
            'OCI': OCIAccount
        }
        return model_map

    @classmethod
    def get_cloud_model(cls, cloud_type):
        from cloud.CloudService.models import PrivateCloud
        model_map = cls.cloud_model_class_map()
        if cloud_type in model_map.keys():
            return model_map.get(cloud_type)
        elif cloud_type in ['OpenStack', 'VMware', 'United Private Cloud vCenter', 'ESXi', 'Custom', 'vCloud Director',
                            'Proxmox', 'G3 KVM', 'Hyperv']:
            return PrivateCloud
        else:
            return None


class EDate(object):
    def __init__(self, dt=None, format='%Y-%m-%d'):
        if dt is None:
            dt = datetime.utcnow().strftime(format)
        if type(dt) is str or type(dt) is unicode:
            dt = datetime.strptime(dt, format)
        if type(dt) is EDate:
            dt = dt.dt
        self.dt = dt
        self.format = format

    def __str__(self):
        return self.dt.strftime(self.format)

    def __getattribute__(self, item):
        try:
            return super(EDate, self).__getattribute__(item)
        except AttributeError:
            return getattr(self.dt, item)

    def __cmp__(self, other):
        if self.dt < other.dt:
            return -1
        elif self.dt > other.dt:
            return 1
        else:
            return 0

    def __add__(self, other):
        return EDate(self.dt + other)

    def get_utc_timestamp(self):
        return (self.dt - datetime(1970, 1, 1)).total_seconds()

    def get_date_str(self, format=None):
        return self.dt.strftime('%Y-%m-%d')

    def get_date_time_str(self, format=None):
        return self.dt.strftime('%Y-%m-%d %H:%M:%S')

    def clear_time(self):
        self.dt = self.dt.replace(tzinfo=None, hour=0, minute=0, second=0, microsecond=0)

    def set_start_day_time(self):
        self.dt = self.dt.replace(hour=0, minute=0, second=0, microsecond=0)

    def set_end_day_time(self):
        self.dt = self.dt.replace(hour=23, minute=59, second=59)

    def get_next_date(self):
        return EDate(self.dt + timedelta(days=1))

    def get_previous_date(self):
        return EDate(self.dt - timedelta(days=1))

    def get_month_start_date(self):
        return EDate(self.dt + relativedelta(day=1))

    def get_month_end_date(self):
        return EDate(self.dt + relativedelta(day=1, months=+1, days=-1))

    def get_total_days_in_month(self):
        return self.get_month_end_date().day

    def get_month_date_range(self):
        return self.get_month_start_date(), self.get_month_end_date()

    def get_nth_month_date(self, n):
        return EDate(self.dt + relativedelta(months=n))

    def get_month_name(self):
        return self.dt.strftime('%b')

    def get_year_start_date(self):
        return EDate(self.dt.replace(month=1, day=1))

    def get_year_end_date(self):
        return EDate(self.dt.replace(month=12, day=31))

    @staticmethod
    def get_all_month_start_dates(start, end):
        start = EDate(start)
        end = EDate(end)
        loop_date = start
        dates = []
        while loop_date <= end:
            month_first_date = loop_date.get_month_start_date()
            dates.append(month_first_date)
            loop_date = month_first_date.get_month_end_date().get_next_date()
        return dates

    @staticmethod
    def get_all_month_end_dates(start, end):
        start = EDate(start)
        end = EDate(end)

        loop_date = start
        dates = []
        while loop_date <= end:
            month_last_date = loop_date.get_month_end_date()
            dates.append(month_last_date)
            loop_date = month_last_date.get_next_date()
        return dates

    def get_previous_n_months_last_date(self, n):
        ''' this includs current month last date even if not completed '''
        dates = []
        date = self.get_month_end_date()
        dates.append(date)
        n -= 1
        while n:
            date = date.get_month_start_date().get_previous_date()
            dates.append(date)
            n -= 1
        return dates

    def get_previous_n_quarter_dates(self, n):
        ''' this includs current quarter even if not completed '''
        month = int(self.month)
        completed_quarter, remaining_month = divmod(month, 3)
        count = completed_quarter
        if remaining_month:
            count += 1
        required = (n - count) * 3
        dates = self.get_previous_n_months_last_date(required + month)
        dates.reverse()
        dates_by_quarter = {}
        for i in range(0, len(dates), 3):
            quater_dates = tuple(dates[i:i + 3])
            # using quarter last date as key
            dates_by_quarter[str(quater_dates[-1])] = quater_dates
        return dates_by_quarter

    def get_previous_n_years_end_date(self, n):
        ''' this includs current year even if not completed '''
        years = []
        date = self
        years.append(date)
        n -= 1
        while n:
            date = date.get_year_start_date().get_previous_date()
            years.append(date)
            n -= 1
        return years


def iterable_date_period(start_date, end_date, interval_in_sec):
    pointer = start_date
    while pointer <= end_date:
        yield pointer
        pointer = pointer + timedelta(seconds=interval_in_sec)


def get_sms_email(user_list):
    email_list = []
    for user in user_list:
        if user.phone_number:
            sms_data = user.carrier.sms_list[0]
            email = sms_data.replace('<10-digit-number>', user.phone_number)
            email_list.append(email)
    return email_list


def seconds_to_duration(total_seconds):
    secs_in_a_min = 60
    secs_in_a_hour = 3600  # 60 * 60
    secs_in_a_day = 86400  # 24 * secs_in_a_hour
    days, seconds = divmod(total_seconds, secs_in_a_day)
    hours, seconds = divmod(seconds, secs_in_a_hour)
    minutes, seconds = divmod(seconds, secs_in_a_min)
    duration = ''
    if int(days):
        duration += '{}d '.format(int(days))
    if int(hours):
        duration += '{}h '.format(int(hours))
    if int(minutes):
        duration += '{}m '.format(int(minutes))
    if int(seconds):
        duration += '{}s'.format(int(seconds))
    return duration


def convert_to_value(amount, field):
    units = {
        'B': 1,
        'KB': 2**10,
        'MB': 2**20,
        'GB': 2**30,
        'TB': 2**40
    }
    amount = float(amount)
    if field == 'memory':
        value_in_mb = amount / units['MB']
        return round(value_in_mb, 2)
    else:
        value_in_gb = amount / units['GB']
        return round(value_in_gb, 2)


class PlainTextParser(BaseParser):
    media_type = "text/plain"

    def parse(self, stream, media_type=None, parser_context=None):
        """
        Parses the incoming bytestream as Plain Text and returns the resulting data.
        """
        parser_context = parser_context or {}
        encoding = parser_context.get('encoding', settings.DEFAULT_CHARSET)

        try:
            decoded_stream = codecs.getreader(encoding)(stream)
            text_content = decoded_stream.read()
            return text_content
        except ValueError as exc:
            raise ParseError('Plain text parse error - %s' % str(exc))


def get_device_model_from_string(string):
    from app.inventory import models as inventory_models
    from cloud.openstack_app.models import OpenStackVmMigration
    from cloud.vcloud.models import VCloudVirtualMachines
    from cloud.VmwareAdapter.models import VmwareVmMigration
    from cloud.proxmox.models import ProxmoxVM
    from cloud.hyperv.models import HypervVM
    from cloud.AWSAdapter.models import AwsResource
    from cloud.AzureAdapter.models import AzureResource
    from cloud.gcp.models import GCPVirtualMachines
    from cloud.oci_cloud.models import OCIResourceVM
    model_map = {
        'Switch': inventory_models.Switch,
        'Firewall': inventory_models.Firewall,
        'LoadBalancer': inventory_models.LoadBalancer,
        'Hypervisor': inventory_models.Hypervisor,
        'BMServer': inventory_models.BMServer,
        'StorageDevice': inventory_models.StorageDevice,
        'PDU': inventory_models.PDU,
        'MacDevice': inventory_models.MacDevice,
        'MobileDevice': inventory_models.MobileDevice,
        'DatabaseServer': inventory_models.DatabaseServer,
        'CustomDevice': inventory_models.CustomDevice,
        'OpenStackVmMigration': OpenStackVmMigration,
        'VCloudVirtualMachines': VCloudVirtualMachines,
        'VmwareVmMigration': VmwareVmMigration,
        'ProxmoxVM': ProxmoxVM,
        'HypervVM': HypervVM,
        'VirtualMachine': inventory_models.VirtualMachine,
    }
    return model_map.get(string, None)


def send_email_notification(vc_vm_data, task_status, exception=None):
    vc_vm_data['reason'] = exception
    group_users_emails = vc_vm_data['group_emails']
    user_email_list = vc_vm_data['user_emails']
    email_list = list(set(user_email_list + group_users_emails))
    template_map = {
        'SUCCESS': 'success_mail_template.html',
        'FAILURE': 'failure_mail_template.html',
    }
    try:
        if task_status in template_map:
            template_name = template_map[task_status]
            email_subject = 'Sync Notification : {} for Task: {}'.format(task_status, vc_vm_data['task_path'])

        template = get_template(template_name)
        email_content = template.render(vc_vm_data)
        if template:
            email_content = template.render(vc_vm_data)
            email = EmailMessage(
                email_subject,
                email_content,
                settings.DEFAULT_FROM_EMAIL,
                email_list
            )
            email.content_subtype = "html"
            sent = email.send()
            logger.info("Email sent %s for %s".format(task_status, vc_vm_data))
    except Exception as e:
        logger.error('send_email_notification() Exception %s .' % str(e))


def snmp_os_build(qs):
    o = qs[0].vcenter.private_cloud.customer
    col = o.agents.all().first()
    for q in qs:
        if q.connection_type == 'SNMP':
            command = 'snmpget -v 2c -c {} {} .1.3.6.1.2.1.1.1.0'.format(q.snmp_community, q.ip_address)
            output = col.execute_over_ssh_via_agent(command)
            try:
                version = output.split('Build ')[1].split(' Multi')[0]
                q.os_build_version = version
                q.save()
            except Exception as e:
                logger.error("OS Build Error %s" % e)
                logger.error("OS Build Output %s" % output)


def get_value_from_items(items, q, os, zabbix_db_ip):
    from django.db.models import Max
    val = None
    for item in items:
        history_obj = item.history_obj
        latest_obj = history_obj.objects.using(zabbix_db_ip).filter(item=item.item_id).annotate(
            max_clock=Max('clock'),
            max_ns=Max('ns')
        ).filter(clock=F('max_clock'), ns=F('max_ns')).first()
        if latest_obj is None:
            continue
        val = latest_obj.value
        if os and 'inux' in os.lower() and type(val) in [float, str, unicode]:
            val = str(val).split('.')
            if len(val) > 6:
                val = val[:-2]
            val = '.'.join(val)
        q.os_build_version = val
        q.save()
    return val


def agent_os_build(qs):
    from integ.zabbix.zabbix_backend_models import ZabbixHistory, ZabbixItems
    q = qs[0]
    failed = []
    zabbix_db_ip = q.zabbix.zabbix_customer_proxy.zabbix_customer.zabbix_instance.ip_address
    for n, q in enumerate(qs):
        try:
            os = None
            if q.os_type:
                os = q.os_type
            elif q.os_name:
                os = q.os_name
            host_ids = q._zabbix.all().values_list('host_id', flat=True)
            items = ZabbixItems.objects.using(zabbix_db_ip).filter(host_id__in=list(host_ids),
                                                                   key__startswith="uladmin.OSVersion")
            if not items:
                items = ZabbixItems.objects.using(zabbix_db_ip).filter(host_id__in=list(host_ids),
                                                                       key__startswith="system.sw.os.get.build")
            val = get_value_from_items(items, q, os, zabbix_db_ip)
            if not val:
                items = ZabbixItems.objects.using(zabbix_db_ip).filter(host_id__in=list(host_ids),
                                                                       key__startswith="system.sw.os.get.build")
                val = get_value_from_items(items, q, os, zabbix_db_ip)
            if not val:
                failed.append('{} | {} | no values found for both keys'.format(q.name, q.ip_address))

        except Exception as e:
            logger.error("OS Build Error %s" % e)
            failed.append('{} | {}'.format(q.name, q.ip_address))
    if failed:
        logger.error("OS Build Failed devices name, ip")
        for f in failed:
            logger.error(f)


def agent_os_build_api(qs):
    failed = []
    for q in qs:
        val = None
        if not q.zabbix:
            failed.append("No Zabbix is present for {} - {}".format(q.name, q.ip_address))
            continue
        data = q.zabbix.api.get_current_data("uladmin.OSVersion")
        if data and data[0]['lastvalue']:
            q.os_build_version = data[0]['lastvalue']
            val = data[0]['lastvalue']
            q.save()
        elif not data or not data[0]['lastvalue']:
            data = q.zabbix.api.get_current_data("system.sw.os.get.build")
            if data and data[0]['lastvalue']:
                q.os_build_version = data[0]['lastvalue']
                val = data[0]['lastvalue']
                q.save()
        if not val:
            failed.append('{} | {} | no values found for both keys, api'.format(q.name, q.ip_address))

    if failed:
        logger.error("OS Build Failed devices name, ip")
        full_fail = ''
        for f in failed:
            full_fail += f + '\n'
        logger.error(full_fail)


def os_build_update(uuid):
    from cloud.VmwareAdapter.models import VmwareVmMigration
    from cloud.vmware.utils import get_os_version_wmi_ssh
    from cloud.vmware.models import VMwareVcenter
    from app.inventory.models import BMServer
    vcenter = VMwareVcenter.objects.get(uuid=uuid)
    vm_qs = VmwareVmMigration.objects.filter(vcenter=vcenter)
    agent_qs = vm_qs.filter(connection_type__in=['Agent', 'SNMP'])
    agent_os_build_api(agent_qs)
    windows_qs = vm_qs.filter(os_type__icontains='window')
    for q in windows_qs:
        if q.credentials_m2m.all().exists():
            os_version = get_os_version_wmi_ssh(q)
            if not os_version and q.credentials_m2m.all().count() == 2:
                os_version = get_os_version_wmi_ssh(q, position=1)
            if not os_version:
                continue
            logger.info("OS Build for {} is {}".format(q.name, os_version))
            q.os_build_version = os_version
            q.save()
    org = vcenter.private_cloud.customer
    bms_qs = BMServer.objects.filter(server__customer=org, server__os__platform_type__icontains='window')
    for bm in bms_qs:
        if bm.server.connection_type == 'SNMP':
            snmp_os_build([bm.server])
        elif bm.server.connection_type == 'Agent':
            agent_os_build_api([bm.server])

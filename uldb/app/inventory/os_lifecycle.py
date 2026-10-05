# -*- coding: utf-8 -*-

import re

from datetime import datetime, time

import requests

from django.utils import timezone
from django.utils.dateparse import parse_date


END_OF_LIFE_API_URL = "https://endoflife.date/api/{}.json"


# Optional local overrides. If a record is not found here, the helper falls
# back to endoflife.date using the OperatingSystem full name.
OS_LIFECYCLE_DATES = {
    # Add records by OperatingSystem full name when a product is not available
    # in endoflife.date or when a local override is required:
    # "Ubuntu 22.04": {
    #     "end_of_life": "2027-04-30",
    #     "end_of_support": "2027-04-30",
    #     "end_of_security_support": "2032-04-30",
    #     "end_of_extended_support": "2032-04-30",
    # },
}


OS_LIFECYCLE_FIELDS = (
    "end_of_life",
    "end_of_support",
    "end_of_security_support",
    "end_of_extended_support",
)


OS_PRODUCT_ALIASES = (
    (("ubuntu",), "ubuntu"),
    (("debian",), "debian"),
    (("centos",), "centos"),
    (("red hat", "rhel"), "rhel"),
    (("rocky",), "rocky-linux"),
    (("alma",), "almalinux"),
    (("oracle linux",), "oracle-linux"),
    (("windows server",), "windows-server"),
    (("windows",), "windows"),
    (("esxi", "vmware esxi"), "vmware-esxi"),
    (("macos", "mac os", "big sur", "monterey", "ventura", "sonoma", "sequoia"), "macos"),
)


def operating_system_full_name(operating_system):
    name = (getattr(operating_system, "name", None) or "").strip()
    version = (getattr(operating_system, "version", None) or "").strip()
    if version and version.lower() not in name.lower():
        return "{} {}".format(name, version).strip()
    return name


def _normalize_name(value):
    value = (value or "").strip().lower()
    return re.sub(r"\s+", " ", value)


def get_operating_system_lifecycle(operating_system):
    full_name = operating_system_full_name(operating_system)
    if not full_name:
        return None

    lifecycle = OS_LIFECYCLE_DATES.get(full_name)
    if lifecycle:
        return lifecycle

    normalized_full_name = _normalize_name(full_name)
    for name, lifecycle in OS_LIFECYCLE_DATES.items():
        if _normalize_name(name) == normalized_full_name:
            return lifecycle
    return _get_remote_operating_system_lifecycle(full_name)


def _guess_product_name(full_name):
    normalized = _normalize_name(full_name)
    for aliases, product_name in OS_PRODUCT_ALIASES:
        if any(alias in normalized for alias in aliases):
            return product_name
    return None


def _version_tokens(full_name):
    return re.findall(r"\d+(?:\.\d+)*", full_name or "")


def _cycle_matches(full_name, cycle):
    cycle = str(cycle or "").strip()
    if not cycle:
        return False
    normalized = _normalize_name(full_name)
    if cycle.lower() in normalized:
        return True
    return any(token.startswith(cycle) or cycle.startswith(token) for token in _version_tokens(full_name))


def _remote_date(row, *keys):
    for key in keys:
        value = row.get(key)
        if value and value is not True:
            return value
    return None


def _get_remote_operating_system_lifecycle(full_name):
    product_name = _guess_product_name(full_name)
    if not product_name:
        return None

    try:
        response = requests.get(
            END_OF_LIFE_API_URL.format(product_name),
            timeout=3
        )
        if response.status_code != 200:
            return None
        rows = response.json()
    except Exception:
        return None

    for row in rows:
        if not _cycle_matches(full_name, row.get("cycle")):
            continue
        return {
            "end_of_life": _remote_date(row, "eol"),
            "end_of_support": _remote_date(row, "support", "eol"),
            "end_of_security_support": _remote_date(row, "extendedSupport", "lts", "eol"),
            "end_of_extended_support": _remote_date(row, "extendedSupport", "eol"),
        }
    return None


def _parse_lifecycle_date(value):
    if not value:
        return None
    if isinstance(value, datetime):
        if timezone.is_naive(value):
            return timezone.make_aware(
                value,
                timezone.get_current_timezone()
            )
        return value
    parsed = parse_date(value)
    if not parsed:
        return None
    parsed = datetime.combine(parsed, time.min)
    return timezone.make_aware(
        parsed,
        timezone.get_current_timezone()
    )


def apply_operating_system_lifecycle(operating_system, save=True):
    lifecycle = get_operating_system_lifecycle(operating_system)
    if not lifecycle:
        return False

    changed_fields = []
    for field in OS_LIFECYCLE_FIELDS:
        value = _parse_lifecycle_date(lifecycle.get(field))
        if getattr(operating_system, field) != value:
            setattr(operating_system, field, value)
            changed_fields.append(field)

    if save and changed_fields:
        operating_system.save(
            update_fields=changed_fields
        )
    return bool(changed_fields)

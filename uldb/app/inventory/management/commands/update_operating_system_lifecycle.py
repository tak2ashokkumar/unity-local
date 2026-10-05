# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from app.inventory.models import OperatingSystem
from app.inventory.os_lifecycle import (
    apply_operating_system_lifecycle,
    get_operating_system_lifecycle,
    operating_system_full_name,
)


class Command(BaseCommand):
    help = (
        "Populate OperatingSystem lifecycle fields from full-name lifecycle "
        "metadata."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--name",
            dest="name",
            help="Only process OperatingSystem records matching this name.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            dest="dry_run",
            default=False,
            help="Show matched records without saving lifecycle dates.",
        )

    def handle(self, *args, **options):
        qs = OperatingSystem.objects.all().order_by("name", "version")
        if options.get("name"):
            qs = qs.filter(name__iexact=options["name"])

        total = 0
        matched = 0
        updated = 0

        for operating_system in qs:
            total += 1
            lifecycle = get_operating_system_lifecycle(operating_system)
            if not lifecycle:
                continue

            matched += 1
            full_name = operating_system_full_name(operating_system)
            if options.get("dry_run"):
                self.stdout.write("Matched: {}".format(full_name))
                continue

            if apply_operating_system_lifecycle(operating_system):
                updated += 1
                self.stdout.write("Updated: {}".format(full_name))

        self.stdout.write(
            self.style.SUCCESS(
                "Processed: {0}, matched: {1}, updated: {2}".format(
                    total,
                    matched,
                    updated
                )
            )
        )

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations


def register_bm_storage_schedule(apps, schema_editor):
    from synchronize.models import IntervalSchedule, PeriodicTask
    interval_daily, _ = IntervalSchedule.objects.get_or_create(
        every=1,
        period=IntervalSchedule.DAYS,
    )
    PeriodicTask.objects.get_or_create(
        name='sync_bm_server_storage_daily',
        defaults={
            'interval': interval_daily,
            'task': 'app.inventory.tasks.sync_bm_server_storage',
        }
    )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0162_auto_20260518_0458'),
    ]

    operations = [
        migrations.RunPython(register_bm_storage_schedule, noop),
    ]

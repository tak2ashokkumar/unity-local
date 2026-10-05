# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0163_register_bm_storage_sync_schedule'),
    ]

    operations = [
        migrations.AddField(
            model_name='operatingsystem',
            name='end_of_life',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='operatingsystem',
            name='end_of_support',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='operatingsystem',
            name='end_of_security_support',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='operatingsystem',
            name='end_of_extended_support',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

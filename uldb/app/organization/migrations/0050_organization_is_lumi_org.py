# -*- coding: utf-8 -*-
# Generated for Lumi signup provisioning.
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0049_auto_20260303_0518'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='is_lumi_org',
            field=models.BooleanField(default=False),
        ),
    ]

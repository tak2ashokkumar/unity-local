# -*- coding: utf-8 -*-
# Lumi webhook push (Option A) -- per-org target workspace + shared HMAC secret.
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0052_organizationsettings_is_pro_ai_enabled'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='lumi_workspace_id',
            field=models.CharField(max_length=64, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='lumi_webhook_secret',
            field=models.CharField(max_length=128, null=True, blank=True),
        ),
    ]

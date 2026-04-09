# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0003_organization_monitor_by'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrganizationMonitoringConfig',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('_config', django.contrib.postgres.fields.jsonb.JSONField(default=dict)),
                ('org', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='monitoring_config', to='organization.Organization')),
            ],
        ),
    ]

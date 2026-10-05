# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user2', '0014_auto_20250916_0134'),
        ('organization', '0054_auto_20260916_0546'),
    ]

    operations = [
        migrations.CreateModel(
            name='LumiOrganizationUserRole',
            fields=[
                ('id', models.AutoField(
                    auto_created=True, primary_key=True, serialize=False,
                    verbose_name='ID')),
                ('role', models.CharField(
                    choices=[
                        ('estate_owner', 'Estate Owner'),
                        ('approver', 'Approver'),
                        ('noc_viewer', 'NOC Viewer'),
                        ('engineer', 'Engineer'),
                    ],
                    max_length=32)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('organization', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='lumi_user_roles',
                    to='organization.Organization')),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='lumi_organization_role',
                    to='user2.User')),
            ],
            options={
                'db_table': 'lumi_organization_user_role',
                'unique_together': {('organization', 'user')},
            },
        ),
    ]

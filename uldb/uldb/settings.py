# -*- coding: utf-8 -*-
#
# Complete settings.py for Django 1.11.11 + Python 2.7
#
from __future__ import unicode_literals

import os
import datetime
from django.contrib import messages
from django.core.urlresolvers import reverse_lazy
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# ---------------------------------------------------------------------
# BASE DIR and .env loader (Option B - always load .env)
# ---------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ENV_FILE = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_FILE)  # loads variables into os.environ

# ---------------------------------------------------------------------
# Defaults for referenced-but-missing settings (safe fallbacks)
# ---------------------------------------------------------------------
# These may be overridden by entries in .env
DJANGO_ENV = os.getenv("DJANGO_ENV", "dev").lower()
DEBUG = os.environ.get('DEBUG', 'False').lower() in ('1', 'true', 'yes')
_CI_MODE = os.environ.get('CI_MODE', 'False').lower() in ('1', 'true', 'yes')
DISABLE_EXISTING_LOGGER = os.environ.get('DISABLE_EXISTING_LOGGER', 'False').lower() in ('1', 'true', 'yes')
PIPELINE_ENABLED = os.environ.get('PIPELINE_ENABLED', 'True').lower() in ('1', 'true', 'yes')
PIPELINE_COLLECTOR_ENABLED = os.environ.get('PIPELINE_COLLECTOR_ENABLED', 'False').lower() in ('1', 'true', 'yes')
DEFAULT_LOG_LEVEL = os.environ.get('DEFAULT_LOG_LEVEL', 'DEBUG')
PERF_LOG_LEVEL = os.environ.get('PERF_LOG_LEVEL', 'DEBUG')

# ---------------------------------------------------------------------
# Basic site/login settings
# ---------------------------------------------------------------------
LOGIN_URL = reverse_lazy('two_factor:login')
LOGOUT_URL = "/logout/"
LOGIN_REDIRECT_URL = '/'

HIJACK_LOGIN_REDIRECT_URL = '/main'
HIJACK_LOGOUT_REDIRECT_URL = '/'
HIJACK_AUTHORIZATION_CHECK = 'rest.core.utils.my_authorization_check'
HIJACK_AUTHORIZE_STAFF = True

# ---------------------------------------------------------------------
# Default, Remote Database
# ---------------------------------------------------------------------

DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_DEFAULT_ENGINE', 'django.db.backends.postgresql_psycopg2'),
        'NAME': os.getenv('DB_DEFAULT_NAME', ''),
        'USER': os.getenv('DB_DEFAULT_USER', ''),
        'PASSWORD': os.getenv('DB_DEFAULT_PASSWORD', ''),
        'HOST': os.getenv('DB_DEFAULT_HOST', ''),
        'PORT': os.getenv('DB_DEFAULT_PORT', ''),
    }
}

if DJANGO_ENV == "prod":
    DATABASES[os.getenv('ZABBIX_INSTANCE_NAME', 'zabbix')] = {
        'ENGINE': os.getenv('DB_ZABBIX_ENGINE', 'django.db.backends.mysql'),
        'NAME': os.getenv('DB_ZABBIX_NAME', ''),
        'USER': os.getenv('DB_ZABBIX_USER', ''),
        'PASSWORD': os.getenv('DB_ZABBIX_PASSWORD', ''),
        'HOST': os.getenv('DB_ZABBIX_HOST', ''),
        'PORT': os.getenv('DB_ZABBIX_PORT', '3306'),
    }
    # Remote
    DATABASES['remote'] = {
        'ENGINE': os.getenv('DB_REMOTE_ENGINE', 'django.db.backends.mysql'),
        'NAME': os.getenv('DB_REMOTE_NAME', ''),
        'USER': os.getenv('DB_REMOTE_USER', ''),
        'PASSWORD': os.getenv('DB_REMOTE_PASSWORD', ''),
        'HOST': os.getenv('DB_REMOTE_HOST', ''),
        'PORT': os.getenv('DB_REMOTE_PORT', '3306'),
    }

# ---------------------------------------------------------------------
# Feature toggles + API keys
# ---------------------------------------------------------------------
ENABLE_AI_FEATURES = os.environ.get('ENABLE_AI_FEATURES', 'True').lower() in ('1', 'true', 'yes')
ENABLE_CHATBOT = os.environ.get('ENABLE_CHATBOT', 'True').lower() in ('1', 'true', 'yes')
ENABLE_INSIGHTS = os.environ.get('ENABLE_INSIGHTS', 'False').lower() in ('1', 'true', 'yes')
ENABLE_RCA = os.environ.get('ENABLE_RCA', 'False').lower() in ('1', 'true', 'yes')

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
LLAMA_API_KEY = os.environ.get('LLAMA_API_KEY')
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')

AI_AGENT_BASE = "http://ai.unitedlayer.dev:8000/ai-engine/"

# ---------------------------------------------------------------------
# Installed apps (kept from your original)
# ---------------------------------------------------------------------
INSTALLED_APPS = (

    'django_nose',
    # Django
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    # 'django.contrib.admindocs',

    # enhanced templating
    'crispy_forms',
    'bootstrapform',
    'bootstrap3',
    'pipeline',


    # need this before every other applications for signals
    'orchestration.apps.OrchestrationConfig',
    'orchestration.agentic_workflow.apps.AgenticWorkflowConfig',
    'orchestration.execution',
    # core app
    'app.common',
    'app.datacenter',
    'app.inventory',
    'app.server',
    'app.organization',
    'app.user2',
    'app.rbac',
    'app.group',
    'app.session',
    'app.Utils',
    'app.ip',
    'app.vlan',
    'app.customer_onboarding',

    # rest
    'rest.customer',
    'rest.core',

    # cloud
    'cloud',
    'cloud.AWSAdapter',
    'cloud.OpenstackAdapter',
    'cloud.VmwareAdapter',
    'cloud.MegaportAdapter',
    'cloud.CloudService',
    'cloud.Nutanix',
    'cloud.openstack_app',
    'cloud.proxmox',
    'cloud.hyperv',
    'cloud.AzureAdapter',
    'cloud.vmware',
    'cloud.vcloud',
    'cloud.gcp',
    'cloud.kubernetes',
    'cloud.docker',
    'cloud.ULS3',
    'cloud.oci_cloud',

    # integ
    'integ.salesforce',
    'integ.monitoring',
    'integ.NDOReader',
    'integ.CeleryMonitor',
    'integ.schedule',
    'integ.networking',
    'integ.billing',
    'integ.proxy',
    'integ.tenable',
    'integ.ticketing',
    'integ.terraform',
    'integ.ObserviumBackend',
    'integ.zabbix',
    'integ.UptimeRobot',
    'integ.devops_engine',
    'integ.devops_controllers',
    'integ.ldap_user',
    'integ.ServiceNow',
    'integ.openaudit',
    'integ.DynamicsCrm',
    'integ.Mtp_DynamicsCrm',
    'integ.maintenance',
    'integ.jira',
    'integ.azure_ad',
    'integ.netapp.ontap',
    'integ.nagiosdataingress',
    'integ.BmcHelix',
    'integ.EmailIntegration',
    'integ.ServiceDeskPlus',
    'integ.workflow',
    'integ.purestorage',
    'integ.CiscoMeraki',
    'integ.veeam',
    'integ.sdwan',
    'integ.cyberark',

    # cost module
    'app.cost_calculator',
    'cloud.cloudbilling',
    'app.dc_cost',
    'private_cloud_cost.private_cost_plan',
    'private_cloud_cost.resources',

    # two factor
    'django_otp',
    'django_otp.plugins.otp_static',
    'django_otp.plugins.otp_totp',
    'two_factor',

    #celery
    'django_celery_beat',

    # audit log
    'libraries.auditlog',

    # Release
    'release',
    'django_filters',
    'import_export',

    # agent
    'agent',

    # Auto Discovery
    'discovery',

    # Reporting
    'reporting',
    'watch',
    'sustainability',
    'synchronize',
    'inbound',
    'budget',
    'monitoringtools',
    'monitoringtools.custommonitor',
    'monitoringtools.nagiosmonitor',
    'monitoringtools.solarwindsmonitor',
    'monitoringtools.zabbixmonitor',
    'monitoringtools.opsrampmonitor',
    'monitoringtools.logicmonitor',
    'monitoringtools.dynatracemonitor',
    'monitoringtools.splunkmonitor',
    'monitoringtools.appdynamicsmonitor',
    'monitoringtools.newrelicmonitor',
    'webpack_loader',
    'channels',
    'unity_discovery',
    'aiops',
    'taggit',
    'django_extensions',
    'chunked_upload',
    'singlesteprecovery',
    # 'orchestration.agentic_workflow',
    'mtp',

    # some stopgap shims
    'hijack',
    'compat',
    # rest framework
    'rest_framework',
    'rest_framework.authtoken',
    # 'corsheaders',

    'custom_widget',
    'service_catalog',

    'topology', # for root cause analysis
    'llm',
    'chatbot',

    "policy",
    'apm', # apm
    'utils',
    'finops',
    'integ.redfish',
    'openlit',  # GPU, LLM and Vector DB Monitoring,
    'unity_itsm',
    'network_agent',
    'orchestration.sourcetask',
    'mcp',
)

# ---------------------------------------------------------------------
# Apps with tasks (kept from original)
# ---------------------------------------------------------------------
APPS_WITH_TASKS = [
    'agent.tasks',
    'aiops.models.correlation',
    'aiops.tasks',
    'app.customer_onboarding.tasks',
    'app.datacenter.tasks',
    'app.inventory.tasks',
    'cloud.AWSAdapter.tasks',
    'cloud.AzureAdapter.tasks',
    'cloud.CloudService.tasks',
    'cloud.Nutanix.tasks',
    'cloud.ULS3.tasks',
    'cloud.VmwareAdapter.tasks',
    'cloud.cloudbilling.tasks',
    'cloud.docker.tasks',
    'cloud.gcp.tasks',
    'cloud.hyperv.tasks',
    'cloud.kubernetes.tasks',
    'cloud.oci_cloud.tasks',
    'cloud.openstack_app.tasks',
    'cloud.proxmox.tasks',
    'cloud.vcloud.tasks',
    'cloud.vmware.tasks',
    'custom_widget.tasks',
    'finops.tasks',
    'integ.BmcHelix.tasks',
    'integ.CiscoMeraki.tasks',
    'integ.ObserviumBackend.tasks',
    'integ.schedule.tasks',
    'integ.sdwan.tasks',
    'integ.ServiceDeskPlus.tasks',
    'integ.ServiceNow.tasks',
    'integ.devops_engine.tasks',
    'integ.ldap_user.tasks',
    'integ.monitoring.tasks',
    'integ.maintenance.tasks',
    'integ.netapp.ontap.tasks',
    'integ.purestorage.tasks',
    'integ.tenable.tasks',
    'integ.terraform.tasks',
    'integ.ticketing.tasks',
    'integ.zabbix.tasks',
    'integ.redfish.tasks',
    'integ.veeam.tasks',
    'orchestration.tasks',
    'orchestration.terraform_task',
    'orchestration.agentic_workflow.tasks',
    'private_cloud_cost.resources.tasks',
    'reporting.tasks',
    'rest.core.tasks',
    'rest.customer.tasks',
    'unity_discovery.tasks',
    'watch.tasks',
    'policy.tasks',
    'llm.tasks',
    'apm.tasks'
]
# ------------------------------------------------
# For registering apps to Auditlog pls update here
# -------------------------------------------------
AUDIT_LOG_REGISTERED_APPS = [
    'core',
    'common',
    'customer_onboarding',
    'datacenter',
    'inventory',
    'server',
    'organization',
    'user2',
    'rbac',
    'group',
    'ip',
    'vlan',
    'AWSAdapter',
    'OpenstackAdapter',
    'VmwareAdapter',
    'MegaportAdapter',
    'CloudService',
    'openstack_app',
    'oci_cloud',
    'AzureAdapter',
    'vmware',
    'monitoring',
    'NDOReader',
    'CeleryMonitor',
    'schedule',
    'maintenance',
    'networking',
    'billing',
    'proxy',
    'tenable',
    'ticketing',
    'terraform',
    'vcloud',
    'devops_controllers',
    'gcp',
    'kubernetes',
    'ULS3',
    'docker',
    'dc_cost',
    'ServiceNow',
    'DynamicsCrm',
    'reporting',
    'unity_discovery',
    'agent',
    'zabbix',
    'sustainability',
    'mtp',
    'jira',
    'Mtp_DynamicsCrm',
    'BmcHelix',
    'ServiceDeskPlus',
    'custom_widget',
    'private_cost_plan',
    'resources',
    'custommonitor',
    'orchestration',
    'CiscoMeraki',
    'sdwan',
    'veeam',
    'EmailIntegration',
    'apm',
]

# ---------------------------------------------------------------------
# Webpack loader (kept)
# ---------------------------------------------------------------------
WEBPACK_LOADER = {
    'DEFAULT': {
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.json'),
    },
    'MTP': {
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats-mtp.json'),
    }
}

# ---------------------------------------------------------------------
# Misc defaults and SITE_ROOT (from env)
# ---------------------------------------------------------------------
RELEASE_VERSION = 'v3.5.0'
RELEASE_DATE = '2017-04-10T13:37'
SITE_ROOT = os.environ.get('SITE_ROOT', BASE_DIR)

HIJACK_USE_BOOTSTRAP = True

ADMIN_MEDIA_PREFIX = os.environ.get('ADMIN_MEDIA_PREFIX', 'static/admin/')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

TIME_ZONE = os.environ.get('TIME_ZONE', 'America/Los_Angeles')
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = True
USE_L10N = True
USE_TZ = True

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

STATIC_URL = '/static/'
STATIC_ROOT = os.environ.get('STATIC_ROOT', 'public')

DEFAULT_PASSWORD_EXPIRY = int(os.environ.get('DEFAULT_PASSWORD_EXPIRY', 180))  # in days

SECRET_KEY = os.environ.get('SECRET_KEY', 'replace-me')

# ---------------------------------------------------------------------
# MIDDLEWARE_CLASSES (Django 1.11)
# ---------------------------------------------------------------------
MIDDLEWARE_CLASSES = (
    'django.middleware.gzip.GZipMiddleware',
    #    'django.middleware.cache.UpdateCacheMiddleware',
    # 'uldb.middleware.ProfilinkMiddleware',
    'django.middleware.common.CommonMiddleware',
    #    'django.contrib.sessions.middleware.SessionMiddleware',
    'app.session.middleware.ULSessionMiddleware',
    'app.user2.middleware.ULAuthenticationMiddleware',
    'mtp.ChangeUserMiddleware.ChangeUserMiddleware',
    'app.user2.middleware.ProxyCookieMiddleware',
    #    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django_otp.middleware.OTPMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'app.user2.middleware.ULAutoLogout',
    # 'django.middleware.cache.FetchFromCacheMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'libraries.auditlog.middleware.AuditlogMiddleware',
)

MESSAGE_TAGS = {
    messages.ERROR: 'danger'
}

AUTO_LOGOUT_DELAY = int(os.environ.get('AUTO_LOGOUT_DELAY', 6000))  # Auto logout after 10 mins - middleware.ULAutoLogout
SESSION_EXPIRE_AT_BROWSER_CLOSE = os.environ.get('SESSION_EXPIRE_AT_BROWSER_CLOSE', 'True').lower() in ('1', 'true', 'yes')

# ---------------------------------------------------------------------
# AUTHENTICATION BACKENDS
# ---------------------------------------------------------------------
AUTHENTICATION_BACKENDS = (
    'app.user2.backends.ULAuthenticationBackend',
    'integ.azure_ad.backends.AzureActiveDirectoryBackend',
    'integ.ldap_user.backends.UnityLDAPBackend'
)

AZURE_AD_ORG = os.environ.get('AZURE_AD_ORG', '').split(',') if os.environ.get('AZURE_AD_ORG') else []

AZUREAD_AUTH = {
    'AUTHORITY': os.environ.get('AZUREAD_AUTHORITY', 'https://login.microsoftonline.com/common'),
    'REDIRECT_URI': os.environ.get('AZUREAD_REDIRECT_URI', ''),
    'CLIENT_ID': os.environ.get('AZUREAD_CLIENT_ID', ''),
    'TENANT_ID': os.environ.get('AZUREAD_TENANT_ID', ''),
    'CLIENT_SECRET': os.environ.get('AZUREAD_CLIENT_SECRET', '')
}

AUTH_USER_MODEL = os.environ.get('AUTH_USER_MODEL', 'user2.User')
ADMIN_ORGANIZATION = os.environ.get('ADMIN_ORG', 'UnitedLayer')
ADMIN_GROUP_NAME = os.environ.get('ADMIN_GROUP_NAME', 'admin')

PLAYGROUND_ORGANIZATION = os.environ.get('PLAYGROUND_ORG', 'Playground')

ROOT_URLCONF = 'uldb.urls'
WSGI_APPLICATION = 'uldb.wsgi.application'

SESSION_ENGINE = os.environ.get('SESSION_ENGINE', 'app.session.backends.db')
SESSION_SERIALIZER = os.environ.get('SESSION_SERIALIZER', 'django.contrib.sessions.serializers.PickleSerializer')

# ---------------------------------------------------------------------
# Logging directories (ensure exist)
# ---------------------------------------------------------------------
LOG_FILENAME = os.environ.get('LOG_FILENAME', 'uldb.log')
CELERY_RESOURCE_LOG_FILENAME = os.environ.get('CELERY_RESOURCE_LOG_FILENAME', 'celery_profiler.log')
PROXY_COOKIE_PATH = os.environ.get('APP_SERVER_PROXY_COOKIE_PATH', '/etc/nginx/cookies/')
LOG_DIR = os.environ.get('APP_SERVER_LOG_DIR', '/var/log/uldb/')
CELERY_RESOURCE_LOG_PATH = os.environ.get('APP_SERVER_CELERY_PROFILER_PATH', '/var/log/celery/')

for logdir in [PROXY_COOKIE_PATH, CELERY_RESOURCE_LOG_PATH, LOG_DIR]:
    try:
        if not os.path.exists(logdir):
            os.makedirs(logdir)
    except Exception:
        # fallback - if cannot create, keep SITE_ROOT
        logdir = SITE_ROOT

PASSWORD_CHARACTER_SET = os.environ.get('PASSWORD_CHARACTER_SET', 'abcdefghijklmopABCDEFGHIJ123456890')
DEFAULT_PASSWORD_LENGTH = int(os.environ.get('DEFAULT_PASSWORD_LENGTH', 10))

# ---------------------------------------------------------------------
# REST_FRAMEWORK
# ---------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest.core.pagination.CustomPageNumberPagination',
    'PAGE_SIZE': int(os.environ.get('REST_PAGE_SIZE', 10)),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'EXCEPTION_HANDLER': 'rest.core.exceptions.custom_exception_handler',
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ) + (
        ('rest_framework.renderers.BrowsableAPIRenderer',) if DEBUG else ()
    ),
}

REST_FRAMEWORK_TOKEN_EXPIRE_HOURS = int(os.environ.get('REST_FRAMEWORK_TOKEN_EXPIRE_HOURS', 24))

PROXY_COOKIE_DOMAIN = os.environ.get('PROXY_COOKIE_DOMAIN', ".unitedlayer.com")

# ---------------------------------------------------------------------
# Devops & Observium placeholders
# ---------------------------------------------------------------------
DEVOPS_CONFIG = {
    'DEVOPS_MACHINE_IP': os.environ.get('DEVOPS_MACHINE_IP', ''),
    'SSH_USER': os.environ.get('DEVOPS_SSH_USER', ''),
    'SSH_PORT': os.environ.get('DEVOPS_SSH_PORT', ''),
    'PRIVATE_KEY_FILE': os.environ.get('DEVOPS_PRIVATE_KEY_FILE', ''),
    'VARIABLE_FILE_NAME': os.environ.get('DEVOPS_VARIABLE_FILE_NAME', '')
}

OBSERVIUM_CONFIG = {
    'DB_HOST': os.environ.get('OBSERVIUM_DB_HOST', ''),
    'DB_PORT': os.environ.get('OBSERVIUM_DB_PORT', ''),
    'DB_USER': os.environ.get('OBSERVIUM_DB_USER', ''),
    'DB_PASS': os.environ.get('OBSERVIUM_DB_PASS', ''),
    'DB_NAME': os.environ.get('OBSERVIUM_DB_NAME', ''),
    'RRD_HOST': os.environ.get('OBSERVIUM_RRD_HOST', ''),
    'ANSIBLE_CONNECTION': os.environ.get('OBSERVIUM_ANSIBLE_CONNECTION', 'ssh'),
    'OBSERVIUM_DIRECTORY': os.environ.get('OBSERVIUM_DIRECTORY', '/opt/observium'),
}

# Demo/Free Trial Settings
BLACK_LIST_EMAIL_DOMAINS = tuple(os.environ.get('BLACK_LIST_EMAIL_DOMAINS', 'gmail,yahoo').split(','))
BLACK_LIST_EMAIL_COMPETITORS = tuple(os.environ.get('BLACK_LIST_EMAIL_COMPETITORS', 'rackspace').split(','))
DEMO_ACCOUNT_VALIDITY = int(os.environ.get('DEMO_ACCOUNT_VALIDITY', 7))
TRIAL_ACCOUNT_VALIDITY = int(os.environ.get('TRIAL_ACCOUNT_VALIDITY', 30))
SALES_EMAIL = os.environ.get('SALES_EMAIL', "")
LEGAL_EMAIL = os.environ.get('LEGAL_EMAIL', "")
SUPPORT_EMAIL = os.environ.get('SUPPORT_EMAIL', "")
GA_TRACKING_ID = os.environ.get('GA_TRACKING_ID', '')
WEBSOCKET_FAIL_SEND_EMAIL = os.environ.get('WEBSOCKET_FAIL_SEND_EMAIL', 'False').lower() in ('1','true','yes')

OBSERVIUM_HOST_URL = os.environ.get('OBSERVIUM_HOST_URL', '')

ANSIBLE_OPTS = dict(
    listtags=False,
    listtasks=False,
    listhosts=False,
    syntax=False,
    connection=os.environ.get('ANSIBLE_CONNECTION', 'local'),
    module_path=None,
    forks=int(os.environ.get('ANSIBLE_FORKS', 100)),
    remote_user=os.environ.get('ANSIBLE_REMOTE_USER', 'robert'),
    private_key_file=os.environ.get('ANSIBLE_PRIVATE_KEY_FILE', None),
    ssh_common_args=None,
    ssh_extra_args=None,
    sftp_extra_args=None,
    scp_extra_args=None,
    become=True,
    become_method='sudo',
    become_user='root',
    verbosity=int(os.environ.get('ANSIBLE_VERBOSITY', 3)),
    check=False,
    remote_tmp=os.environ.get('ANSIBLE_REMOTE_TMP', '/tmp'),
    local_tmp=os.environ.get('ANSIBLE_LOCAL_TMP', '/tmp'),
    retry_files_enabled=False,
    nuke=True,
    start_at_task=None
)

TAGGIT_CASE_INSENSITIVE = True
ZABBIX_AGENT_PATH = os.environ.get('ZABBIX_AGENT_PATH', "")
VMWARE_COLLECTOR_AGENT_PATH = os.environ.get('VMWARE_COLLECTOR_AGENT_PATH', "")
VMWARE_STARK_COLLECTOR_AGENT_PATH = os.environ.get('VMWARE_STARK_COLLECTOR_AGENT_PATH', "")
VMWARE_COLLECTOR_AGENT_PATH_V2 = os.environ.get('VMWARE_COLLECTOR_AGENT_PATH_V2', "")
HYPERV_COLLECTOR_AGENT_PATH = os.environ.get('HYPERV_COLLECTOR_AGENT_PATH', "")

# TODO check this
ALL_DATABASES = DATABASES
ALL_DATABASES = {} 

MTP_COMM_EMAIL_ADDRESS = os.environ.get('MTP_COMM_EMAIL_ADDRESS', None)
MTP_COMM_EMAIL_PASSWORD = os.environ.get('MTP_COMM_EMAIL_PASSWORD', None)

# the below
# the below
MTP_URL_DICT={
        'default':'https://unity.unitedlayer.com',
        'ams':'https://unity-ams.unitedlayer.com'
        }

DEFAULT_REGION_VALUE = int(os.environ.get('DEFAULT_REGION_VALUE', 22))
CELERY_CREATE_MISSING_QUEUES = os.environ.get('CELERY_CREATE_MISSING_QUEUES', 'True').lower() in ('1','true','yes')
CELERY_QUEUE_SEPARATED = os.environ.get('CELERY_QUEUE_SEPARATED', 'False').lower() in ('1','true','yes')

VCENTER_PROXY_GATEWAY = os.environ.get('VCENTER_PROXY_GATEWAY', 'True').lower() in ('1','true','yes')
VEEAM_PROXY_GATEWAY = os.environ.get('VEEAM_PROXY_GATEWAY', 'True').lower() in ('1','true','yes')
MERAKI_PROXY_GATEWAY = os.environ.get('MERAKI_PROXY_GATEWAY', 'True').lower() in ('1','true','yes')
VIPTELA_PROXY_GATEWAY = os.environ.get('VIPTELA_PROXY_GATEWAY', 'True').lower() in ('1','true','yes')

NETWORK_AGENT_IP = os.environ.get('NETWORK_AGENT_IP', None)
NETWORK_AGENT_API = os.environ.get('NETWORK_AGENT_API', None)

# ---------------------------------------------------------------------
# RAG / SERVICE / AI placeholders
# ---------------------------------------------------------------------
RAG_SERVER_URL = os.environ.get('RAG_SERVER_URL', None)
SERVICE_TOKEN = os.environ.get('SERVICE_TOKEN', None)
RAG_ENV = os.environ.get('RAG_ENV', None)
RAG_CELERY_TIME = os.environ.get('RAG_CELERY_TIME', None)
RAG_SERVER_URL_CHAT = os.environ.get('RAG_SERVER_URL_CHAT', None)
RAG_SERVER_URL_UPLOAD = os.environ.get('RAG_SERVER_URL_UPLOAD', None)

# ---------------------------------------------------------------------
# Remove old imports of default/local settings - we now rely on .env
# (Do not import .default_settings or .local_settings)
# ---------------------------------------------------------------------

# ---------------------------------------------------------------------
# TEMPLATES (redeclare to ensure consistent SITE_ROOT usage)
# ---------------------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'APP_DIRS': False,
        'DIRS': [
            os.path.join(SITE_ROOT, 'app', 'templates'),
        ],
        'OPTIONS': {
            'loaders': [
                ('django.template.loaders.cached.Loader', [
                    'django.template.loaders.filesystem.Loader',
                    'django.template.loaders.app_directories.Loader',
                ]),
            ],
            'context_processors': [
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.request',
            ],
            'libraries': {
                'uldb_filters': 'uldb.templatetags.uldb_filters',
            },
            'debug': DEBUG,
        },

    },
]

# ---------------------------------------------------------------------
# Static files/finders
# ---------------------------------------------------------------------
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

STATICFILES_STORAGE = 'pipeline.storage.PipelineStorage'

STATICFILES_DIRS = (
    os.path.join(SITE_ROOT, 'static'),
    os.path.join(SITE_ROOT, 'ngx-unity'),
)

# ---------------------------------------------------------------------
# PIPELINE (keep original keys but read booleans from env)
# ---------------------------------------------------------------------
PIPELINE = {
    'PIPELINE_ENABLED': PIPELINE_ENABLED,
    'PIPELINE_COLLECTOR_ENABLED': PIPELINE_COLLECTOR_ENABLED,
    # compressors - you can override via env if needed
    'CSS_COMPRESSOR': os.environ.get('CSS_COMPRESSOR', 'pipeline.compressors.yuglify.YuglifyCompressor'),
    'JS_COMPRESSOR': os.environ.get('JS_COMPRESSOR', 'pipeline.compressors.uglifyjs.UglifyJSCompressor'),
    'UGLIFYJS_ARGUMENTS': os.environ.get('UGLIFYJS_ARGUMENTS', '--compress drop_console=true  --mangle'),
    'STYLESHEETS': {
        'styles': {
            'source_filenames': (
                'fonts/Roboto/css/fonts.css',
                'css/bootstrap1.min.css',
                'css/bootstrap-newapp2.min.css',
                'bower_components/nvd3/build/nv.d3.min.css',
                'bower_components/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
                'bower_components/metisMenu/dist/metisMenu.min.css',
                'bower_components/font-awesome/css/font-awesome.min.css',
                'css/main-layout.css',
                'css/v3/uladmin.css',
                'css/admintemplate.css',
                'bower_components/ng-tags-input/ng-tags-input.bootstrap.min.css',
                'bower_components/ng-tags-input/ng-tags-input.min.css',
                'hijack/hijack-styles.css',
                'WebMKS_SDK_2.1.0/css/wmks-all.css',
            ),
            'output_filename': 'compress/base.css',
        }
    },
    'JAVASCRIPT': {
        'angular': {
            'source_filenames': (
                'bower_components/angular-animate/angular-animate.js',
                'bower_components/angular-aria/angular-aria.js',
                'bower_components/angular-messages/angular-messages.js',
                'bower_components/angular-material/angular-material.js',
            ),
            'output_filename': 'compress/angular.js',
        },
        'base-app': {
            'source_filenames': (
                'lib/prototype.js',
                'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
                'bower_components/angular-strap/dist/angular-strap.min.js',
                'bower_components/vis/dist/vis.min.js',
                'bower_components/angular-visjs/angular-vis.js',
                'bower_components/ng-tags-input/ng-tags-input.min.js',
            ),
            'output_filename': 'compress/base-app.js',
        },
        'vendor': {
            'source_filenames': (

                'bower_components/bootstrap/dist/js/bootstrap.min.js',
                'bower_components/startbootstrap-sb-admin-2/dist/js/sb-admin-2.js',
                'bower_components/metisMenu/dist/metisMenu.js',
                'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'bower_components/angular-route/angular-route.min.js',
                'bower_components/angular-resource/angular-resource.min.js',
                'bower_components/d3/d3.min.js',
                'bower_components/nvd3/build/nv.d3.min.js',
                'bower_components/angular-nvd3/dist/angular-nvd3.min.js',
                'bower_components/ng-droplet/dist/ng-droplet.js',
                'bower_components/momenuldb_logt/min/moment.min.js',
                'bower_components/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
                'bower_components/angular-date-time-input/src/dateTimeInput.js',
                'bower_components/lodash/lodash.js',
                'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
                # 'bower_components/angular-google-maps/dist/angular-google-maps.min.js',
                'bower_components/angular-ui-keypress/keypress.min.js',
                'bower_components/ng-file-upload/ng-file-upload-shim.min.js',
                'bower_components/ng-file-upload/ng-file-upload.min.js',
                'bower_components/angular-floatThead-master/angular-floatThead.js',
                'bower_components/jquery.floatThead/dist/jquery.floatThead.min.js',
                'bower_components/angular-charts/chart.js',
                'bower_components/angular-charts/angular-chart.js',
                'bower_components/jsPDF-master/dist/jspdf.min.js',
                'bower_components/jsPDF-AutoTable-master/dist/jspdf.plugin.autotable.js',
                'bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',

                # added from header
                'bower_components/lodash/dist/lodash.js',
                'bower_components/angular-bootstrap-multiselect/dist/angular-bootstrap-multiselect.js',
                'bower_components/moment/moment.js',
                'bower_components/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
                'bower_components/angularjs-dropdown-multiselect/src/angularjs-dropdown-multiselect.js',
                'bower_components/ng-file-upload/ng-file-upload.js',
                #'WebMKS_SDK_2.1.0/wmks.min.js',
            ),
            'output_filename': 'compress/vendor.js',
        },
        'unity-app': {
            'source_filenames': (
                'rest/app/api/*',
                'rest/app/adminApp.js',
                'rest/app/filters.js',
                'rest/app/directives.js',
                'rest/app/controllers/*.js',
                'rest/app/services/*.js',
            ),
            'output_filename': 'compress/unity-app.js',
        },
        'v3': {
            'source_filenames': (
                'rest/app/controllers/v3/*.js',
                'rest/app/controllers/v3/openstack/*.js',
                'rest/app/controllers/v3/aws/*.js',
                'rest/app/controllers/v3/azure/*.js',
                'rest/app/controllers/v3/vmware/*.js',
                'rest/app/controllers/v3/ul-admin/*.js',
                'rest/app/controllers/v3/schedules/*.js',
                'rest/app/controllers/v3/networking/*.js',

                'rest/app/directives/*.js',
                'rest/app/services/v3/*.js',
                'rest/app/services/v3/aws/*.js',
                'rest/app/services/v3/azure/*.js',
                'rest/app/services/v3/openstack/*.js',
                'rest/app/filters/v3/*.js',

                'rest/app/services/v3/vmware/*.js',
                'rest/app/services/v3/ul-admin/*.js',
                'rest/app/services/v3/schedules/*.js',
                'rest/app/services/v3/networking/*.js',
                'rest/app/constants/v3/*.js',

            ),
            'output_filename': 'compress/v3.js',
        },
        'unity-app-customer': {
            'source_filenames': (
                'rest/app/client/constants/client_paths.js',
                'rest/app/filters.js',
                'rest/app/client/services/customer-api.js',
                'rest/app/services/DjangoService.js',
                'rest/app/services/HostMonitorService.js',
                'rest/app/services/task.js',
                'rest/app/services/GraphingService.js',
                'rest/app/services/abstract.js',
                'rest/app/services/BillingService.js',
                'rest/app/services/nagios-service.js',
                'rest/app/client/services/MaintenanceService.js',
                'rest/app/client/services/customer-uldb-service.js',
                'rest/app/client/services/customer-uldb-utils.js',
                'rest/app/client/services/customer-abstract.js',
                'rest/app/client/services/clientdashboardservice.js',
                'rest/app/client/services/DataFormattingService.js',
                'rest/app/client/services/azure/AzureService.js',
                'rest/app/client/services/gcp/GCPService.js',

                'rest/app/client/controllers/generic.js',
                'rest/app/client/controllers/cloud-customer.js',
                'rest/app/client/controllers/generic-detail.js',
                'rest/app/client/controllers/monitoring.js',
                'rest/app/client/controllers/clientdashboardcontroller.js',
                'rest/app/client/controllers/clientdatacentercontroller.js',
                'rest/app/client/controllers/clientcloudcontroller.js',
                'rest/app/client/controllers/clientalertcontroller.js',
                'rest/app/client/controllers/devices_mgmt.js',
                'rest/app/client/controllers/customerinventoryonboard.js',

                'rest/app/client/controllers/azure/azurecontroller.js',
                'rest/app/client/controllers/azure/azuredashboardcontroller.js',
                'rest/app/client/controllers/azure/azureresourcegroupcontroller.js',

                'rest/app/client/controllers/gcp/gcpdashboardcontroller.js',
                'rest/app/client/controllers/gcp/gcpinventory.js',
                'rest/app/client/controllers/gcp/gcpvirtualmachines.js',
                'rest/app/client/controllers/gcp/gcpsnapshots.js',

                'rest/app/client/controllers/observium/pdu/pdumenu.js',
                'rest/app/client/controllers/observium/firewall/firewallmenu.js',
                'rest/app/client/controllers/observium/aws/awsmenu.js',
                'rest/app/client/controllers/observium/switch/switchmenu.js',
                'rest/app/client/controllers/observium/hypervisor/hypervisormenu.js',
                'rest/app/client/controllers/observium/hypervisor/pc_hypervisor_menu.js',
                'rest/app/client/controllers/observium/loadbalancer/load_balancermenu.js',
                'rest/app/client/controllers/observium/virtual_machines/openstack/openstackmenu.js',
                'rest/app/client/controllers/observium/virtual_machines/vmware/vmwaremenu.js',
                'rest/app/client/controllers/observium/virtual_machines/vcloud/vcloudmenu.js',
                'rest/app/client/controllers/observium/virtual_machines/vmmenu.js',
                'rest/app/client/controllers/observium/portdetails.js',

                'rest/app/client/controllers/ipmi/bare_metal/bare_metal_ipmi_menu.js',

                'rest/app/client/controllers/ticket.js',
                'rest/app/client/controllers/dashboard.js',
                'rest/app/client/controllers/billing.js',
                'rest/app/client/controllers/customerproxycontroller.js',
                'rest/app/client/controllers/customerdetailproxycontroller.js',
                'rest/app/client/controllers/clientzendeskticketcontroller.js',
                'rest/app/client/controllers/clientmaintenancecontroller.js',
                'rest/app/client/controllers/clientusercontroller.js',
                'rest/app/client/controllers/clientunitedconnectcontroller.js',
                'rest/app/client/controllers/colo-cloud-controller.js',
                'rest/app/client/controllers/cost-calculator.js',
                'rest/app/client/controllers/customerdevopsmgmt.js',
                # 'rest/app/directives.js',
                'rest/app/client/directives/generic.js',
                'rest/app/client/controllers/aws/clientawsattachautoscalingcontroller.js',
                'rest/app/client/controllers/aws/clientawscontroller.js',
                'rest/app/client/controllers/aws/clientawsimagecontroller.js',
                'rest/app/client/controllers/aws/clientawsusercontroller.js',
                'rest/app/client/controllers/aws/clientawsattachinterfacecontroller.js',
                'rest/app/client/controllers/aws/clientawsdashboardcontroller.js',
                'rest/app/client/controllers/aws/clientawssnapshotcontroller.js',
                'rest/app/client/controllers/clientdeploymentenginecontroller.js',

                'rest/app/client/services/aws/CustomerAwsService.js',
            ),
            'output_filename': 'compress/unity-app-customer.js'
        }
    }
}

# ---------------------------------------------------------------------
# LOGGING - mirror original but use env defaults
# ---------------------------------------------------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': DISABLE_EXISTING_LOGGER,

    'formatters': {
        'standard': {
            'format': '%(asctime)s %(levelname)s [%(module)s::%(funcName)s] %(message)s',
        },
        'awesome': {
            '()': 'colorlog.ColoredFormatter',
            'format': '%(log_color)s[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s',
            'datefmt': '%d/%b/%Y %H:%M:%S',
            'log_colors': {
                'DEBUG': 'purple',
                'INFO': 'cyan',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'bold_red',
            },
        },
        'perf_awesome': {
            '()': 'colorlog.ColoredFormatter',
            'format': '%(log_color)s[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s',
            'datefmt': '%d/%b/%Y %H:%M:%S',
            'log_colors': {
                'DEBUG': 'white',
                'INFO': 'white',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'bold_red',
            },
        },
    },

    'handlers': {
        'uldb_loghandler': {
            'level': DEFAULT_LOG_LEVEL,
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'awesome',
            'filename': os.path.join(LOG_DIR, LOG_FILENAME),
            'maxBytes': 128 * 1024 * 1024,
            'backupCount': 5,
        },
        'perf_handler': {
            'level': PERF_LOG_LEVEL,
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'perf_awesome',
            'filename': os.path.join(LOG_DIR, 'perf.log'),
            'maxBytes': 128 * 1024 * 1024,
            'backupCount': 5,
        },
        'celery_profile_handler': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(CELERY_RESOURCE_LOG_PATH, CELERY_RESOURCE_LOG_FILENAME),
            'maxBytes': 128 * 1024 * 1024,
            'backupCount': 5,
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'awesome',
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'perf_log': {
            'handlers': ['perf_handler'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'celery_profile': {
            'handlers': ['celery_profile_handler'],
            'level': 'INFO',
            'propagate': True,
        },
        'celery': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
            },
        'celery.task': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
            },
        'celery.worker': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
            },
    }
}

# Centralize core app loggers
for app_name in ['app', 'agent', 'hubservice', 'cloud', 'integ', 'rest', 'uldb']:
    LOGGING['loggers'][app_name] = {
        'handlers': ['uldb_loghandler'],
        'level': 'DEBUG',
        'propagate': True,
    }

if not DISABLE_EXISTING_LOGGER:
    for logger in LOGGING['loggers']:
        LOGGING['loggers'][logger]['handlers'] = ['console']

# ---------------------------------------------------------------------
# Other legacy settings retained from your original file
# ---------------------------------------------------------------------
CABINET_VISIBLE_TO_CUSTOMER = ('COLO DEDICATED', 'COLO SHARED')
UPTIME_ROBOT_API_KEY = os.environ.get('UPTIME_ROBOT_API_KEY', '')

REMOTE_DATA_TIMEOUT_MINUTES = int(os.environ.get('REMOTE_DATA_TIMEOUT_MINUTES', 10))

PROXY_ROOT = os.path.join(SITE_ROOT, 'integ', 'proxy', 'ansible_files')

SSH_KEX_ALGORITHMS = (
    'diffie-hellman-group1-sha1',
    'diffie-hellman-group14-sha1',
    'diffie-hellman-group14-sha256',
    'diffie-hellman-group16-sha512',
    'diffie-hellman-group18-sha512',
    'diffie-hellman-group-exchange-sha1',
    'diffie-hellman-group-exchange-sha256',
)

AGREEMENT_MAIL_MESSAGE = """Dear Customer,
 Thank you for accepting End User License Agreement while logging into UnityOne.ai.
 Please find a copy of it attached with this mail. Thank you, Team UnityOne.ai."""
AGREEMENT_MAIL_DOC = "uldb/unity_eula_agreement.pdf"
AGREEMENT_MAIL_SUBJECT = "UnityOne.ai: EULA agreement"
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', "")
CELERY_EMAIL_FAIL_LIST = []
CELERY_BEAT_SCHEDULER = os.environ.get('CELERY_BEAT_SCHEDULER', 'uldb.celery_custom_classes:CustomFixDatabaseScheduler')
CELERY_TASK_TRACK_STARTED = os.environ.get('CELERY_TASK_TRACK_STARTED', 'True').lower() in ('1','true','yes')

EULA_VERSION = int(os.environ.get('EULA_VERSION', 1))

MASKED_AUDITLOG_FIELD_VALUE = os.environ.get('MASKED_AUDITLOG_FIELD_VALUE', "**************")

PASSWORD_RESET_MAIL_SUBJECT = os.environ.get('PASSWORD_RESET_MAIL_SUBJECT', "UnityOne.ai: Password reset link.")

GCP_SERVICE_ACCOUNT_KEYS = (
    'type',
    'client_x509_cert_url',
    'auth_uri',
    'private_key',
    'client_email',
    'private_key_id',
    'client_id',
    'token_uri',
    'project_id',
    'auth_provider_x509_cert_url'
)

AWS_REGIONS = [
    "us-east-1",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-central-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-northeast-2",
    "ap-northeast-1",
    "ap-south-1",
    "sa-east-1",
]

COLLECTOR_CONFIG = {
    'observium_path': os.environ.get('COLLECTOR_OBSERVIUM_PATH', ''),
    'customer_user_email': os.environ.get('COLLECTOR_CUSTOMER_USER_EMAIL', ''),
    'customer_password': os.environ.get('COLLECTOR_CUSTOMER_PASSWORD', ''),
    'username': os.environ.get('COLLECTOR_USERNAME', ''),
    'password': os.environ.get('COLLECTOR_PASSWORD', '')
}

CO2_FOOT_PRINT_PER_LOCATION = {
    'San Francisco': {'co2_emissions_footprint': 0.275},
    'Ashburn': {'co2_emissions_footprint': 0.528},
    'Hillsboro': {'co2_emissions_footprint': 0.127},
    'Portland': {'co2_emissions_footprint': 0.127},
    'Colorado': {'co2_emissions_footprint': 0.873},
    'Scarborough': {'co2_emissions_footprint': 0.386},
    'Phoenix': {'co2_emissions_footprint': 0.476},
    'Carrollton': {'co2_emissions_footprint': 0.664},
    'Israel': {'co2_emissions_footprint': 0.839},
    'South Korea': {'co2_emissions_footprint': 0.493},
    'Japan': {'co2_emissions_footprint': 0.417},
    'Singapore': {'co2_emissions_footprint': 0.731},
    'Russia': {'co2_emissions_footprint': 0.351},
    'Australia': {'co2_emissions_footprint': 0.924},
    'UK': {'co2_emissions_footprint': 0.475},
}

UNITY_CRM_ACCOUNT = {
    'crm_url': os.environ.get('UNITY_CRM_ACCOUNT_URL'),
    'client_id': os.environ.get('UNITY_CRM_ACCOUNT_CLIENT_ID'),
    'tenant_id': os.environ.get('UNITY_CRM_ACCOUNT_TENANT_ID'),
    'client_secret': os.environ.get('UNITY_CRM_ACCOUNT_CLIENT_SECRET'),
    'crm_account_uuid': os.environ.get('UNITY_CRM_ACCOUNT_UUID'),
    'access_type': 'admin',
}

DATABASE_ROUTERS = ['dynamic_db_router.DynamicDbRouter']

CMDB_URL = "/api/now/cmdb/instance/{}"

CELERY_IMPORTS = tuple(APPS_WITH_TASKS)


PROXY_CONFIG = {
    'PROXY_DOMAIN': os.environ.get('PROXY_DOMAIN'),
    'PROXY_IP': os.environ.get('PROXY_IP'),
    'PROXY_PUBLIC_DNS_IP': os.environ.get('PROXY_PUBLIC_DNS_IP'),
    'CONNECTION_TYPE': os.environ.get('CONNECTION_TYPE'),
    'DEPLOY_IP': os.environ.get('DEPLOY_IP'),
    'DEPLOY_USER': os.environ.get('DEPLOY_USER'),
    'DEPLOY_PORT': os.environ.get('DEPLOY_PORT'),
    'DEPLOY_PRIVATE_KEY_FILE': os.path.join(SITE_ROOT, 'uldb', 'dummy_rsa'),
}

AIRFLOW_URL = os.environ.get('AIRFLOW_URL')
AIRFLOW_USERNAME = os.environ.get('AIRFLOW_USERNAME')
AIRFLOW_PASSWORD = os.environ.get('AIRFLOW_PASSWORD')

ANSIBLE_URL = os.environ.get('ANSIBLE_URL')
ANSIBLE_USERNAME = os.environ.get('ANSIBLE_USERNAME')
ANSIBLE_PASSWORD = os.environ.get('ANSIBLE_PASSWORD')

ICINGA_HOST = os.environ.get('ICINGA_HOST')
ICINGA_PORT = os.environ.get('ICINGA_PORT')
ICINGA_AUTH_KEY = (os.environ.get('ICINGA_AUTH_USERNAME'), os.environ.get('ICINGA_AUTH_PASSWORD'))

OBSERVIUM_AUTH_KEY = {'Authorization': os.environ.get('OBSERVIUM_AUTH_TOKEN')}
ZENDESK_PREFIX = os.environ.get('ZENDESK_PREFIX', '')
ZENDESK_AUTH_KEY = os.environ.get('ZENDESK_AUTH_KEY', ('EMAIL_ADDRESS/token', 'TOKEN'))

SSH_KEY_ENCRYPTION_KEY = os.environ.get('SSH_KEY_ENCRYPTION_KEY')

REDIS_HOST=os.environ.get('REDIS_HOST')
REDIS_PORT='6379'
REDIS_URL = 'redis://%s:%s'%(REDIS_HOST, REDIS_PORT)

# Set default values if not already set in the environment
os.environ.setdefault('REDIS_HOST', REDIS_HOST)
os.environ.setdefault('REDIS_PORT', REDIS_PORT)
os.environ.setdefault('REDIS_URL', REDIS_URL)

CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': 'redis://{0}:{1}/1'.format(REDIS_HOST, REDIS_PORT),
            'OPTIONS': {
                'PARSER_CLASS': 'redis.connection.HiredisParser',
                'CONNECTION_POOL_CLASS': 'redis.BlockingConnectionPool',
                'CONNECTION_POOL_CLASS_KWARGS': {
                    'max_connections': 10000,
                    'timeout': None,
                    },
                'SOCKET_CONNECT_TIMEOUT': None,
                'SOCKET_TIMEOUT': None,
                }
            }
        }
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND')

CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "asgi_redis.RedisChannelLayer",
            "CONFIG": {
                #"prefix":'chn',
                "hosts": [(REDIS_HOST,6379)],
                #"channel_capacity": {
                #    "http.request": 200,
                #        "websocket.send*": 30,
                #    },
                },
            "ROUTING": "websockcomm.routing.channel_routing",
            },
        }

PROXY_DOMAIN='uproxy.unitedlayer.com'
ANSIBLE_CONFIG = os.path.join(SITE_ROOT, 'ansible.cfg')
BIND_CONFIG = {
        'ZONE_FILE': '/etc/bind/zones/forward/' + PROXY_CONFIG["PROXY_DOMAIN"],
        }

AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_REGION_NAME = os.environ.get("AWS_REGION_NAME", "us-west-2")

LARGE_FILE_DIR = os.path.join(os.path.dirname(__file__), '../test/files/')


UNITY_CELERY_PROFILE = False
UNITY_CELERY_TRACK_NETWORK = False

VCENTER_PORT = 9443  # Include in local_settings.py (Temporary until old wmks vmware xterm console exist)

PUBLIC_CLOUD_UPDATE_INTERVAL = 30

REMOTE_DATA_TIMEOUT_MINUTES = 10

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp-mail.outlook.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)
CS_EMAIL = os.environ.get("CS_EMAIL", "UnityOneCS@unitedlayer.com")
SERVER_EMAIL = os.environ.get("SERVER_EMAIL", EMAIL_HOST_USER)
EMAIL_USE_TLS = True

ANSIBLE_OPTS = dict(
        listtags=False,
        listtasks=False,
        listhosts=False,
        syntax=False,
        connection='ssh',
        module_path=None,
        forks=100,
        remote_user='root',
        private_key_file='/home/deploy/.ssh/id_ed25519',
        ssh_common_args=None,
        ssh_extra_args=None,
        sftp_extra_args=None,
        scp_extra_args=None,
        become=True,
        become_method='sudo',
        become_user='root',
        verbosity=3,
        check=False,
        remote_tmp='/tmp',
        local_tmp='/home/deploy/ansible_tmp',
        retry_files_enabled=False,
        start_at_task=None,
        )


CELERY_EMAIL_FAIL_LIST = []
DEBUG=True
CELERY_DEFAULT_QUEUE = 'uldb'


ADMINS = [
    email.strip()
    for email in os.getenv("ADMIN_EMAILS", "").split(",")
    if email.strip()
]
MANAGERS = ADMINS 
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND')


UNITY_DATABASES = [k for k,v in DATABASES.items() if v['NAME'] == 'uldb']
from bulk_strings import *

# ---------------------------------------------------------------------
# End of file
# ---------------------------------------------------------------------

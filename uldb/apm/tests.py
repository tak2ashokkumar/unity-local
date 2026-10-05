from apm.models import Log
from django.utils import timezone

log = Log.objects.create(
    timestamp=timezone.now(),
    service_name='e-commerce-service',
    tenant_id='tenant1',
    message='User logged in',
    severity='INFO'
)


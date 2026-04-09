from django.conf.urls import url


from app.rbac.routers import router
from app.rbac.views import ListRegisteredRbacModels

rbac_urls = [
    url(r"rbac_models", ListRegisteredRbacModels.as_view(), name="rbac-models")
]

all_urls = router.urls + rbac_urls

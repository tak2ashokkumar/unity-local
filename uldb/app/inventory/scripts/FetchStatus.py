from app.inventory.utils import get_status_via_collector
from app.user2.models import User


def run():
    users = User.objects.all()
    for user in users:
        get_status_via_collector(org_id_list=None, request_user=user)

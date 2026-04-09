from django.core.management.base import BaseCommand
from app.organization.models import Organization
from app.user2.models import User

class Command(BaseCommand):
    help = 'create unitedlayer org in sf region if not exist'

    def handle(self, *args, **options):
        org, _ = Organization.objects.get_or_create(name='UnitedLayer', region=Organization.US_REGION)
        user, _ = User.objects.get_or_create(email='rtapia@unitedlayer.com',
            defaults={"org": org, "is_superuser": True, "is_staff": True})
        user.set_password('password')
        user.save()
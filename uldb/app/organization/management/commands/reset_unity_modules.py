from django.core.management.base import BaseCommand
from six import moves

from app.organization.models import Organization, UnityModules, UNITY_SUBSCRIBABLE_MODULES


class Command(BaseCommand):
    help = 'Update Unity Subscribable modules for existing Organizations'

    def handle(self, *args, **options):
        unity_modules = [u[0] for u in UNITY_SUBSCRIBABLE_MODULES]
        for org in Organization.objects.all():
            module_update = False

            org_modules = list(org.unity_modules.all().values_list('module_name', flat=True))
            print("{} - Current Modules  Count: {} ---- New Modules Count : {}".format(
                org.name, len(org_modules), len(unity_modules))
            )
            diff = set(unity_modules) - set(org_modules)
            for each in diff:
                try:
                    UnityModules.objects.get(module_name=each)
                except UnityModules.DoesNotExist:
                    UnityModules.objects.create(module_name=each)

                mod = UnityModules.objects.all()
                module_update = True
                org.unity_modules.set(mod)

            if module_update:
                print("Unity modules updated for Org  - {}".format((org.name)))
            print('-----------------------------------------------------------')
            print('')

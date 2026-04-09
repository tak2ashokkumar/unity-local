from django.test import TestCase
from app.inventory.models import StorageDevice
from app.organization.models import Organization


class StorageDeviceTest(TestCase):
    def setUp(self):
        self.customer = Organization.objects.create(name='Test Organization')

        def test_attibutes(self):
            name = 'Test Device'
            device = StorageDevice.objects.create(name=name, customer=self.customer)
            self.assertEqual(str(device), name)
            self.assertEqual(device.organization_id, device.customer)
            self.assertEqual(device.object_class, 'StorageDevice')

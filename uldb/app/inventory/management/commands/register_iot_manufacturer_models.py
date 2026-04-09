from django.core.management.base import BaseCommand
from app.inventory.config import defaults
from app.inventory.models import Manufacturer, SensorModel, SmartPDUModel, RfidReaderModel


class Command(BaseCommand):
    help = 'Register All Manufacturers and their models for IoT Devices'

    def handle(self, *args, **options):
        # Create/Update Sensor Manufacturer and Models
        sensor_models, smart_pdu_models, rfid_reader_models = [], [], []
        for manufacturer_name, models in defaults.sensor_manufacturer_models_map.items():
            manufacturer, created = Manufacturer.objects.update_or_create(name=manufacturer_name)
            for model_name in models:
                instance, created = SensorModel.objects.update_or_create(name=model_name, manufacturer=manufacturer)
                sensor_models.append(instance.uuid)
        SensorModel.objects.all().exclude(uuid__in=sensor_models).delete()
        # Create/Update Smart PDU Manufacturer and Models
        for manufacturer_name, models in defaults.smart_pdu_manufacturer_models_map.items():
            manufacturer, created = Manufacturer.objects.update_or_create(name=manufacturer_name)
            for model_name in models:
                instance, created = SmartPDUModel.objects.update_or_create(name=model_name, manufacturer=manufacturer)
                smart_pdu_models.append(instance.uuid)
        SmartPDUModel.objects.all().exclude(uuid__in=smart_pdu_models).delete()
        # Create/Update RFID Reader Manufacturer and Models
        for manufacturer_name, models in defaults.rfid_reader_manufacturer_models_map.items():
            manufacturer, created = Manufacturer.objects.update_or_create(name=manufacturer_name)
            for model_name in models:
                instance, created = RfidReaderModel.objects.update_or_create(name=model_name, manufacturer=manufacturer)
                rfid_reader_models.append(instance.uuid)
        RfidReaderModel.objects.all().exclude(uuid__in=rfid_reader_models).delete()

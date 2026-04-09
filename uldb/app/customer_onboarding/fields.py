from import_export.widgets import Widget, ForeignKeyWidget
from app.inventory.models import Manufacturer


class ManufacturerWidgetWithCreation(ForeignKeyWidget):
    def clean(self, value, *args, **kwargs):
        row = kwargs['row']
        manufacturer = Manufacturer.objects.filter(
            name=row['Make']
        ).first()

        if manufacturer:
            model_object = self.model.objects.get_or_create(
                name=row['Model'], manufacturer=manufacturer
            )

            return model_object[0]


class OperatingSystemForeignKeyWidget(ForeignKeyWidget):

    def clean(self, value, *args, **kwargs):
        row = kwargs['row']
        return self.model.objects.filter(
            name=row['Operating System'], version=row['OS Version']
        ).first()


class VcenterURLWidget(Widget):

    def clean(self, value, *args, **kwargs):
        if 'https://' in value:
            return value.split("https://")[1]
        return None

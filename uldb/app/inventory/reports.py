from reporting.master import ModelReport, ReportMaster
from app.inventory.models import StorageDevice

class StorageDeviceReport(ModelReport):
    model = StorageDevice
    fields = ('name', 'management_ip', 'private_cloud','datacenter') 
    queryset = StorageDevice.objects.all()
    customer_filter_path = 'customer'
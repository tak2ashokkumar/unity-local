import json
import io
import xlsxwriter
import boto3
import datetime
import django_filters

from django.db.models import Max, Min
from django.conf import settings
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.decorators import detail_route, list_route
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.core.mail import send_mail, EmailMessage
from collections import OrderedDict

from .models import (
    AWSInstancePricing, AzureVMSize, AzureVMPricing,
    AzureStoragePricing, GCPStoragePricing,
    GCPMachineTypePricing
)

from .serializers import (
    AWSInstancePricingSerializer, AzureVMPricingSerializer,
    AzureStoragePricingSerializer
)


class AWSPricingFilter(django_filters.FilterSet):
    cpu_start = django_filters.NumberFilter(name="cpu", lookup_expr='gte')
    cpu_end = django_filters.NumberFilter(name="cpu", lookup_expr='lte')
    ram_start = django_filters.NumberFilter(name="ram", lookup_expr='gte')
    ram_end = django_filters.NumberFilter(name="ram", lookup_expr='lte')

    class Meta:
        model = AWSInstancePricing
        fields = [
            'cpu_start', 'cpu_end', 'ram_start', 'ram_end',
            'region', 'nw_performance', 'lease_contract_length'
        ]


class AWSInstancePriceList(generics.ListAPIView):
    ordering = ('ram')
    queryset = AWSInstancePricing.objects.all()
    serializer_class = AWSInstancePricingSerializer
    filter_class = AWSPricingFilter


class AWSEbsStoragePricing(APIView):
    def get(self, request, *args, **kwargs):

        region = self.request.query_params.get('region', None)
        storage_type = self.request.query_params.get('storage_type', None)

        if region and storage_type:
            client = boto3.client(
                'pricing',
                aws_access_key_id='',
                aws_secret_access_key='',
                region_name='us-east-1'
            )

            response = client.get_products(
                ServiceCode='AmazonEC2',
                Filters=[
                    {
                        'Type': 'TERM_MATCH',
                        'Field': 'productFamily',
                        'Value': 'Storage'
                    },
                    {
                        'Type': 'TERM_MATCH',
                        'Field': 'volumeType',
                        'Value': storage_type
                    },
                    {
                        'Type': 'TERM_MATCH',
                        'Field': 'location',
                        'Value': region,
                    }
                ],
            )
            price_item = json.loads(response["PriceList"][0]) if response['PriceList'] else None
            if price_item:
                terms = price_item["terms"]
                term = terms["OnDemand"].itervalues().next()

                price_dimension = term["priceDimensions"].itervalues().next()
                rate = price_dimension['pricePerUnit']["USD"]
                unit = price_dimension['unit']

                response = {
                    'rate': rate,
                    'storage_type': storage_type,
                    'region': region
                }
                return Response(response, status=status.HTTP_200_OK)

        response = {
            'message': "Invalid Request"
        }
        return Response(response, status=status.HTTP_400_BAD_REQUEST)


class AzureVMPricingFilter(django_filters.FilterSet):
    cpu_start = django_filters.NumberFilter(name="size__cpu", lookup_expr='gte')
    cpu_end = django_filters.NumberFilter(name="size__cpu", lookup_expr='lte')
    ram_start = django_filters.NumberFilter(name="size__ram_in_mb", lookup_expr='gte')
    ram_end = django_filters.NumberFilter(name="size__ram_in_mb", lookup_expr='lte')

    class Meta:
        model = AzureVMPricing
        fields = [
            'cpu_start', 'cpu_end', 'ram_start', 'ram_end',
            'region', 'tier', 'commitment'
        ]


class AzureVMPriceList(generics.ListAPIView):
    ordering = ('size__ram_in_mb')
    queryset = AzureVMPricing.objects.all()
    serializer_class = AzureVMPricingSerializer
    filter_class = AzureVMPricingFilter


class AzureStoragePricingView(APIView):
    def get(self, request, *args, **kwargs):

        region = self.request.query_params.get('region', None)
        storage = self.request.query_params.get('storage', None)
        storage_type = self.request.query_params.get('storage_type', None)

        # This will convert it to the closest 2's power value.
        # for eg. 500 to 512
        if region and storage and storage_type:
            closest_value = 1 << (int(storage) - 1).bit_length()

            max_and_min = AzureStoragePricing.objects.filter(
                region=region,
                meter_sub_category=storage_type
            ).aggregate(
                max=Max('disk_size'),
                min=Min('disk_size')
            )

            if closest_value < max_and_min['min']:
                closest_value = max_and_min['min']
            elif closest_value > max_and_min['max']:
                closest_value = max_and_min['max']

            azure_storage_pricing = AzureStoragePricing.objects.filter(
                region=region,
                disk_size=closest_value,
                meter_sub_category=storage_type
            ).first()

            if azure_storage_pricing:
                response = AzureStoragePricingSerializer(azure_storage_pricing).data

                return Response(response, status=status.HTTP_200_OK)

        response = {
            'message': "Invalid Request"
        }
        return Response(response, status=status.HTTP_400_BAD_REQUEST)


class GCPMachineTypePricingView(APIView):
    def get(self, request, *args, **kwargs):

        region = self.request.query_params.get('region', None)
        machine_type = self.request.query_params.get('machine_type', None)
        machine_class = self.request.query_params.get('machine_class', None)
        commitment = self.request.query_params.get('commitment', None)
        if region and machine_class and machine_type:
            gcp_cpu_rate = GCPMachineTypePricing.objects.filter(
                region=region,
                machine_type=machine_type,
                commitment=commitment,
                machine_class=machine_class,
                cpu_or_ram='cpu'
            ).first()

            gcp_ram_rate = GCPMachineTypePricing.objects.filter(
                region=region,
                machine_type=machine_type,
                commitment=commitment,
                machine_class=machine_class,
                cpu_or_ram='ram'
            ).first()

            if gcp_cpu_rate and gcp_ram_rate:
                response = {
                    'cpu': gcp_cpu_rate.rate,
                    'ram': gcp_ram_rate.rate
                }

                return Response(response, status=status.HTTP_200_OK)

        response = {
            'message': "Invalid Request"
        }
        return Response(response, status=status.HTTP_400_BAD_REQUEST)


class GCPStoragePricingView(APIView):
    def get(self, request, *args, **kwargs):

        region = self.request.query_params.get('region', None)
        storage_type = self.request.query_params.get('storage_type', None)
        if region and storage_type:
            gcp_storage_rate = GCPStoragePricing.objects.filter(
                region=region,
                storage_type=storage_type,
            ).first()

            if gcp_storage_rate:
                response = {
                    'description': gcp_storage_rate.description,
                    'rate': gcp_storage_rate.rate
                }

                return Response(response, status=status.HTTP_200_OK)

        response = {
            'message': "Invalid Request"
        }
        return Response(response, status=status.HTTP_400_BAD_REQUEST)


class CostCalculatorUtilityViewSet(viewsets.ViewSet):
    authentication_classes = (SessionAuthentication, TokenAuthentication)
    permission_classes = (IsAuthenticated,)

    @staticmethod
    def get_excel_file(data_dict_array):
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet()

        # Start from the first cell. Rows and columns are zero indexed.
        row = 0
        col = 0
        header_cell_format = workbook.add_format({
            'bold': True,
            'align': 'left',
            'text_wrap': True})
        merge_format = workbook.add_format({
            'bold': 1,
            'border': 1,
            'align': 'center',
            'valign': 'vcenter'})

        text_wrap_format = workbook.add_format(
            {
                'text_wrap': True,
                'align': 'left'
            }
        )

        device_label_dict = OrderedDict(
            [
                ('instanceCount', 'Instance Count'),
                ('vCPURange', 'vCPU Range'),
                ('RAMRange', 'RAM Range(GB)'),
                ('storageCount', 'Storage(GB)'),
                ('term', 'Term'),
                ('awsTotalBill', 'AWS Cost(USD)'),
                ('azureTotalBill', 'Azure Cost(USD)'),
                ('gcpTotalBill', 'GCP Cost(USD)'),
                ('g3_cloudTotalBill', 'G3 Cost(USD)')
            ]
        )
        initial_col_width = len(device_label_dict) - 1
        if not (data_dict_array[0]['awsTotalBill']):
            del device_label_dict['awsTotalBill']
            initial_col_width -= 1
        if not (data_dict_array[0]['azureTotalBill']):
            del device_label_dict['azureTotalBill']
            initial_col_width -= 1
        if not (data_dict_array[0]['gcpTotalBill']):
            del device_label_dict['gcpTotalBill']
            initial_col_width -= 1
        if not (data_dict_array[0]['g3_cloudTotalBill']):
            del device_label_dict['g3_cloudTotalBill']
            initial_col_width -= 1
        # Setting UnityOne header
        worksheet.set_column(0, 4, 10)
        worksheet.set_column(5, initial_col_width, 20)
        worksheet.merge_range(0, 0, 0, initial_col_width, 'Instance Selection Details with Cost Report', merge_format)
        row += 1
        worksheet.merge_range(1, 1, 1, 4, 'User Request', merge_format)
        worksheet.merge_range(1, 5, 1, initial_col_width, 'User Selection', merge_format)
        row += 1
        # Write header for data
        for key, value in device_label_dict.iteritems():
            worksheet.write(row, col, value, header_cell_format)
            col += 1
        row += 1
        # Iterate over the data and write it out row by row.
        for data in data_dict_array:
            col = 0
            for item, cost in device_label_dict.iteritems():
                worksheet.write(row, col, data[item], text_wrap_format)
                col += 1
            row += 1
        workbook.close()
        output.seek(0)
        return output, workbook

    @list_route(methods=['GET'])
    def download_excel(self, request, *args, **kwargs):
        try:
            request_data = dict(self.request.query_params)
            data_dict_array = list()
            count = request_data.get('count')[0]
            for i in range(0, int(count)):
                data_dict = dict()
                data_dict['instanceCount'] = request_data.get(
                    'instanceCount'
                )[i] if request_data.get('instanceCount') else "N/A"
                data_dict['storageCount'] = request_data.get(
                    'storageCount'
                )[i] if request_data.get('storageCount') else "N/A"
                data_dict['vCPURange'] = request_data.get(
                    'vCPURange'
                )[i] if request_data.get('vCPURange') else "N/A"
                data_dict['RAMRange'] = request_data.get(
                    'RAMRange'
                )[i] if request_data.get('RAMRange') else "N/A"
                data_dict['term'] = request_data.get(
                    'term'
                )[i] if request_data.get('term') else "N/A"
                data_dict['awsTotalBill'] = request_data.get(
                    'awsTotalBill'
                )[i] if request_data.get('awsTotalBill') else None
                data_dict['azureTotalBill'] = request_data.get(
                    'azureTotalBill'
                )[i] if request_data.get('azureTotalBill') else None
                data_dict['gcpTotalBill'] = request_data.get(
                    'gcpTotalBill'
                )[i] if request_data.get('gcpTotalBill') else None
                data_dict['g3_cloudTotalBill'] = request_data.get(
                    'g3_cloudTotalBill'
                )[i] if request_data.get('g3_cloudTotalBill') else None
                # Appending dict to data list
                data_dict_array.append(data_dict)
            output, workbook = self.get_excel_file(data_dict_array)
            # Sending File response
            response = HttpResponse(
                output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            current_date = datetime.datetime.now()

            response['Content-Disposition'] = 'attachment; filename=CostCalculatorReport_%s.xlsx' % (current_date)
            return response
        except Exception as error:
            response = {
                'message': "Request Failed"
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    @list_route(methods=['POST'])
    def send_cost_calculator_email(self, request, *args, **kwargs):
        try:
            data_dict_array = list()
            request_data = request.data
            for data in request_data:
                data['vCPURange'] = str(data['cpuMinRange']) + " to " + str(data['cpuMaxRange'])
                data['RAMRange'] = str(data['ramMinRange']) + " to " + str(data['ramMaxRange'])
                data['term'] = str(data['commitment']['displayText'])
                data['awsTotalBill'] = "$ " + str(data['aws']['totalBill']) + " " + str(
                    data['aws']['instanceName']) + str(data['aws']['storage']) if 'aws' in data else None
                data['azureTotalBill'] = "$ " + str(data['azure']['totalBill']) + " " + str(
                    data['azure']['instanceName']) + str(data['azure']['storage']) if 'azure' in data else None
                data['gcpTotalBill'] = "$ " + str(data['gcp']['totalBill']) + " " + str(
                    data['gcp']['instanceName']) + str(data['gcp']['storage']) if 'gcp' in data else None
                data['g3_cloudTotalBill'] = "$ " + str(data['g3_cloud']['totalBill']) + " " + str(
                    data['g3_cloud']['instanceName']) + str(data['g3_cloud']['storage']) if 'g3_cloud' in data else None
                data_dict_array.append(data)

            output, workbook = self.get_excel_file(data_dict_array)
            # Sending File response
            current_date = datetime.datetime.now()
            subject = settings.COST_CALCULATOR_REPORT_SUBJECT
            message = settings.COST_CALCULATOR_REPORT_MESSAGE.format(
                first_name=self.request.user.first_name
            )
            to = [self.request.user.email]
            file_name = 'CostCalculatorReport_{}.xlsx'.format(current_date)
            email = EmailMessage(subject, message, to=to)
            email.attach(file_name, output.getvalue(), mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            email.send()
            return Response("Email Sent Successfully", status=status.HTTP_200_OK)
        except Exception as error:
            response = {
                'message': error.message
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

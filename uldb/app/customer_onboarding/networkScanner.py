import nmap
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def startScan(inet):
    try:
        nma = nmap.PortScanner()
        start = datetime.now()
        all_devices_data = []

        scan_result = nma.scan(hosts=inet, arguments='-T4 -A')
        results = scan_result['scan'].values()

        logger.debug('----------SCAN RESULTS BEFORE PARSING----------')
        logger.debug("All hosts in network range - %s -> %s" % (inet, str(results)))

        for i in results:
            os = ""
            vendor = ""
            device_type = ""

            os_match = i.get('osmatch', None)
            if os_match:
                os = os_match[0]["osclass"][0]["osfamily"]
                vendor = os_match[0]["osclass"][0]["vendor"]
                device_type = os_match[0]["osclass"][0]["type"]

            d = {
                "hostname": i['hostnames'][0]["name"],
                "ip_address": i['addresses']["ipv4"],
                "status": i['status']['state'],
                "os": os,
                "vendor": vendor,
                "device_type": device_type
            }
            all_devices_data.append(d)
        logger.debug('----------SCAN RESULTS----------')
        logger.debug("All hosts in network range - %s -> %s" % (inet, all_devices_data))
        logger.debug("Time taken in scanning - %s seconds" % ((datetime.now() - start).total_seconds()))
        return all_devices_data
    except Exception as e:
        logger.error('Error while scanning - %s - %s' % (inet, e))
        return []

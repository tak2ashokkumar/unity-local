# /usr/bin/python
# pip install pexpect
import os
import sys
import time
import socket
import pexpect
import requests
from requests.auth import HTTPBasicAuth

import logging

logger = logging.getLogger(__name__)


def recycle(username, password, ip, all_outlets, outlets, port=23):
    try:
        telnet_command = 'telnet ' + ip + ' %s' % port
        logger.debug('Telnet Command : %s', telnet_command)
        telconn = pexpect.spawn(telnet_command)
        time.sleep(20)
        telconn.expect("User Name :")
        telconn.send(username + "\r")
        logger.debug('Username : %s', username)
        telconn.expect("Password  :")
        telconn.send(password + "\r")
        if all_outlets:
            telconn.send("reboot\n")
            telconn.expect("Enter 'YES' to continue or <ENTER> to cancel : ")
            telconn.send("YES" + "\r")
            time.sleep(20)
            logger.debug('<===== Reboot success for : %s =======>', telnet_command)
        else:
            for k in outlets:
                logger.debug("olreboot {outlet_no}\n".format(outlet_no=k))
                telconn.send("olreboot {outlet_no}\n".format(outlet_no=k))
                logger.debug("olstatus {outlet_no}\n".format(outlet_no=k))
                telconn.send("olstatus {outlet_no}\n".format(outlet_no=k))
                time.sleep(20)
                telconn.expect("{outlet_no}: Outlet {outlet_no}: On".format(outlet_no=k))
        result = telconn.expect(">")
        logger.debug('PDU recycle result>>>>>>%s' % result)
        return result == 0
    except Exception as e:
        logger.error('error- %s' % e)
        return False


def check_auth_pdu(username, password, ip, port=23):
    try:
        telnet_command = 'telnet ' + ip + ' %s' % port
        logger.debug('Telnet Command : %s', telnet_command)
        telconn = pexpect.spawn(telnet_command)
        time.sleep(5)
        telconn.expect("User Name :")
        telconn.send(username + "\r")
        logger.debug('Username : %s', username)
        telconn.expect("Password  :")
        telconn.send(password + "\r")
        r = telconn.expect(">", timeout=5)
        logger.debug(r)
        return True
    except Exception as e:
        logger.error(e)
        return False


def isOpen(ip, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(3)
    try:
        s.connect((ip, int(port)))
        s.shutdown(socket.SHUT_RDWR)
        return True
    except:
        return False
    finally:
        s.close()


def pdu_post_request(agent, data, action):
    url = 'https://' + agent.ip_address + '/' + action
    response = requests.post(
        url,
        auth=HTTPBasicAuth(agent.web_username, agent.web_password),
        data=data
    )
    return response.json()


def call_pdu_recycle_api(agent, data):
    logger.debug("PDU recycle from Agent API")
    try:
        return pdu_post_request(agent, data, 'pdu_recycle')
    except Exception as e:
        logger.error("Agent API connection error : %s", e)
        raise e
    return None

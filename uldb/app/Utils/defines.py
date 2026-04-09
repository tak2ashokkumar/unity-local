# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#
# All Rights Reserved.

# ----------------------------
# These are the global defines
# ----------------------------

# constant poput alert script
# JAVA_SCRIPT_1 = "<script type='text/javascript'>window.close();window.opener.popupAlert('UL Asset Managemet :Info ','success','"
# JAVA_SCRIPT_2 = ",true);</script>"
# Define Roles
SERIAL_NUMBER_ENTROPY = 32
PAGINATE = None
ULADMIN = 1
ULSTAFF = 2
ADMIN = 3
STAFF = 4
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = '<smtp server name>'
EMAIL_PORT = '<smtp port>'
EMAIL_HOST_USER = '<email id >'
EMAIL_HOST_PASSWORD = '<password>'
DEFAULT_FROM_EMAIL = 'noreply@unityonecloud.com'
EMAIL_USE_TLS = True

SUBJECT = 'Unity - Portal account created'
RESET_SUBJECT = 'Password Reset'
RESET_MESSAGE1 = '\n\nWe received a request to change your password on Unity customer portal \n\n Click the link below to set a new password:\n\n'
RESET_URL = 'http://uldbdev.net.unitedlayer.com/reset_password/?reset_token='
RESET_MESSAGE2 = "\n\nIf you don't want to change your password, you can ignore this email."
ACTIVATION_SUBJECT = 'Unity - Portal account customer activation'
ACTIVATION_MESSAGE_BODY_1 = '\n\nAn account has been created for you at the '
ACTIVATION_MESSAGE_BODY_2 = '\n\nPlease visit this url to activate your account and set your password.'
ACTIVATION_URL = '\nhttp://uldbdev.net.unitedlayer.com/activation/?key='
MAIL_SALUTE = 'Dear '
MESSAGE_BODY = ('\n\n Your account has been Activated. You may access UL Customer portal at the following URL: '
                '\nhttp://uldbdev.net.unitedlayer.com  \n\nYour credentials for the account are:')
USERNAME = ' \nUsername: '
PASSWORD = '\nPassword: '
MAIL_FOOTER = '\n\nRegards, \nUnity Support Team'

REFRESH_WINDOW = '<script language="javascript">window.parent.location.reload(true);</script>'
POPUP_ALERT = '<script language="javascript">window.parent.popupAlert("'
LOCAL_POPUP_ALERT = '<script language="javascript">window.location.reload.popupAlert("'
INV_POPUP_ALERT = '<script type="text/javascript">window.close();</script>'
ADDED_POPUP_MESSAGE = '</b> Added Sucessfully..!",false); </script>'
USER_MODULE_NAME = 'UL User Managemet Info", "success","'
ORG_MODULE_NAME = 'UL Organization Managemet Info", "success","'
ASSET_MODULE_NAME = 'UL Asset Managemet Info", "success","'
GROUP_MODULE_NAME = 'UL Group Managemet Info", "success","'
PRODUCT_MODULE_NAME = 'UL Product Managemet Info", "success","'
ADDED_MESSAGE = '</b> Added Sucessfully..!",true);</script>'
UPDATED_MESSAGE = '</b> Updated Sucessfully..!",true);</script>'
INV_UPDATED_MESSAGE = '</b> Updated Sucessfully..!",false);</script>'
DELETED_MESSAGE = '</b> Deleted Sucessfully..!",true);</script>'

ACCESS_DENIED_MESSAGE = 'You dont have a permission, Please contact administrator'

# Script alert message for imported content
IMPORT_ALERT_JAVA_SCRIPT = '<script type="text/javascript" src="/static/js/javascript-messagebox.js"></script>'
IMPORT_SCRIPT_LINK = '<link rel="stylesheet" type="text/css" href="/static/css/template.css">'
IMPORT_POPUP_ALERT = '<script language="javascript">popupAlert('
IMPORT_MODULE_NAME = '"UL Organization Managemet Info", "success","'
IMPORT_SAVED_MESSAGE = '</b> Saved Sucessfully..!",false,"","","'
IMPORT_END_SCRIPT = '");</script>'

# Script alert message for imported content
DELETE_ALERT_JAVA_SCRIPT = '<script type="text/javascript" src="/static/js/javascript-messagebox.js"></script>'
DELETE_SCRIPT_LINK = '<link rel="stylesheet" type="text/css" href="/static/css/template.css">'
DELETE_POPUP_ALERT = '<script language="javascript">popupAlert('
DELETE_MODULE_NAME = '"UL Product Managemet Info", "warning","'
DELETE_WARNING_MESSAGE = '</b> has virtual system(s), please remove its vm before to delete it",false,"","","'
DELETE_END_SCRIPT = '");</script>'

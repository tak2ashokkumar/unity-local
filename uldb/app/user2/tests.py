from django.test import TestCase
from django.db import models
from models import *
import time
import datetime
from app.organization.models import *
from app.inventory.models import *
from app.group.models import *
from app.user2.templatetags.login_branding import get_login_brand


class LoginBrandingTests(TestCase):
    class Request(object):
        def __init__(self, host):
            self.host = host

        def get_host(self):
            return self.host

    def test_upc_domain_uses_upc_login_brand(self):
        brand = get_login_brand(self.Request('upc.unitedlayer.com'))

        self.assertEqual(brand['image'], '/static/images/UPC-logo.png')
        self.assertEqual(brand['alt'], 'United Private Cloud')
        self.assertEqual(brand['class'], 'login-brand-upc')

    def test_upc_domain_with_port_uses_upc_login_brand(self):
        brand = get_login_brand(self.Request('upc.unitedlayer.com:443'))

        self.assertEqual(brand['image'], '/static/images/UPC-logo.png')
        self.assertEqual(brand['alt'], 'United Private Cloud')
        self.assertEqual(brand['class'], 'login-brand-upc')

    def test_other_domain_uses_default_login_brand(self):
        brand = get_login_brand(self.Request('cerne.unityone.ai'))

        self.assertEqual(brand['image'], '/static/images/unity-ai-logo-tm.png')
        self.assertEqual(brand['alt'], 'Unity')
        self.assertEqual(brand['class'], 'login-brand-default')

    def test_missing_request_uses_default_login_brand(self):
        brand = get_login_brand(None)

        self.assertEqual(brand['image'], '/static/images/unity-ai-logo-tm.png')
        self.assertEqual(brand['class'], 'login-brand-default')

    def test_unresolvable_host_uses_default_login_brand(self):
        class BrokenRequest(object):
            def get_host(self):
                raise Exception('Invalid HTTP_HOST header')

        brand = get_login_brand(BrokenRequest())

        self.assertEqual(brand['image'], '/static/images/unity-ai-logo-tm.png')
        self.assertEqual(brand['class'], 'login-brand-default')

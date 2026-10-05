from __future__ import unicode_literals

from django import template


register = template.Library()

DEFAULT_LOGIN_BRAND = {
    'image': '/static/images/unity-ai-logo-tm.png',
    'alt': 'Unity',
    'class': 'login-brand-default',
}

UPC_LOGIN_BRAND = {
    'image': '/static/images/UPC-logo.png',
    'alt': 'United Private Cloud',
    'class': 'login-brand-upc',
}

UPC_HOSTS = (
    'upc.unitedlayer.com',
)


def _get_request_host(request):
    if not request:
        return ''

    try:
        host = request.get_host()
    except Exception:
        return ''

    return host.split(':', 1)[0].strip().lower()


def get_login_brand(request):
    if _get_request_host(request) in UPC_HOSTS:
        return UPC_LOGIN_BRAND
    return DEFAULT_LOGIN_BRAND


@register.simple_tag
def login_brand(request):
    return get_login_brand(request)

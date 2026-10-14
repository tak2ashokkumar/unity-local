from __future__ import unicode_literals

from django import template
from django.conf import settings


register = template.Library()

# ---------------------------------------------------------------------------
# Logo-only branding (kept for backward compatibility).
# `login_brand` continues to swap just the logo by host, exactly as before.
# ---------------------------------------------------------------------------
DEFAULT_LOGIN_BRAND = {
    'image': '/static/images/unity-ai-logo-tm.png',
    'alt': 'UnityOne',
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


# ---------------------------------------------------------------------------
# Full-page login themes (plug-and-play, driven by the domain).
#
# Each portal is ONE self-contained page (its own <style> + markup) under
# app/templates/two_factor/themes/. The main login page (core/login.html)
# checks the domain and loads the matching page.
#
# To add a new portal login page:
#   1. Add one entry to LOGIN_THEMES pointing `template` at its single file.
#   2. Map its host(s) in DOMAIN_THEME_MAP.
#   3. Drop the one theme file under app/templates/two_factor/themes/.
# Nothing else in the login stack changes.
#
# A theme with template = None renders the DEFAULT login page
# (the original markup is untouched).
# ---------------------------------------------------------------------------
LOGIN_THEMES = {
    'default': {
        'id': 'default',
        'template': None,
        'brand': DEFAULT_LOGIN_BRAND,
        'title': 'Sign in to UnityOne',
    },
    'cerne': {
        'id': 'cerne',
        'template': 'two_factor/themes/_cerne.html',
        'brand': {
            'image': '/static/images/login/cerne-logo.png',
            'alt': 'Cerne',
        },
        'title': 'Sign in to Cerne',
        'assets': {
            'bg': '/static/images/login/cerne-bg.jpg',
            'bg_mobile': '/static/images/login/cerne-bg-mobile.jpg',
        },
        'azure': True,
    },
    'cerne-play': {
        'id': 'cerne-play',
        'template': 'two_factor/themes/_cerne-play.html',
        'brand': {
            'image': '/static/images/unity-ai-logo-tm.png',
            'alt': 'UnityOne AI',
        },
        'title': 'Login to Playground',
        'subtitle': 'Agentic Cloud Management',
        'azure': False,
        'links': {
            'signup': '#',
            'contact': '#',
            'demo': '#',
            'terms': '#',
        },
    },
}

# host (lowercase, no port) -> theme id. Unmapped hosts fall back to 'default'.
DOMAIN_THEME_MAP = {
    'cerne.unityone.ai': 'cerne',
    'play.unityone.ai': 'cerne-play',
}

DEFAULT_THEME_ID = 'default'


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


def get_login_theme(request):
    """Resolve the login theme for the current request host.

    A `?login_theme=<id>` query override is honoured only when DEBUG is on,
    so each theme can be previewed locally (domain switching cannot trigger
    on localhost).
    """
    theme_id = DOMAIN_THEME_MAP.get(_get_request_host(request), DEFAULT_THEME_ID)

    if getattr(settings, 'DEBUG', False) and request is not None:
        override = request.GET.get('login_theme')
        if override in LOGIN_THEMES:
            theme_id = override

    return LOGIN_THEMES.get(theme_id, LOGIN_THEMES[DEFAULT_THEME_ID])


@register.simple_tag
def login_brand(request):
    return get_login_brand(request)


@register.simple_tag
def login_theme(request):
    return get_login_theme(request)

from django.dispatch import Signal

from django.contrib.auth.signals import user_logged_in, user_logged_out

# user_logged_in = Signal(providing_args=['sender', 'request', 'user'])
user_login_failed = Signal(providing_args=['credentials'])
# user_logged_out = Signal(providing_args=['request', 'user'])

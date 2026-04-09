from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from datetime import timedelta
from django.conf import settings


class Command(BaseCommand):
    help = "Deactivate users after 3 days of last login if email domain is not unitedlayer.com"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        cutoff_date = timezone.now() - timedelta(days=3)

        users_to_deactivate = User.objects.filter(
            org__name=settings.PLAYGROUND_ORGANIZATION,
            is_active=True,
            date_joined__isnull=False,
            date_joined__lt=cutoff_date
        ).exclude(
            email__iendswith='@unitedlayer.com'
        ).exclude(
            email__iendswith='@unityone.ai'
        ).exclude(
            is_staff=True,
            is_superuser=True
        )

        count = users_to_deactivate.count()

        for user in users_to_deactivate:
            user.is_active = False
            user.save(update_fields=['is_active'])

            subject = "UnityOne AI Playground Access Expired"
            message = (
                "Hi {},\n\n"
                "Thank you for showing interest in UnityOne AI Playground.\n\n"
                "Your 3-day complimentary access has expired.\n\n"
                "Our customer success team will get back to you.\n\n"
                "Regards,\n"
                "UnityOne Team"
            ).format(user.email)

            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email, settings.CS_EMAIL],
                    fail_silently=False,
                )
            except Exception as e:
                self.stderr.write(
                    "Failed to send email to {}: {str(e)}".format(user.email)
                )

        self.stdout.write(
            self.style.SUCCESS("Deactivated {} user(s).".format(count))
        )
        
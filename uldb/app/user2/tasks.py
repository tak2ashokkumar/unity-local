from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from datetime import timedelta
from django.conf import settings


@shared_task
def deactivate_playground_users():
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

    for user in users_to_deactivate.iterator():
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
            print("Email failed for {}}: {str(e)}".format(user.email))

    return "Deactivated {} users".format(count)

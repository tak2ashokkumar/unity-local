import uuid
from app.organization.models import Organization
from app.user2.models import User


def agent_credentials_generate(org_name):
    orgs = Organization.objects.filter(name__icontains=org_name)
    if orgs:
        for org in orgs:
            print (org.name)
            users = User.objects.filter(org=org, is_customer_admin=True)
            agent_users = User.objects.filter(org=org, email__icontains='agent')
            if agent_users:
                print('Agent users already exists for ' + org.name + ' - ' + agent_users[0].email)
                continue
            if users:
                user_name = 'agent'
                password = 'agent123'
                user = users[0]
                user.first_name = user_name
                user.last_name = user_name
                user.uuid = uuid.uuid4()
                user.set_password(password)
                email = user.email.split('@')[1]
                user.email = org.slug + '-' + str(org.id) + '-' + str(user_name) + '@' + email
                user.id = None
                user.save()
                print(user.email)


def run():
    agent_credentials_generate('unit')
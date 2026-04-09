# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.

from __future__ import absolute_import
from __future__ import unicode_literals

import sys

reload(sys)
sys.setdefaultencoding('utf8')

from django.conf import settings
from django.contrib.auth.views import auth_logout
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import send_mail
from django.http.response import HttpResponseRedirect
from django.utils import timezone
from django.db.models import Q

from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_otp import user_has_device
from django.shortcuts import get_object_or_404, render

from django.template.loader import render_to_string
from django.utils.html import strip_tags

from rest.core import *  # brings in rest_framework.status and all that good stuff

from .models import User, ULDBUserInvitation, DemoTrialRequestToken, AccessList, AccessType

from rest.core.serializers import (
    OrganizationSerializer,
    AccessTypeSerializer,
    AccessListSerializer,
    UserSerializer,
    UserDetailSerializer,
    ULUserSessionSerializer
)
from app.organization.models import Organization
import logging

from libraries.auditlog.models import LogEntry
from libraries.auditlog.diff import model_instance_diff
import json
from app.Utils.utility import add_m2m_audit_diff, update_m2m_audit_diff
from copy import deepcopy
from django.contrib.contenttypes.models import ContentType

from .forms import DemoRequestForm, FreeTrailRequestForm

logger = logging.getLogger(__name__)


def logout(request):
    """
    Kills user session, redir to login page.
    """
    auth_logout(request)

    return HttpResponseRedirect(redirect_to='/')


class UserViewSet(AbstractNonMetaModelViewSet):
    # queryset = User.objects.all()
    queryset = User.objects.all().select_related(
        'org',
    ).prefetch_related(
        'access_types',
        'user_roles',
        'ticketuser'
    )
    serializer_class = UserSerializer

    filter_fields = ('email',)
    search_fields = ('email', 'first_name', 'last_name', 'salesforce_id',)
    lookup_value_regex = '[^/]+'

    def get_serializer_class(self):
        if self.action == 'list':
            return UserSerializer
        return UserDetailSerializer

    def get_queryset(self):
        queryset = super(UserViewSet, self).get_queryset()
        allow_impersonation = self.request.query_params.get('impersonation', None)
        if self.action == 'list':
            queryset = queryset.order_by("email").prefetch_related(
                'access_types', 'user_roles', 'org'
            )
            if allow_impersonation:
                queryset = queryset.filter(
                    Q(email__icontains='@unitedlayer.com') | Q(email__icontains='@unityonecloud.com')
                )

        return queryset

    def check_cust_admin(self, role_set):
        is_customer_admin = False
        if role_set:
            for role in role_set:
                role_name = role['name']
                if role_name == 'Administrator':
                    is_customer_admin = True
        return is_customer_admin

    def create(self, request, *args, **kwargs):
        logger.info('Creating user: %s' % request.data)
        data = request.data
        ticket_group = data.get('ticket_group', [])
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            logger.info('Data is valid. Saving serializer...')
            self.user = serializer.save()
            self.user.ticket_group = ','.join(map(str, [grp['id'] for grp in ticket_group]))
            if 'password' in data:
                raw_password = data['password']
                try:
                    self.user.set_password(raw_password)
                    self.user.save()
                except Exception as e:
                    return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                # self.user.password = make_password(raw_password)
                # self.user.save()
                logger.info('User created')
            else:
                self.user.save()
            # Set user role and permission
            role_ids = []
            for role in request.data['user_roles']:
                role_ids.append(role['id'])
            self.user.user_roles.set(role_ids)

            role_set = self.check_cust_admin(request.data['user_roles'])
            if role_set:
                self.user.is_customer_admin = True
            self.user.save()

            ctype = ContentType.objects.get_for_model(model=User)
            add_m2m_audit_diff(role_ids, self.user.id, ctype.id, 'user_roles')
            # ULDBUserRolesPermissions.create()

            # For AuditLog - User and Access Type has M2M, so passing user.id arg
            access_types_id_list = []
            for access_type_ids in request.data['access_types']:
                access_types_id_list.append(access_type_ids['id'])

            ctype = ContentType.objects.get_for_model(model=User)
            add_m2m_audit_diff(access_types_id_list, self.user.id, ctype.id, 'access_types')

            return Response(serializer.data, status=status.HTTP_201_CREATED, )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None, *args, **kwargs):
        logger.debug("recv update request for userviewset: %s" % request.data)
        ctx = {'request': request}
        user = User.objects.get(pk=pk)

        # Create a copy of user to get diff from auditlog
        temp_user_obj = deepcopy(user)
        old_access_types_id_list = [item.id for item in user.access_types.all()]

        data = request.data
        ticket_group = data.get('ticket_group', [])
        serializer = UserDetailSerializer(user, context=ctx, data=data)
        if serializer.is_valid():
            self.user = serializer.save()
            self.user.ticket_group = ','.join(map(str, [grp['id'] for grp in ticket_group]))
            role_ids = []
            for role in request.data['user_roles']:
                role_ids.append(role['id'])
            self.user.user_roles.set(role_ids)

            role_set = self.check_cust_admin(request.data['user_roles'])
            if role_set:
                self.user.is_customer_admin = True
            else:
                self.user.is_customer_admin = False
            self.user.save()
            ctype = ContentType.objects.get_for_model(model=User)
            add_m2m_audit_diff(role_ids, self.user.id, ctype.id, 'user_roles')

            # For AuditLog
            new_access_types_id_list = []
            for access_type_ids in request.data['access_types']:
                new_access_types_id_list.append(access_type_ids['id'])

            update_m2m_audit_diff(old_access_types_id_list, new_access_types_id_list, temp_user_obj, self.user,
                                  'access_types', User)

            # if 'password' in data:
            #     raw_password = data['password']
            #     try:
            #         self.user.set_password(raw_password)
            #         self.user.is_email_verified = False
            #         self.user.save()
            #     except Exception as e:
            #         return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            #     #self.user.password = make_password(raw_password)
            #     #self.user.save()
            #     logger.info('User updated')
            # # Set user role and permission
            # #ULDBUserRolesPermissions.create()
            return Response(serializer.data, status=status.HTTP_200_OK, )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['GET'])
    def get_audit_data(self, request, *args, **kwargs):
        user = self.get_object()
        logger.debug("user requested audit data for %s" % user.email)
        ctx = {'request': request}
        sessions = user.ulusersession_set.all()
        serializer = ULUserSessionSerializer(sessions, context=ctx, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @list_route(methods=['GET'])
    def profile(self, request, *args, **kwargs):
        user = request.user
        ctx = {'request': request}
        if not user:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            release_version = settings.RELEASE_VERSION
            release_date = settings.RELEASE_DATE
            details = {
                'customer': OrganizationSerializer(user.org, context=ctx).data,
                'user_accesslist': AccessTypeSerializer(user.access_types, context=ctx, many=True).data,
                'release_version': release_version,
                'release_date': release_date,
                'last_login': user.last_login,
                'user_id': user.email,
                'has_two_factor': user_has_device(user),
                'user': UserSerializer(user, context=ctx).data
            }
            return Response(details, status=status.HTTP_200_OK)

    @list_route(methods=['GET'])
    def get_portal_access(self, request, *args, **kwargs):
        accesslist = AccessList.objects.filter(access_type='Portal Access')
        ctx = {'request': request}
        if not accesslist:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'access_list': AccessListSerializer(accesslist, context=ctx, many=True).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @detail_route(methods=['POST'])
    def change_password(self, request, pk=None, *args, **kwargs):
        logger.info('change password method')
        ctx = {'request': request}
        obj = self.get_object()
        # if request.method == 'GET':
        #     logger.debug('change password get method')
        #     details = {
        #         'user': UserSerializer(obj, context=ctx, ).data,
        #     }
        #     return Response(details, status=status.HTTP_200_OK)
        if request.method == 'POST':
            logger.debug('change password post method')
            # verify = True if request.user.is_email_verified else False
            force_verification = True
            return self._change_password(request, pk, force_verification)
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    @list_route(methods=['POST'])
    def change_own_password(self, request, *args, **kwargs):
        logger.debug("changing password for: %s" % request.user.email)
        return self._change_password(request=request, pk=request.user.pk)

    def _change_password(self, request, pk, force_verification=False):
        """
        Todo: This is horrible and needs a refactor.
        """
        old_pwd = None
        new_pwd_1 = None
        new_pwd_2 = None
        err_msg = []
        if pk:
            data = request.data
            user = request.user
            if 'old_password' in data:
                old_pwd = data['old_password']
            if 'new_password1' in data:
                new_pwd_1 = data['new_password1']
            if 'new_password2' in data:
                new_pwd_2 = data['new_password2']
            if not old_pwd:
                err_msg.append('Old password must be given. ')
            if not new_pwd_1 or not new_pwd_2:
                err_msg.append('New password must be given')
            if err_msg:
                return Response({'Error': err_msg}, status=status.HTTP_400_BAD_REQUEST)
            if new_pwd_1 != new_pwd_2:
                err_msg = "The two password fields didn't match."
                return Response({'Error': err_msg}, status=status.HTTP_400_BAD_REQUEST)
            # Check old password
            valid_old_pw = user.check_password(old_pwd)
            if not valid_old_pw:
                err_msg = "Your old password was entered incorrectly. Please enter it again."
                return Response({'Error': err_msg}, status=status.HTTP_400_BAD_REQUEST)
            else:
                try:
                    user.set_password(new_pwd_1)
                except Exception as e:
                    err_msg = str(e)
                    return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                # Set password expiry date in two weeks -> need to be discussed
                user.password_expiry = timezone.now() + datetime.timedelta(days=settings.DEFAULT_PASSWORD_EXPIRY)
                # TODO: not sure if this is the appropriate solution,
                # but is used to prevent change_password loop.
                # if not force_verification:
                #    user.is_email_verified = True
                logger.debug("set password expiry: %s" % user.password_expiry)
                user.save()
                logger.info('password updated')
                return Response({'detail': 'Password changed'}, status=status.HTTP_200_OK)

    @detail_route(methods=['POST'])
    def send_email_invitation(self, request, *args, **kwargs):
        """
        Receives a User object via POST.

        Generates an invitation object and sends an email asynchronously.
        """
        # create invitation token for user
        user = self.get_object()
        invitation = ULDBUserInvitation(user=user, pending=True)
        invitation.save()

        # build email and send it
        site = get_current_site(request)
        msg = settings.INVITATION_MESSAGE
        html_msg = settings.HTML_INVITATION_MESSAGE
        params = {
            'subject': settings.INVITATION_SUBJECT,
            'message': msg.format(site=site, invitation_token=invitation.token),
            'from_email': settings.DEFAULT_FROM_EMAIL,
            'recipient_list': [user.email],
            'html_message': html_msg.format(site=site, invitation_token=invitation.token),
        }
        sent = send_mail(**params)
        logger.debug("Sent invitation email to {recipient_list}. Result: %s".format(**params) % sent)
        response_data = UserDetailSerializer(self.get_object(), context={'request': request}).data
        return Response(data=response_data, status=status.HTTP_202_ACCEPTED)

    @list_route(methods=['POST'])
    def send_bulk_email_invitation(self, request, *args, **kwargs):
        """
        Receives a User object via POST.

        Generates an invitation object and sends an email asynchronously.
        """
        # create invitation token for user
        site = get_current_site(request)
        msg = settings.INVITATION_MESSAGE
        html_msg = settings.HTML_INVITATION_MESSAGE
        user_id_list = request.data['data']
        for user_id in user_id_list:
            try:
                user = User.objects.get(id=user_id['id'])
                invitation = ULDBUserInvitation(user=user, pending=True)
                invitation.save()
                params = {
                    'subject': settings.INVITATION_SUBJECT,
                    'message': msg.format(site=site, invitation_token=invitation.token),
                    'from_email': settings.DEFAULT_FROM_EMAIL,
                    'recipient_list': [user.email],
                    'html_message': html_msg.format(site=site, invitation_token=invitation.token),
                }
                send_mail(**params)
            except Exception as error:
                logger.error("Error while fetching user:{}".format(error))
        return Response({"data": "Invitation sent successfully"}, status=status.HTTP_200_OK)


class ForgetPasswordViewSet(viewsets.ViewSet):
    permission_classes = (AllowAny,)

    @list_route(methods=['POST'])
    def forget_password(self, request, *args, **kwargs):
        logger.debug("shcgvjhdch")
        logger.info('Forgot password method')
        # ctx = {'request': request}
        if request.method == 'POST':
            email = request.POST.get('email', None)
            if email:
                user_check = User.objects.filter(email=email)
                if len(user_check) == 0:
                    return Response({'error': "This email id does not exist in our database."},
                                    status=status.HTTP_400_BAD_REQUEST)
                try:
                    user = user_check[0]
                    invitation = ULDBUserInvitation(user=user, pending=True)
                    invitation.save()

                    # build email and send it
                    site = get_current_site(request)
                    html_msg_file = 'base/invitation/reset_password.html'
                    html_msg = render_to_string(html_msg_file, {'context': 'values'})
                    plain_message = strip_tags(html_msg)
                    params = {
                        'subject': settings.FORGOT_PASSWORD_SUBJECT,
                        'message': plain_message.format(site=site, invitation_token=invitation.token),
                        'from_email': settings.DEFAULT_FROM_EMAIL,
                        'recipient_list': [user.email],
                        'html_message': html_msg.format(site=site, invitation_token=invitation.token),
                    }
                    send_mail(**params)
                except Exception as error:
                    logger.error(error)
                    return Response({'error': "Error while sending the forgot password link"},
                                    status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': "Please Enter Email address"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"data": "Invitation sent successfully"}, status=status.HTTP_200_OK)


def email_validate_list(email):
    if User.objects.filter(email=email).exists():
        message = "You already have Unity account! Please contact support at support@unityonecloud.com"
        return (False, message)
    if DemoTrialRequestToken.objects.filter(requestor_email=email).count() > 3:
        message = "Inivitation to Unity is already sent to your Email! Please Check your email."
        return (False, message)
    email_domain = email.split('@')[1].split('.')[0]
    if email_domain in settings.BLACK_LIST_EMAIL_COMPETITORS:
        # Send Email for BlackList
        logger.debug("Black list email %s", email)
        message = "Thank you for your request! Our team will reach out to you shortly."
        return (False, message)
    else:
        try:
            usr = User.objects.get(email=email)
            if usr.org.organization_type == "DEMO":
                # Send Email already using Demo Email
                message = "You already have Demo Account! Please check your Email or contact support at support@unityonecloud.com"
                return (False, message)
            if usr.trial_account:
                # Send Email already using Free Trial Email
                message = "You already have Free Trial Access! Please check your Email or contact support at support@unityonecloud.com"
                return (False, message)
        except User.DoesNotExist:
            return (True, None)
    # Create User and send email
    return (True, None)


def send_email_to_sales(request, subject, data, request_type, html_msg_file):
    try:
        logger.info("Sending Email to Sales")
        # build email and send it
        site = get_current_site(request)
        html_msg = render_to_string(html_msg_file, {'data': data, 'request_type': request_type})
        logger.debug("HTML MESSAGE : %s", html_msg)
        plain_message = strip_tags(html_msg)
        logger.debug("Sales Email - %s", settings.SALES_EMAIL)
        params = {
            'subject': subject,
            'message': plain_message.format(site=site),
            'from_email': settings.DEFAULT_FROM_EMAIL,
            'recipient_list': [settings.SALES_EMAIL],
            'html_message': html_msg.format(site=site),
        }
        logger.debug("EMAIL PARAMS : %s", params)
        sent = send_mail(**params)
        logger.debug("Sent invitation email to {recipient_list}. Result: %s".format(**params) % sent)
        return sent
    except Exception as e:
        logger.error('Error in sales invitation email -%s', e)
        return None


def send_demo_trial_emails(request, email, first_name, subject, invitation, account_validity, html_msg_file):
    try:
        # build email and send it
        site = get_current_site(request)
        html_msg = render_to_string(html_msg_file, {'context': 'values'})
        logger.debug("HTML MESSAGE : %s", html_msg)
        plain_message = strip_tags(html_msg)
        params = {
            'subject': subject,
            'message': plain_message.format(site=site, invitation_token=invitation.token, first_name=first_name,
                                            validity=account_validity),
            'from_email': settings.DEFAULT_FROM_EMAIL,
            'recipient_list': [email],
            # 'recipient_list': ["psorab@unitedlayer.com"],
            'html_message': html_msg.format(site=site, invitation_token=invitation.token, first_name=first_name,
                                            validity=account_validity),
        }
        logger.debug("EMAIL PARAMS : %s", params)
        sent = send_mail(**params)
        logger.debug("Sent invitation email to {recipient_list}. Result: %s".format(**params) % sent)
        return sent
    except Exception as e:
        logger.error('Error in sending invitation email - %s', e)
        return None


def request_demo(request):
    if request.method == "GET":
        form = DemoRequestForm()
        return render(request, 'base/demo-request/demo.html', {'form': form})
    elif request.method == "POST":
        logger.debug("POST : %s", request.POST)
        form = DemoRequestForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            # email_domain = email.split('@')[1].split('.')[0]
            first_name = form.cleaned_data['first_name']
            last_name = form.cleaned_data['first_name']
            phone_number = form.cleaned_data['phone_number']
            company_name = form.cleaned_data['company_name']
            job_title = form.cleaned_data['job_title']
            user_data = {
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'phone_number': phone_number,
                'company_name': company_name,
                'job_title': job_title
            }

            email_not_present, response_message = email_validate_list(email)
            if email_not_present:
                invitation = DemoTrialRequestToken(
                    user_data=user_data,
                    requestor_email=email,
                    account_type="DEMO",
                    pending=True
                )
                invitation.save(expiration_days=7)
                logger.debug("Invitaion : %s", invitation)
                subject = "Welcome to Unity - Demo"
                send_demo_trial_emails(request, email, first_name, subject, invitation, settings.DEMO_ACCOUNT_VALIDITY,
                                       "base/invitation/demo_invite.html")
                message = "Thank you for requesting Demo! Please check your email for accessing Unity"
                sales_subject = "Unity Demo Request - {}".format(email)
                send_email_to_sales(request, sales_subject, user_data, 'Demo', "base/invitation/sales_email.html")
            else:
                message = response_message
            return render(request, 'base/demo-request/demo.html', {'form': DemoRequestForm(), 'message': message})
    return render(request, 'base/demo-request/demo.html', {'form': form})


def request_trial(request):
    template_path = 'base/trial-request/trial.html'
    if request.method == "GET":
        form = FreeTrailRequestForm()
        return render(request, template_path, {'form': form})
    elif request.method == "POST":
        logger.debug("POST : %s", request.POST)
        form = FreeTrailRequestForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            # email_domain = email.split('@')[1].split('.')[0]

            first_name = form.cleaned_data['first_name']
            last_name = form.cleaned_data['first_name']
            phone_number = form.cleaned_data['phone_number']
            company_name = form.cleaned_data['company_name']
            job_title = form.cleaned_data['job_title']

            email_not_present, response_message = email_validate_list(email)
            if email_not_present:
                invitation = DemoTrialRequestToken(
                    user_data=request.POST,
                    requestor_email=email,
                    account_type="TRIAL",
                    pending=True
                )
                invitation.save(expiration_days=7)
                logger.debug("Invitaion : %s", invitation)
                subject = "Welcome to Unity Free Trial"
                send_demo_trial_emails(request, email, first_name, subject, invitation, settings.TRIAL_ACCOUNT_VALIDITY,
                                       "base/invitation/trial_invite.html")
                message = "Thank you for requesting trial! Please check your email for accessing Unity"

                data = {
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'phone_number': phone_number,
                    'company_name': company_name,
                    'job_title': job_title
                }
                sales_subject = "Free Trial Request - {}".format(email)
                send_email_to_sales(request, sales_subject, data, 'Free Trial', "base/invitation/sales_email.html")
            else:
                message = response_message
            return render(request, template_path, {'form': FreeTrailRequestForm(), 'message': message})
    return render(request, template_path, {'form': form})


from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from hijack.decorators import hijack_decorator, hijack_require_http_methods
from django.contrib.auth import login
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from compat import get_user_model
from hijack import settings as hijack_settings
from hijack.signals import hijack_started, hijack_ended
from hijack.helpers import check_hijack_authorization, get_used_backend, no_update_last_login, redirect_to_next
from django.core.exceptions import PermissionDenied
from app.session.models import ULUserSession
from importlib import import_module

@hijack_decorator
@hijack_require_http_methods
def custom_login_with_id(request, user_id):
    try:
        user_id = int(user_id)
    except ValueError:
        return HttpResponseBadRequest('user_id must be an integer value.')
    
    user = get_object_or_404(get_user_model(), pk=user_id)
    
    # Call your custom login_user function
    return custom_login_user(request, user)

def custom_login_user(request, user):
    # Your custom logic for login_user
    # You can call the original login_user function if needed
    result = custom_login_user(request, user)
    
    # Modify 'result' or add custom logic here
    return result

def custom_login_user(request, hijacked):
    ''' hijack mechanism '''
    hijacker = request.user
    hijack_history = [request.user._meta.pk.value_to_string(hijacker)]
    if request.session.get('hijack_history'):
        hijack_history = request.session['hijack_history'] + hijack_history

    check_hijack_authorization(request, hijacked)

    backend = get_used_backend(request)
    hijacked.backend = "%s.%s" % (backend.__module__, backend.__class__.__name__)
    
    session_key = request.COOKIES.get(settings.SESSION_COOKIE_NAME, None)

    session = ULUserSession.objects.get(session_key=session_key)
    decoded = session.get_decoded()
    SessionStore = import_module(settings.SESSION_ENGINE).SessionStore
    new_session = SessionStore()
    new_session._session_cache = decoded
    new_session.save(True)
    request.session = new_session

    with no_update_last_login():
        login(request, hijacked)

    hijack_started.send(sender=None, hijacker_id=hijacker.pk, hijacked_id=hijacked.pk, request=request)
    request.session['hijack_history'] = hijack_history
    request.session['is_hijacked_user'] = True
    request.session['display_hijack_warning'] = True
    request.session['is_multi_hijack'] = True
    request.session.modified = True
    response = redirect_to_next(request, default_url=hijack_settings.HIJACK_LOGIN_REDIRECT_URL)
    return response

def custom_release_hijack(request):
    hijack_history = request.session.get('hijack_history', False)

    if not hijack_history:
        raise PermissionDenied

    hijacker = None
    hijacked = None
    if hijack_history:
        hijacked = request.user
        user_pk = hijack_history.pop()
        hijacker = get_object_or_404(get_user_model(), pk=user_pk)
        backend = get_used_backend(request)
        hijacker.backend = "%s.%s" % (backend.__module__, backend.__class__.__name__)
        SessionStore = import_module(settings.SESSION_ENGINE).SessionStore
        session_key = request.COOKIES.get(settings.SESSION_COOKIE_NAME, None)
        with no_update_last_login():
            request.session.flush()
        SessionStore(session_key=session_key).delete()
        hijack_ended.send(sender=None, hijacker_id=hijacker.pk, hijacked_id=hijacked.pk, request=request)
    
    response = HttpResponseRedirect('/close-base/')
    response.delete_cookie('sessionid')
    response.delete_cookie('PROXY_ID')
    response.delete_cookie('csrftoken')
    return response

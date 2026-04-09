from __future__ import unicode_literals
from django import forms
from django.conf import settings


class DemoRequestForm(forms.Form):
    """docstring for DemoRequestForm"""

    def __init__(self, *args, **kwargs):
        super(DemoRequestForm, self).__init__(*args, **kwargs)
        # for field_name in self.fields:
        #     field = self.fields.get(field_name)
        #     if field:
        #         field.widget = forms.TextInput(
        #             attrs={
        #                 'placeholder': field.label,
        #                 'class': 'form-control form-value'
        #             }
        #         )

    first_name = forms.CharField(
        label='First Name', max_length=100, required=True
    )
    last_name = forms.CharField(
        label='Last Name', max_length=100, required=True
    )
    email = forms.EmailField(
        label='Email', max_length=100, required=True
    )
    phone_number = forms.CharField(
        label='Phone Number', max_length=100, required=True
    )
    company_name = forms.CharField(
        label='Company Name', max_length=150, required=True
    )
    job_title = forms.CharField(
        label='Job Title', max_length=150, required=True
    )

    def clean_email(self):
        email = self.cleaned_data['email']
        if any(s in email for s in settings.BLACK_LIST_EMAIL_DOMAINS):
            raise forms.ValidationError(
                "Please enter a valid work email!"
            )
        return email

    def clean_phone_number(self):
        phone_number = self.cleaned_data['phone_number']
        for i in phone_number:
            if i.isalpha():
                raise forms.ValidationError("Please enter valid phone number")
        return phone_number


class FreeTrailRequestForm(forms.Form):
    """docstring for DemoRequestForm"""

    def __init__(self, *args, **kwargs):
        super(FreeTrailRequestForm, self).__init__(*args, **kwargs)
        # for field_name in self.fields:
        #     field = self.fields.get(field_name)
        #     if field:
        #         field.widget = forms.TextInput(
        #             attrs={
        #                 'placeholder': field.label,
        #                 'class': 'form-control form-value'
        #             }
        #         )

    first_name = forms.CharField(
        label='First Name', max_length=100, required=True
    )
    last_name = forms.CharField(
        label='Last Name', max_length=100, required=True
    )
    email = forms.EmailField(
        label='Email', max_length=100, required=True
    )
    phone_number = forms.CharField(
        label='Phone Number', max_length=100, required=True
    )
    company_name = forms.CharField(
        label='Company Name', max_length=150, required=True
    )
    job_title = forms.CharField(
        label='Job Title', max_length=150, required=True
    )

    def clean_email(self):
        email = self.cleaned_data['email']
        if any(s in email for s in settings.BLACK_LIST_EMAIL_DOMAINS):
            raise forms.ValidationError(
                "Please enter your organization email!"
            )
        return email

    def clean_phone_number(self):
        phone_number = self.cleaned_data['phone_number']
        for i in phone_number:
            if i.isalpha():
                raise forms.ValidationError("Please enter valid phone number")
        return phone_number

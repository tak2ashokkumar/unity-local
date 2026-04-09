from django.core.exceptions import ValidationError
from django import forms

from app.group.models import Groups


class GroupsForm(forms.ModelForm):

    class Meta:
        model = Groups
        exclude = ('created_user', 'modified_user')

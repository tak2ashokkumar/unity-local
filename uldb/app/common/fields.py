"""
    fields.py

"""
from __future__ import absolute_import
from __future__ import unicode_literals

from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import JSONField

from Crypto.Cipher import AES
from Crypto import Random

from base64 import b64encode, b64decode


class NullableCharField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs['null'] = True
        kwargs['blank'] = True
        super(NullableCharField, self).__init__(*args, **kwargs)


def _aes_key(keyname):
    full_key = getattr(settings, keyname, None)
    return str(bytearray(full_key, 'utf8')[:32])


def _pad_aes(input):
    BLK_LEN = 16
    return input + ((BLK_LEN << 1) - (len(input) % BLK_LEN)) * '\0'


class EncryptedPasswordField(JSONField):
    description = "An automatically encrypting field."

    def __init__(self, encryption_key=None, *args, **kwargs):
        """
        Expects 'encryption_key' to be set, which should be equal to the property in settings.py that specifies the encryption_key.
        Defaults to 'SECRET_KEY'
        """
        self.encryption_key = encryption_key
        if encryption_key is None:
            self.encryption_key = 'SECRET_KEY'
        super(EncryptedPasswordField, self).__init__(*args, **kwargs)

    def get_prep_value(self, value):
        """
        Prepare the value before it hits db.
        """
        rndfile = Random.new()
        iv = rndfile.read(16)
        aes_key = _aes_key(self.encryption_key)
        cipher = AES.new(aes_key, AES.MODE_CBC, iv)
        if value:
            if isinstance(value, unicode):
                value = value.encode('utf-8')
            padded_value = _pad_aes(value)
            m = cipher.encrypt(padded_value)
            result = {
                'iv': b64encode(iv),
                'm': b64encode(m)
            }
        else:
            result = None
        return super(EncryptedPasswordField, self).get_prep_value(result)

    def from_db_value(self, value, expression, connection, context):
        if value is None:
            return value
        return self.to_python(value)

    def to_python(self, value):
        """
        Extract value from db. Assuming value is NOT Python already.
        Decrypts and decodes the value using AES (CBC) and multiple fallbacks.
        """
        obj = super(EncryptedPasswordField, self).to_python(value)
        if not obj or not isinstance(obj, dict) or 'iv' not in obj or 'm' not in obj:
            return None

        try:
            aes_key = _aes_key(self.encryption_key)
            cipher = AES.new(aes_key, AES.MODE_CBC, b64decode(obj['iv']))
            message_padded = cipher.decrypt(b64decode(obj['m']))
            message = message_padded.rstrip(b'\0')

            for encoding in ['utf-8', 'windows-1252', 'latin-1', 'iso-8859-15']:
                try:
                    return message.decode(encoding)
                except UnicodeDecodeError:
                    continue

            return message  # Fallback: return raw bytes
        except Exception:
            return None  # Fallback: general failure

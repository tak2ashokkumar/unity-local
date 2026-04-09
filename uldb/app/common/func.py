# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#   All Rights Reserved.

"""func.py
"""

import uuid
from integ.salesforce.sftools import casesafeid


def _fix_salesforce(model_inst):
    if hasattr(model_inst, 'salesforce_id'):
        if not model_inst.salesforce_id:
            model_inst.salesforce_id = None
        else:
            model_inst.salesforce_id = casesafeid(model_inst.salesforce_id)
    return model_inst


def generate_uuid():
    return uuid.uuid4()

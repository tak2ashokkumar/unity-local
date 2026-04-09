from django.contrib.staticfiles.storage import ManifestStaticFilesStorage
from pipeline.storage import PipelineMixin
from django.conf import settings
import os


class PipelineManifestStorage(PipelineMixin, ManifestStaticFilesStorage):
    pass

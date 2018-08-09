from oslo_utils import importutils

import base_action
import json
import logging
import os
LOG = logging.getLogger(__name__)

class CheckpointAction(base_action.BaseAction):
    @staticmethod
    def execute(session,request):
       pass
    @staticmethod
    def importcheck(data=None):
        try:
            return True
        except ImportError:
            LOG.warning('Failed to import Checkpoint')

    @staticmethod
    def getinfo(session, request=None):
        filters = {}
        try:
            pass

        except ImportError:
            LOG.warning('Failed to import Checkpoint')
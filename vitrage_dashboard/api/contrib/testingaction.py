from oslo_utils import importutils

import base_action
import json
import logging
import os
LOG = logging.getLogger(__name__)

class TestingAction(base_action.BaseAction):
    @staticmethod
    def execute(session,request):
          url = 'curl -X POST http://127.0.0.1:5050/' + 'Test' + '/' + str(request)
          os.system(url)
    @staticmethod
    def importcheck(data=None):
        try:
            return True
        except ImportError:
            LOG.warning('Failed to import Testing')

    @staticmethod
    def getinfo(session, request=None):
        filters = {}
        try:
            pass

        except ImportError:
            LOG.warning('Failed to import Testing')

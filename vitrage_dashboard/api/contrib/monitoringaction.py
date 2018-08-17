from oslo_utils import importutils

import base_action
import json
import logging
import os
LOG = logging.getLogger(__name__)

class MonitoringAction(base_action.BaseAction):
    @staticmethod
    def execute(session,request):
        print("request      ",request)
        print("type ",type(request))
        new_request= request.replace('{','').replace('}','')
        action = u",\"action\":\"Monitoring\""
        total_request ="{" + new_request + action +"}"
        print("####### ",total_request)
        url = 'curl -i -H \"Content-Type: application/json\" -X POST -d '+'\'' + total_request +'\'' +' http://127.0.0.1:5050/Test'
        print("url      ",url)
        os.system(url)
    @staticmethod
    def importcheck(data=None):
        try:
            return True
        except ImportError:
            LOG.warning('Failed to import Monitoring')

    @staticmethod
    def getinfo(session, request=None):
        filters = {}
        try:
            pass

        except ImportError:
            LOG.warning('Failed to import Monitoring')

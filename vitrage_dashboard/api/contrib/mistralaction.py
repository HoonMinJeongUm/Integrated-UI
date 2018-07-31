from openstack_dashboard.api import base
from oslo_utils import importutils

import ast
import base_action
import logging
LOG = logging.getLogger(__name__)

class MistralAction(base_action.BaseAction):
    @staticmethod
    def execute(session,data):
        try:
            from mistralclient.api import client as mistral_client
        except ImportError:
            mistral_client = None

        if mistral_client is None:
            LOG.warning('Failed to import mistralclient')
        else:
            mistralcli = mistral_client.client(session=session)
            new_request = ast.literal_eval(data)
            actionname = new_request.keys()
            workflow_input = new_request[actionname[0]]
            mistralcli.executions.create(actionname[0],
                                         workflow_input=workflow_input)

    @staticmethod
    def importcheck(data=None):
        result = base.is_service_enabled(data, 'workflowv2')
        return result

    @staticmethod
    def getinfo(session,request=None):
        try:
            mistral_client = \
                importutils.try_import("mistralclient.api.client")

            if mistral_client is None:
                raise ImportError

            mistralcli = mistral_client.client(session=session)
            work_list = mistralcli.workflows.list()
            work_dict = {}
            work_cont = []
            for work in work_list:
                work_dict[str(work.name)] = \
                    str(work.input).replace(" ", "").split(',')
            work_cont.append(work_dict)
            return work_cont
        except ImportError:
            LOG.warning('Failed to import mistralclient')
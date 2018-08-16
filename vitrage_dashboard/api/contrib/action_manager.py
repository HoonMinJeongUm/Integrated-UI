from oslo_utils import importutils

import logging
LOG = logging.getLogger(__name__)

class ActionManager():
    def __init__(self):
        pass
    @staticmethod
    def importcheck(case,data=None):
        try:
            actionmodule = \
                importutils.try_import("vitrage_dashboard.api.contrib." + case + "action")
            action = getattr(actionmodule, case.capitalize() + "Action")

            if actionmodule is None:
                raise ImportError

            return action.importcheck(data)
        except ImportError:
            LOG.warning('Cannot find action library')
            return None

    @staticmethod
    def getinfo(session,case,data=None):
        try:
            actionmodule = \
                importutils.try_import("vitrage_dashboard.api.contrib." + case.lower() + "action")
            action = getattr(actionmodule, case.capitalize() + "Action")

            if actionmodule is None:
                raise ImportError

            return action.getinfo(session,data)
        except ImportError:
            LOG.warning('Cannot find action library')
            return None

    @staticmethod
    def execute(session,case,data=None):
        try:
            print("############################## ",case)
            actionmodule = \
                importutils.try_import("vitrage_dashboard.api.contrib." + case.lower() + "action")
            action = getattr(actionmodule, case.capitalize() + "Action")

            if actionmodule is None:
                raise ImportError

            return action.execute(session,data)
        except ImportError:
            LOG.warning('Cannot find action library')
            return None






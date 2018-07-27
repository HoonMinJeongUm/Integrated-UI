from oslo_utils import importutils

import base_action
import json
import logging
import os
LOG = logging.getLogger(__name__)

class RallyAction(base_action.BaseAction):
    @staticmethod
    def execute(session,request):
        try:
            from rally import api as rally_api
        except ImportError:
            rally_api = None

        try:
            from rally.cli.commands import task as rally_task
        except ImportError:
            rally_task = None

        if rally_api is None or rally_task is None:
            LOG.warning('Failed to import Rally')
        else:
            temp_dict = json.loads(request)
            key = temp_dict.keys()
            if not temp_dict['syntaxcheck']:
                key.remove('syntaxcheck')
                file_path = './' + key[0] + '.json'
                with open(file_path, 'w') as make_file:
                    json.dump(temp_dict[key[0]], make_file)

                rally_task.TaskCommands().start(rally_api.API(),
                                                file_path,
                                                tags=['Vitrage', key[0]])
                os.remove(file_path)

            else:
                key.remove('syntaxcheck')
                file_path = './' + key[0] + '.json'
                with open(file_path, 'w') as make_file:
                    json.dump(temp_dict[key[0]], make_file)
                rally_task.TaskCommands().validate(rally_api.API(), file_path)

                os.remove(file_path)


    @staticmethod
    def importcheck(data=None):
        try:
            rally_version = \
                importutils.try_import("rally.common.version")

            if rally_version is None:
                raise ImportError

            return rally_version.version_string()
        except ImportError:
            LOG.warning('Failed to import Rally')

    @staticmethod
    def getinfo(session, request=None):
        filters = {}
        try:
            try:
                from rally import api as rally_api
            except ImportError:
                rally_api = None

            try:
                from rally.cli.commands import task as rally_task
            except ImportError:
                rally_task = None

            if rally_api is None or rally_task is None:
                raise ImportError

            task_list = []
            filters["tags"] = ['Vitrage']
            rally_tasklist = rally_api.API().task.list(**filters)

            for l_value in rally_tasklist:
                task_list.append(l_value['uuid'])

            out_path = './static/dashboard/project/' \
                       'components/actions/vitrage.html'
            if task_list:
               rally_task.TaskCommands().report(rally_api.API(),
                                                 task_list,
                                                out=out_path)
        except ImportError:
            LOG.warning('Failed to import Rally')
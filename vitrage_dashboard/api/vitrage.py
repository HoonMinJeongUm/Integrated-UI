# Copyright 2015 - Alcatel-Lucent
#
# Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

"""
https://docs.openstack.org/horizon/latest/contributor/tutorials/plugin.html
"""

""" This file will likely be necessary if creating a Django or Angular driven
    plugin. This file is intended to act as a convenient location for
    interacting with the new service this plugin is supporting.
    While interactions with the service can be handled in the views.py,
    isolating the logic is an established pattern in Horizon.
"""

from horizon.utils.memoized import memoized  # noqa
from keystoneauth1.identity.generic.token import Token
from keystoneauth1.session import Session
from openstack_dashboard.api import base
from oslo_utils import importutils
from vitrageclient import client as vitrage_client

import ast
import ConfigParser
import json
import logging
import os
LOG = logging.getLogger(__name__)


@memoized
def vitrageclient(request, password=None):
    endpoint = base.url_for(request, 'identity')
    token_id = request.user.token.id
    tenant_name = request.user.tenant_name
    project_domain_id = request.user.token.project.get('domain_id', 'Default')
    auth = Token(auth_url=endpoint, token=token_id,
                 project_name=tenant_name,
                 project_domain_id=project_domain_id)
    session = Session(auth=auth, timeout=600)
    return vitrage_client.Client('1', session)


def topology(request, query=None, graph_type='tree', all_tenants='false',
             root=None, limit=None):
    LOG.info("--------- CALLING VITRAGE_CLIENT ---request %s", str(request))
    LOG.info("--------- CALLING VITRAGE_CLIENT ---query %s", str(query))
    LOG.info("------ CALLING VITRAGE_CLIENT --graph_type %s", str(graph_type))
    LOG.info("---- CALLING VITRAGE_CLIENT --all_tenants %s", str(all_tenants))
    LOG.info("--------- CALLING VITRAGE_CLIENT --------root %s", str(root))
    LOG.info("--------- CALLING VITRAGE_CLIENT --------limit %s", str(limit))
    return vitrageclient(request).topology.get(query=query,
                                               graph_type=graph_type,
                                               all_tenants=all_tenants,
                                               root=root,
                                               limit=limit)


def alarms(request, vitrage_id='all', all_tenants='false'):
    return vitrageclient(request).alarm.list(vitrage_id=vitrage_id,
                                             all_tenants=all_tenants)


def alarm_counts(request, all_tenants='false'):
    counts = vitrageclient(request).alarm.count(all_tenants=all_tenants)
    counts['NA'] = counts.get("N/A")
    return counts


def rca(request, alarm_id, all_tenants='false'):
    return vitrageclient(request).rca.get(alarm_id=alarm_id,
                                          all_tenants=all_tenants)


def templates(request, template_id='all'):
    if template_id == 'all':
        return vitrageclient(request).template.list()
    return vitrageclient(request).template.show(template_id)


def actions(request, action, nodetype):
    endpoint = base.url_for(request, 'identity')
    token_id = request.user.token.id
    tenant_name = request.user.tenant_name
    project_domain_id = request.user.token.project.get('domain_id', 'Default')
    auth = Token(auth_url=endpoint, token=token_id,
                 project_name=tenant_name,
                 project_domain_id=project_domain_id)
    session = Session(auth=auth, timeout=600)
    filters = {}
    if str(action) == 'Mistral':
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
    elif str(action) == 'Rally':
        try:
            rally_api = \
                importutils.try_import("rally.api")

            rally_task = \
                importutils.try_import("rally.cli.commands.task")

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


def action_request(request, action, requestdict):
    endpoint = base.url_for(request, 'identity')
    token_id = request.user.token.id
    tenant_name = request.user.tenant_name
    project_domain_id = request.user.token.project.get('domain_id', 'Default')
    auth = Token(auth_url=endpoint, token=token_id,
                 project_name=tenant_name,
                 project_domain_id=project_domain_id)

    session = Session(auth=auth, timeout=600)
    if str(action) == 'Mistral':
        try:
            from mistralclient.api import client as mistral_client
        except ImportError:
            mistral_client = None

        if mistral_client is None:
            LOG.warning('Failed to import mistralclient')
        else:
            mistralcli = mistral_client.client(session=session)
            new_request = ast.literal_eval(requestdict)
            actionname = new_request.keys()
            workflow_input = new_request[actionname[0]]
            mistralcli.executions.create(actionname[0],
                                         workflow_input=workflow_input)

    elif str(action) == 'Rally':

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
            temp_dict = json.loads(requestdict)
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


def action_setting(request):
    setting = ConfigParser.ConfigParser()
    setting.read('/etc/vitrage-dashboard/setting.conf')
    actiondict = {'mistral': 'Mistral',
                  'rally': 'Rally',
                  'checkpoint': 'Checkpoint',
                  'monitoring': 'Monitoring',
                  'testing': 'Testing'
                  }
    actionlist = []
    urllist = {}
    if setting.has_section('Default'):
        if setting.has_option('Default', 'actions'):
            conf_actions = setting.get('Default', 'actions').split(',')

            for section in conf_actions:
                result = None
                if section != 'mistral' and section != 'rally' and section != 'checkpoint' and section != 'testing' and section != 'monitoring':
                    if setting.has_section(section):
                        option_list = setting.options(section)
                        matching = [pro for pro in option_list
                                    if ('url' in pro)]
                        if matching:
                            urllist[section] = setting.get(section,
                                                           matching[0])

                elif section == 'checkpoint':
                    result = 'true'
                elif section == 'monitoring':
                    result = 'true'
                elif section == 'testing':
                    result = 'true'
                elif section == 'mistral':
                    result = base.is_service_enabled(request, 'workflowv2')
                elif section == 'rally':
                    try:
                        rally_version = \
                            importutils.try_import("rally.common.version")

                        if rally_version is None:
                            raise ImportError

                        result = rally_version.version_string()
                    except ImportError:
                        LOG.warning('Failed to import Rally')

                if result:
                    actionlist.append(actiondict[section])
        return [actionlist, urllist]

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
from keystoneauth1.identity import v3
from openstack_dashboard.api import base
from vitrageclient import client as vitrage_client
from contrib import action_manager

import ConfigParser
import logging
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
    result = action_manager.ActionManager.getinfo(session, str(action),request)
    return result

def action_request(request, action, requestdict):
    endpoint = base.url_for(request, 'identity')
    token_id = request.user.token.id
    tenant_name = request.user.tenant_name
    project_domain_id = request.user.token.project.get('domain_id', 'Default')
    auth = Token(auth_url=endpoint, token=token_id,
                 project_name=tenant_name,
                 project_domain_id=project_domain_id)

    session = Session(auth=auth, timeout=600)
    result = action_manager.ActionManager.execute(session, str(action),requestdict)
    return result

def action_setting(request):
    setting = ConfigParser.ConfigParser()
    setting.read('/etc/vitrage-dashboard/setting.conf')
    actionlist = []
    urllist = {}
    if setting.has_section('Default'):
        if setting.has_option('Default', 'actions'):
            conf_actions = setting.get('Default', 'actions').split(',')

            for section in conf_actions:
                result = None
                if setting.has_section(section):
                    option_list = setting.options(section)
                    matching = [pro for pro in option_list
                                if ('url' in pro)]
                    if matching:
                        urllist[section] = setting.get(section,
                                                           matching[0])
                else:
                    result = action_manager.ActionManager.importcheck(section,request)

                if result:
                    actionlist.append(section.capitalize())
        return [actionlist, urllist]




===============================
Action List Panel Configuration
===============================

Specs
-----

We can see more details on the action list panel and several actions in the spec below.
https://review.openstack.org/#/c/531141/

Configuring setting.conf
------------------------

The user can configure the desired action list via the setting.conf file of Vitrage-dashboard.
If we add a specific action to setting.conf and do not **have an environment(e.g. Mistral, Rally)**
ready for these actions, Vitrage-dashboard will not automatically add an action list.
Mistral and Rally do not have separate sessions, and we can use them just by specifying them
in actions.

The following should be set in /etc/vitrage-dashboard/setting.conf :

Format
++++++
.. code-block:: ini

  [Default]
  actions = [action list]

  [monitoring tool name]
  url = [monitoring tool URL]

.. end

Example
+++++++
.. code-block:: ini

  [Default]
  actions = mistral,rally,zabbix,nagios

  [zabbix]
  url = http://192.168.10.13/zabbix

  [nagios]
  url = http://192.168.10.12/nagios

.. end


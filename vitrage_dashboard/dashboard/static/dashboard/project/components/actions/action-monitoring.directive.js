angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzActionsMonitoring', hzActionsMonitoring);

function hzActionsMonitoring() {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/components/actions/action-monitoring.html',
        restrict: 'E'
    };
    return directive;

      function link(scope) {
        scope.monitortool = ["Zabbix","Nagios"];
        scope.hosttype = ["Nova_host","Nova_instance"];
        scope.tool = {"Zabbix":["Zabbix_Server_IP","Zabbix_Server_Port","Zabbix_Server_Password","Zabbix_Server_User", "Zabbix_Host_Name"], "Nagios":["what"]}
        scope.host = {"Nova_host":["Host_IP","Host_ID", "Host_Interface_Name"],"Nova_instance":["VM_IP", "VM_ID", "VM_Interface_Name"]}
        scope.info = ["Ssh_username","Ssh_password", "App_name","App_port"];
        scope.status = ["true","false"];
        scope.memory = ["true","false"];
        scope.agentinfo = ["true","false"];
        scope.procvalue = ["true","false"];
        scope.load = ["true","false"];
        scope.usage = ["true","false"];

        scope.getInput = function (workflow_para) {

            if(workflow_para.match('=') == null){
                return 'true'
            }else{
                return 'false'
            }
        };

        scope.getData = function (selectedMonitor, selectedHost, selectedStatus, selectedMemory, selectedAgent, selectedValue, selectedLoad, selectedUsage) {
             var requestDict={};
             for (var i=0; i<scope.tool[selectedMonitor].length; i++){
                 var inputValue  = $('#'+scope.tool[selectedMonitor][i]).val();
                 console.log("YYYYYYY",inputValue);
                 requestDict[scope.tool[selectedMonitor][i]]=inputValue;
             }

              for (var i=0; i<scope.host[selectedHost].length; i++){
                 var inputValue  = $('#'+scope.host[selectedHost][i]).val();
                 console.log("XXXXXX ",inputValue);
                 requestDict[scope.host[selectedHost][i]]=inputValue;
             }

             for (var i=0; i<scope.info.length; i++){
                 var inputValue  = $('#'+scope.info[i]).val();
                 console.log("YYYYYYY",inputValue);
                 requestDict[scope.info[i]]=inputValue;
             }

             if (selectedMonitor == 'Zabbix'){
                 requestDict['monitoring_tool']='Zabbix';
             }
             else{
                 requestDict['monitoring_tool']='Nagios';
             }

             if(selectedHost == 'Nova_host'){
                 requestDict['Zabbix_Host_Type']='Nova_host';
             }
             else{
                 requestDict['Zabbix_Host_Type']='Nova_instance';
             }

             if (selectedStatus=='true') {
                 var inputValue = $('#' + 'status_condition').val();
                 requestDict['app_status']='true';
                 requestDict['status_condition'] = inputValue;
             }
             else{
                 requestDict['app_status']='false';
             }

             if (selectedMemory=='true') {
                 var inputValue = $('#' + 'memory_condition').val();
                 requestDict['app_memory']='true';
                 requestDict['memory_condition'] = inputValue;
             }
             else{
                 requestDict['app_memory']='false';
             }

             if (selectedAgent=='true') {
                 var inputValue = $('#' + 'agentinfo_condition').val();
                 requestDict['agent_info']='true';
                 requestDict['agentinfo_condition'] = inputValue;
             }
             else{
                 requestDict['agent_info']='false';
             }

             if (selectedValue=='true') {
                 var inputValue = $('#' + 'procvalue_condition').val();
                 requestDict['proc_value']='true';
                 requestDict['procvalue_condition'] = inputValue;
             }
             else{
                 requestDict['proc_value']='false';
             }

             if (selectedLoad=='true') {
                 var inputValue = $('#' + 'cpuload_condition').val();
                 requestDict['cpu_load']='true';
                 requestDict['cpuload_condition'] = inputValue;
             }
             else{
                 requestDict['cpu_load']='false';
             }

             if (selectedUsage=='true') {
                 var inputValue = $('#' + 'cpuusage_condition').val();
                 requestDict['cpu_usage']='true';
                 requestDict['cpuusage_condition'] = inputValue;
             }
             else{
                 requestDict['cpu_usage']='false';
             }

             console.log("DICTCHECK",requestDict);

            scope.$emit('requestAction',requestDict);
            };
    }
}
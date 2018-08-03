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
        scope.tool = {"Zabbix":["Zabbix Server IP","Zabbix Server Port","Zabbix Server Password","Zabbix Server User", "Zabbix Host Name"], "Nagios":["what"]}
        scope.host = {"Nova_host":["Host IP","Host ID", "Host Interface Name"],"Nova_instance":["VM IP", "VM ID", "VM Interface Name"]}

        scope.getInput = function (workflow_para) {

            if(workflow_para.match('=') == null){
                return 'true'
            }else{
                return 'false'
            }
        };

        scope.getData = function (selectedMonitor, selectedHost) {
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

             console.log("DICTCHECK",requestDict);

            scope.$emit('requestAction',requestDict);
        }
    }
}
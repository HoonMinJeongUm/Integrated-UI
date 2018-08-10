angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzActionsApimonitor', hzActionsApimonitor);

function hzActionsApimonitor() {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/components/actions/action-apimonitor.html',
        restrict: 'E'
    };
    return directive;

      function link(scope) {
        scope.info = ["Zabbix_username","Zabbix_password","Zabbix_server_ip","Zabbix_server_port","mgmt_ip","App_Name","App_port","Ssh_username","Ssh_password"];
        scope.status = ["True","False"];
        scope.memory = ["True","False"];
        scope.agentinfo = ["True","False"];
        scope.procvalue = ["True","False"];
        scope.load = ["True","False"];
        scope.usage = ["True","False"];

        scope.getInput = function (workflow_para) {

            if(workflow_para.match('=') == null){
                return 'true'
            }else{
                return 'false'
            }
        };

        scope.getData = function (selectedStatus) {
             var requestDict={};
             for (var i=0; i<scope.info.length; i++){
                 var inputValue  = $('#'+scope.info[i]).val();
                 console.log("YYYYYYY",inputValue);
                 requestDict[scope.info[i]]=inputValue;
             }



             if (selectedStatus=='True') {
                 var inputValue = $('#' + 'condition').val();
                 console.log("XXXXXX ", inputValue);
                 requestDict['condition'] = inputValue;
             }
             console.log("DICTCHECK",requestDict);

            scope.$emit('requestAction',requestDict);
            };
    }
}
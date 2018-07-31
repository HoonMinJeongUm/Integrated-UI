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
        scope.tool = {"Zabbix":["Zabbix Server IP","Zabbix Server Port","Zabbix Server Password","Zabbix Server User", "Zabbix Host Name"]}
        scope.host={"Nova_host":["Host IP","Host ID", "Host Interface Name"],"Nova_instance":["VM IP", "VM ID", "VM Interface Name"]}

        scope.getInput = function (workflow_para) {

            if(workflow_para.match('=') == null){
                return 'true'
            }else{
                return 'false'
            }
        };

        scope.getData = function (selected_workflow) {
            var new_request ={};
            var input_param={};
            var valueArray = [];

            for (var i=0; i<scope.detailedAction[selected_workflow].length; i++){
                var key = scope.detailedAction[selected_workflow][i];
                var getValue = $('#'+key.replace('=','\\=').replace('""','\\"\\"')).val();
                var nicString="[";
                if(key.match('=') == null){
                    if (getValue == ''){
                    return
                    }
                }
                if( getValue != ''){

                    if(getValue.match('\\[') && getValue.match('\\]')){
                        var tempValue = getValue.substring(1,getValue.length-1).replace(/(\s*)/g,"");
                        valueArray=tempValue.split(',');
                        input_param[key.replace('=','').replace('None','')]= "[" + String(valueArray) + "]";
                    }else{
                        input_param[key.replace('=','').replace('None','')]= String(getValue);
                    }
                }
            }
            new_request[selected_workflow]=input_param;
            scope.$emit('requestAction',new_request);
        }
    }
}
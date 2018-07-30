angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzActionsCheckpoint', hzActionsCheckpoint);

function hzActionsCheckpoint() {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/components/actions/action-checkpoint.html',
        restrict: 'E'
    };
    return directive;

     function link(scope) {
        scope.checkAction = ["ping","bottleneck","runscript"];
        scope.securityAction = ["If SSH","If Key","SSH or Key"];
        scope.check = {"ping":["Hosts"], "bottleneck":["Port"],"runscript":["Local Path","Remote Path"]}
        scope.security={"If SSH":["SSH ID","SSH PWD"],"If Key":["Key Path"],"SSH or Key":["Hosts"]}

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

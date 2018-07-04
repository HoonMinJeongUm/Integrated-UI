angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzWorkflowExecute', hzWorkflowExecute);

function hzWorkflowExecute() {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/components/actions/workflow-execute.html',
        restrict: 'E'
    };
    return directive;


    function link(scope) {
        scope.seletedWorkflow = 'None';
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



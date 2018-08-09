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
        scope.status = ["True","False"];
        scope.memory = ["True","False"];
        scope.condition = {"False":["Condition"]};

        scope.getInput = function (workflow_para) {

            if(workflow_para.match('=') == null){
                return 'true'
            }else{
                return 'false'
            }
        };

        scope.getData = function (selectedSecurity,selectedCheck) {
             var requestDict={};
             for (var i=0; i<scope.security[selectedSecurity].length; i++){
                 var inputValue  = $('#'+scope.security[selectedSecurity][i]).val();
                 console.log("YYYYYYY",inputValue);
                 requestDict[scope.security[selectedSecurity][i]]=inputValue;
             }

              for (var i=0; i<scope.check[selectedCheck].length; i++){
                 var inputValue  = $('#'+scope.check[selectedCheck][i]).val();
                 console.log("XXXXXX ",inputValue);
                 requestDict[scope.check[selectedCheck][i]]=inputValue;
             }

             console.log("DICTCHECK",requestDict);

            scope.$emit('requestAction',requestDict);
            };
    }
}
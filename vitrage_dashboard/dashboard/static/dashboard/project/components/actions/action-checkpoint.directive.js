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

        scope.getData = function () {
            };


    }
}

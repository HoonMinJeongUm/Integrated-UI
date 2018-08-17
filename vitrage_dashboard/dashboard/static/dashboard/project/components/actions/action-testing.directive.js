angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzActionsTesting', hzActionsTesting);

function hzActionsTesting() {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/components/actions/action-testing.html',
        restrict: 'E'
    };
    return directive;


    function link(scope) {
        scope.testingcase ={'VIM_Testing':['Rally'], 'VNF_Testing':['locustio','stressng','artillery']}
        scope.route = {"Rally":["requestdict"], "locustio":["host","auth"],"stressng":["host","auth","cpu", "vm", "vm-bytes", "hdd", "hdd-bytes", "timeout"], "artillery":["host","auth","count","num","target_ip"]};

        scope.input_json = "";

        scope.getInput = function (workflow_para) {

            if(workflow_para.match('=') == null){
                return 'true'
            }else{
                return 'false'
            }
        };


        scope.getData = function (selectedRoute) {
           var requestDict={};


           if(selectedRoute=='locustio') {
                var inputString = $('#input_json').val();
                 console.log("locuststring", inputString);
                 requestDict['locuststring']=inputString.replace(/\n/g,'NL').replace(/\r/g,'').trim();
               for (var i = 0; i < scope.route[selectedRoute].length; i++) {
                   var inputValue = $('#' + scope.route[selectedRoute][i]).val();
                   console.log("XXXXXX ", inputValue);
                   requestDict[scope.route[selectedRoute][i]] = inputValue;
               }
           }
           else {
               for (var i = 0; i < scope.route[selectedRoute].length; i++) {
                   var inputValue = $('#' + scope.route[selectedRoute][i]).val();
                   console.log("XXXXXX ", inputValue);
                   requestDict[scope.route[selectedRoute][i]] = inputValue;
               }
           }

           if (selectedRoute == 'Rally'){
                 requestDict['case']='VIM_Testing';
                 requestDict['tool']='Rally';
             }
             else {
               requestDict['case'] = 'VNF_Testing';
               if (selectedRoute == 'stressng') {
                   requestDict['tool'] = 'stressng';
               }
               else {
                   if(selectedRoute == 'locustio'){
                       requestDict['tool'] = 'locustio';
                   }
                   else {
                       requestDict['tool'] = 'artillery';
                   }
               }
           }
             console.log("DICTCHECK",requestDict);

            scope.$emit('requestAction',requestDict);
        }
    }
}
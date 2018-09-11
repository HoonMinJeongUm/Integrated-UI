angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzActionsPerformance', hzActionsPerformance);

function hzActionsPerformance() {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/components/actions/action-performance.html',
        restrict: 'E'
    };
    return directive;


    function link(scope) {
        scope.valueList = {};
            scope.postPerformance = function(){
                scope.valueList['syntaxcheck'] = false;
                scope.$emit('requestAction',scope.valueList);
            };
            scope.checkSyntax = function(){
                var inputValue = $('#input_json').val();
                var outputValue = $('#output_name').val();
                scope.valueList[outputValue]=JSON.parse(inputValue.replace(/\n/g,'').replace(/\r/g,'').replace(/(\s*)/g,"").trim());
                scope.valueList['syntaxcheck'] = true;
                scope.$emit('requestAction',scope.valueList);
            }

    }
}

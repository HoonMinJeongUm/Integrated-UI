angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzEntitiesActionlist', hzEntitiesActionlist);

function hzEntitiesActionlist() {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/entities/actionlist/entities-actionlist.html',
        restrict: 'E',
        scope: {
            actionItem: '=',
            actionList: '='
        }
    };
    return directive;
    function link(scope) {
        scope.selectedAction ='None';
        scope.showbutton = {'width':'90px'};
        scope.showpanel={'display':'none'};


        scope.$watch('actionItem', function () {
            scope.showpanel.display = scope.actionItem.display;
        });
        scope.$watch('actionList', function () {
            scope.typeArray=[];
            if(scope.actionList.length > 0 ){
                for(var i = 0; i<scope.actionList.length; i++){
                    if(scope.actionList[i] != 'Monitoring' && scope.actionList[i] != 'Testing' && scope.actionList[i] != 'Checkpoint' && scope.actionList[i] != 'Mistral' && scope.actionList[i] != 'Rally' &&
                        scope.actionList[i].toLowerCase().match(scope.actionItem.vitrage_type) !=null) {
                        scope.typeArray.push(scope.actionList[i]);
                    }else if((scope.actionList[i] == 'Monitoring' ||scope.actionList[i] == 'Testing' || scope.actionList[i] == 'Checkpoint' || scope.actionList[i] == 'Mistral' || scope.actionList[i] == 'Rally')){
                        scope.typeArray.push(scope.actionList[i]);
                    }
                }
                if(scope.typeArray.length > 0){
                    scope.selectedAction = scope.typeArray[0];
                }else{
                    scope.selectedAction = 'None';
                }

            }
        });
        scope.setStyle = function(selectedAction){
          if(selectedAction != 'Rally'){
              scope.showbutton['width'] = '182px';
              return scope.showbutton;
          }else{
              scope.showbutton['width'] ='90px';
              return scope.showbutton;
          }
        };
        scope.getComp = function(selectedAction,button_type){
            if (selectedAction  != 'Rally' && button_type != "Action"){
                if ((selectedAction.toLowerCase().match(scope.actionItem.vitrage_type)) != null){
                    return false;
                }else{
                    return true;
                }
            }else if(selectedAction != 'Monitoring' && selectedAction != 'Testing' && selectedAction != 'Checkpoint' && selectedAction != 'Mistral' && selectedAction  != 'Rally' && button_type == "Action"){
                return true;
            }else{
                return false;
            }
        };

        scope.onRunClick = function(action_type) {
            if ( action_type == 'Mistral' || action_type  == 'Rally'|| action_type  == 'Checkpoint' || action_type  == 'Testing' || action_type == 'Monitoring'){
              scope.$emit('selectedAction',[action_type,scope.actionItem.vitrage_type]);
            }
        };
        scope.onNewtab = function(selectedAction) {
          if (selectedAction != 'Mistral' && selectedAction != 'Rally'){
              scope.$emit('newTab',scope.actionItem.url[scope.actionItem.vitrage_type]);
          }
          else if(selectedAction != 'Mistral'){
              scope.$emit('newTab',selectedAction);
          }
        };
    }

}

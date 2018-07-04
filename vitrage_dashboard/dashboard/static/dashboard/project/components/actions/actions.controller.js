(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('ActionListModal', ActionListModal);

  ActionListModal.$inject = ['action','$scope','modalSrv','vitrageActionSrv'];

  function ActionListModal(action,$scope,modalSrv,vitrageActionSrv) {

    $scope.action= action;
    $scope.actionresult = false;

    $scope.closeModal = function () {
      modalSrv.close();
    };

    var getActionData = function() {
      vitrageActionSrv.getDetailedActionlist([$scope.action[0],$scope.action[1]])
        .then(
          function success(result) {
            $scope.detailedAction = result.data[0];
          },
          function error(result) {
            console.log('Cannot get Action list', result);
          }
        )
    };

    if ($scope.action[0] != 'Rally'){
        getActionData();
    }
    $scope.getAction = function(){
      return $scope.actionresult;
    };

    $scope.$on('requestAction', function (event,requestdict) {
      if (($scope.action[0] == 'Rally' && requestdict['syntaxcheck'] != true) || $scope.action[0] == 'Mistral'){
          $scope.closeModal();
      }
      vitrageActionSrv.postAction($scope.action[0],requestdict)
        .then(
          function success(result) {
            console.log('Action request result => ', result);
            if(($scope.action[0] == 'Rally' && result != null) || ($scope.action[0] == 'Mistral')){
                $scope.actionresult = true;
            }else{
                $scope.actionresult = false;
            }
          },
          function error(result) {
            console.log('Cannot post Action', result);
          }
        )
    }
    );
  }
})();

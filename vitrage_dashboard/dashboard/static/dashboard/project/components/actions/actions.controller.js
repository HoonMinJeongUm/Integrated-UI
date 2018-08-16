(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('ActionListModal', ActionListModal);

  ActionListModal.$inject = ['action','$scope','modalSrv','vitrageActionSrv'];

  function ActionListModal(action,$scope,modalSrv,vitrageActionSrv) {
    $scope.action= action;
    $scope.actionresult = false;
    $scope.detailedAction = null;
    if($scope.action[0] == 'Mistral'){
        $scope.detailedAction = action[2];
    }

    $scope.closeModal = function () {
      modalSrv.close();
    };

    $scope.getAction = function(){
      return $scope.actionresult;
    };

    $scope.$on('requestAction', function (event,requestdict) {
      if (($scope.action[0] == 'Rally' && requestdict['syntaxcheck'] != true)){
          $scope.closeModal();
      }else{
          $scope.closeModal();
      }
      vitrageActionSrv.postAction($scope.action[0],requestdict)
        .then(
          function success(result) {
            console.log('Action request result => ', result);
            if(($scope.action[0] == 'Rally' && result != null) || ($scope.action[0] != null)){
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

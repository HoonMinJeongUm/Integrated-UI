/**
 * Created by KimMinWook on 2018-07-10.
 */
(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('WaitSpinnerModal', WaitSpinnerModal);

  WaitSpinnerModal.$inject = ['action','$scope','modalSrv','vitrageActionSrv'];

  function WaitSpinnerModal(action,$scope,modalSrv,vitrageActionSrv) {

    $scope.action= action;
    $scope.actionresult = false;

    $scope.closeModal = function () {
      modalSrv.close();
    };
    var modalOptions = {
             animation: false,
             templateUrl: STATIC_URL + 'dashboard/project/components/actions/actions.html',
             controller: 'ActionListModal',
             backdrop: 'static',
             resolve: {action: function() {
             return action;
             }}
            };

    $scope.getActionData = function() {
        vitrageActionSrv.getDetailedActionlist([$scope.action[0],$scope.action[1]])
        .then(
          function success(result) {
            $scope.detailedAction = result.data[0];
            $scope.action[2] = $scope.detailedAction;
            $scope.closeModal();
            modalSrv.show(modalOptions);
          },
          function error(result) {
            console.log('Cannot get Action list', result);
          }
        )
    };
    $scope.getActionData();
  }
})();

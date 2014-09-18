'use strict';
angular.module('UoNTimetableApp.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, $ionicPopup, $timeout, $localForage, UserService) {
  $scope.setupData = {};
  $localForage.bind($scope, 'setupData.username'); 

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/setup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeSetup = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.setup = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doSetup = function() {
    $ionicLoading.show({
      template: 'Finding...'
    });

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    UserService.getCourseByUsername($scope.setupData.username).success(function(data){
      $ionicLoading.hide();
      $scope.closeSetup();
    });

    $scope.clearUsername = function(){
      $scope.setupData.username = '';
      var popup = $ionicPopup.alert({
        title: 'Cleared username',
        template: 'Your username has been cleared!'
      });
    };
    // $timeout(function() {
    //   $ionicLoading.hide();
    //   $scope.closeSetup();
    // }, 1000);
  };
});

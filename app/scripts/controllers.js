'use strict';
angular.module('UoNTimetableApp.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, $ionicPopup, $timeout, $localForage, UserService, $state, $rootScope, _){
  $scope.setupData = {};
  var currentDate = new Date();
  $scope.date = currentDate.toDateString();
  $scope.userData = {};
  $localForage.bind($scope, 'setupData.username'); 
  $localForage.bind($scope, 'userData'); 
  $localForage.bind($scope, 'days');
  $localForage.getItem('days').then(function(data){
    $scope.days = data;
    if(typeof data === 'undefined' || data === ''){
      $scope.setup();
    }else{
      console.log(data);
      loadCurrentDay(data);
    }
  });

  $scope.checkSetup = function(){
    if($scope.setupData.username === '' || typeof $scope.setupData.username === 'undefined'){
      $scope.setup();
    }
  };

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    if(toState.name === 'app.home' && ($scope.setupData.username === '' || typeof $scope.setupData.username === 'undefined')){
      $scope.setup();
    }
  });

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

  var loadCurrentDay = function(days){
    var startWeek = new Date(2014, 8, 15);
    // var currentWeek = Math.round((currentDate.getDay() - startWeek.getDay())/7);

    $scope.currentWeek = Math.round(((currentDate - (86400000 * currentDate.getDay())) - startWeek)/ 604800000);

    var weekday = new Array(7);
    weekday[0]=  'Sunday';
    weekday[1] = 'Monday';
    weekday[2] = 'Tuesday';
    weekday[3] = 'Wednesday';
    weekday[4] = 'Thursday';
    weekday[5] = 'Friday';
    weekday[6] = 'Saturday';

    // $scope.currDay = _.findWhere(days, {day_name: weekday[currentDate.getDay()]});
    days.forEach(function(day){
      if(day.day_name === weekday[currentDate.getDay()]){
        $scope.currDay = day;
      }
    });
    console.log($scope.currDay, days[0].modules);
    if(typeof $scope.currDay === 'undefined') return;
  };

  $scope.nextDay = function(){
     // var currentDate = new Date();
     $scope.currDay = {};
     currentDate.setDate(currentDate.getDate() + 1);
     $scope.date = currentDate.toDateString();
     loadCurrentDay($scope.days);
  };

  $scope.previousDay = function(){
    $scope.currDay = {};
    currentDate.setDate(currentDate.getDate() - 1);
    $scope.date = currentDate.toDateString();
    loadCurrentDay($scope.days);
  };

  // Perform the login action when the user submits the login form
  $scope.doSetup = function() {
    $ionicLoading.show({
      template: 'Finding...'
    });

    UserService.getCourseByUsername($scope.setupData.username).success(function(data){
      $scope.userData = data;
      $ionicLoading.hide();
      $scope.closeSetup();
      $state.go('app.home');
      UserService.getModules(data.id).success(function(data){
        $scope.days = data.days;
        loadCurrentDay($scope.days);
      });
    });
  };

  $scope.clearUsername = function(){
      $scope.setupData.username = '';
      $scope.userData = '';
      $scope.days = '';
      var popup = $ionicPopup.alert({
        title: 'Cleared data',
        template: 'Your data has been cleared!'
      });
    };
})
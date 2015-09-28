'use strict';
var weekday = new Array(7);
weekday[0]=  'Sunday';
weekday[1] = 'Monday';
weekday[2] = 'Tuesday';
weekday[3] = 'Wednesday';
weekday[4] = 'Thursday';
weekday[5] = 'Friday';
weekday[6] = 'Saturday';
var codes = [];
angular.module('UoNTimetableApp.controllers', [])
.controller('MapCtrl', function($scope){
  $scope.mapOptions = {
    center: new google.maps.LatLng(35.784, -78.670),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
})
.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, $ionicPopup, $timeout, $localForage, UserService, ModuleService, $state, $rootScope, _, $ionicActionSheet){
  var currentDate = new Date();
  // Init scope variables
  $scope.setupData = {};
  $scope.modules = [];
  $scope.date = currentDate.toDateString().substring(0,currentDate.toDateString().lastIndexOf(' '));
  $scope.userData = {};
  $scope.currentModule = {};
  $scope.department = '';
  $scope.addmodulecode = '';
  // Set persistant binding
  $localForage.bind($scope, 'setupData.username');
  $localForage.bind($scope, 'userData');
  $localForage.bind($scope, 'days');
  $localForage.bind($scope, 'modules');
  $localForage.bind($scope, 'department');
  $localForage.bind($scope, 'currentModule');

  $localForage.getItem('days').then(function(data){
    $scope.days = data;
    if(typeof data === 'undefined' || data === ''){
      $scope.setup();
    }else{
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

  $scope.addModule = function(){
    $scope.newModule = {};
    $ionicPopup.show({
      template: '<input type="text" ng-model="newModule.code">',
      title: 'Enter module code',
      subTitle: 'E.g. G52CPP',
      scope: $scope,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Add!',
          onTap: function(e){
            $ionicLoading.show({
              template: 'Finding module...'
            });
            ModuleService.getModule($scope.newModule.code).success(function(data){
              console.log($scope.days);
              console.log(data);
              data.forEach(function(day, k){
                var day_name = day.day_name;
                day.modules.forEach(function(module){
                  if(!_.contains(codes, module.code)){
                    codes.push(module.code);
                    module.enabled = true;
                    $scope.modules.push(module);
                  }
                  $scope.days[k].modules.push(module);
                });
              });
              $ionicLoading.hide();
            }).error(function(err, data){
              $ionicPopup.alert({
                 title: 'Error!',
                 template: 'Failed to fetch module information, check your module code'
              });
              $ionicLoading.hide();
            });
          }
        }
      ]
    });
  };

  $scope.showModuleCardSettings = function(){
    var moduleItem = this.module;
    var hideSheet = $ionicActionSheet.show({
      buttons: [],
      destructiveText: 'Disable',
      titleText: '<h4>Module settings</h4>',
      cancelText: 'Cancel',
      destructiveButtonClicked: function() {
        console.log(moduleItem);
        _.find($scope.modules, {code: moduleItem.code}).enabled = false;
        return true;
      },
      buttonClicked: function(index) {
        return true;
      }
    });
  };

  // Triggered in the login modal to close it
  $scope.closeSetup = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.setup = function() {
    $scope.modal.show();
  };

  var loadCurrentDay = function(days){
    var startWeek = new Date(2015, 8, 14);
    // var currentWeek = Math.round((currentDate.getDay() - startWeek.getDay())/7);

    $scope.currentWeek = Math.round(((currentDate - (86400000 * currentDate.getDay())) - startWeek)/ 604800000);
    // $scope.currDay = _.findWhere(days, {day_name: weekday[currentDate.getDay()]});
    days.forEach(function(day){
      if(day.day_name === weekday[currentDate.getDay()]){
        $scope.currDay = day;
      }
    });
    if(typeof $scope.currDay === 'undefined') return;
  };

  $scope.nextDay = function(){
     // var currentDate = new Date();
     $scope.currDay = {};
     currentDate.setDate(currentDate.getDate() + 1);
     $scope.date = currentDate.toDateString().substring(0,currentDate.toDateString().lastIndexOf(' '));
     loadCurrentDay($scope.days);
  };

  $scope.previousDay = function(){
    $scope.currDay = {};
    currentDate.setDate(currentDate.getDate() - 1);
    $scope.date = currentDate.toDateString().substring(0,currentDate.toDateString().lastIndexOf(' '));
    loadCurrentDay($scope.days);
  };

  $scope.moduleInfo = function(){
    $scope.currentModule = _.extend({}, this.module);
    $ionicLoading.show({
      template: 'Loading module...'
    });
    var done = 0;
    ModuleService.getStaffMember(this.module.staff, $scope.department).success(function(data){
      $scope.currentModule.staff = data;
      if(++done === 2) $ionicLoading.hide();
    }).error(function(data, status){
      $ionicLoading.hide();
      $ionicPopup.alert({
         title: 'Error!',
         template: 'Failed to fetch staff members information'
      });
    });
    ModuleService.getRoom(this.module.room.replace('+', '')).success(function(data){
      $scope.currentModule.room = data.name;

      if(++done === 2) $ionicLoading.hide();
    }).error(function(data, status){
      $ionicLoading.hide();
      $ionicPopup.alert({
         title: 'Error!',
         template: 'Failed to fetch room information'
      });
    });
    $state.go('app.module');
  };

  $scope.doSetup = function() {
    $ionicLoading.show({
      template: 'Finding course...'
    });

    UserService.getCourseByUsername($scope.setupData.username).success(function(data){
      $scope.userData = data;

      $ionicLoading.hide();
      $ionicLoading.show({
        template: 'Loading modules...'
      });


      UserService.getModules(data.id).success(function(data){
        $scope.modules = [];
        codes = [];
        $scope.department = data.department;
        data.days.forEach(function(day){
          day.modules.forEach(function(module){
            if(!_.contains(codes, module.code)){
              codes.push(module.code);
              module.enabled = true;
              $scope.modules.push(module);
            }
          });
        });

        $scope.days = data.days;
        $ionicLoading.hide();
        //$state.go('app.home');
        //$scope.closeSetup();
        loadCurrentDay($scope.days);
      });
    }).error(function(data, status){
      $ionicLoading.hide();
      $ionicPopup.alert({
         title: 'Error!',
         template: 'Failed to fetch course information, are you connected to the internet?'
      });
    });
  };

  $scope.clearUsername = function(){
      $scope.setupData.username = '';
      $scope.userData = '';
      $scope.days = '';
      $scope.modules = [];
      var popup = $ionicPopup.alert({
        title: 'Cleared data',
        template: 'Your data has been cleared!'
      });
    };
})

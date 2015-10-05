var BASE_URL = 'http://timetable.min.vc';
BASE_URL = 'http://localhost:8081';
angular.module('UoNTimetableApp.services', []).service('UserService', function($http){
	var api = {};
	api.getCourseByUsername = function(username){
		return $http.get(BASE_URL + '/api/courses/modules/username/' + username);
	};

	api.requestVerificationCode = function(username){
		return $http.get(BASE_URL + '/api/verify/' + username);
	};

	api.sendVerificationCode = function(username, code, ionicId){
		return $http.post(BASE_URL + '/api/verify/' + username, {
			code: code,
			ionicId: ionicId
		});
	};

	api.getModules = function(id){
		return $http.get(BASE_URL + '/api/courses/modules/' + id);
	};
	return api;
}).service('ModuleService', function($http){
	var api = {};
	api.getStaffMember = function(name, department){
		return $http.get(BASE_URL + '/api/staff?name=' + name + '&department=' + department);
	};

	api.getRoom = function(room){
		return $http.get(BASE_URL + '/api/room/' + room);
	}

	api.getModule = function(code){
		return $http.get(BASE_URL + '/api/module/' + code);
	}
	return api;
}).
filter('weekFilter', [function(){
	return function(modules, week, uniqueModules){
		var filtered = [];
		if(typeof modules === 'undefined') return filtered;
		modules.forEach(function(module){
			if(module.weeks.indexOf(week) > -1){
				var find = _.find(uniqueModules, {code: module.code});
				if(!find.enabled) return;
				filtered.push(module);
			}
		});
		return filtered;
	}
}]);
// return module.weeks.indexOf(week) > -1;

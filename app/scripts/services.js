angular.module('UoNTimetableApp.services', []).service('UserService', function($http){
	var api = {};
	api.getCourseByUsername = function(username){
		return $http.get('http://uon-timetable-api.jit.su/api/courses/modules/username/' + username);
	};

	api.getModules = function(id){
		return $http.get('http://uon-timetable-api.jit.su/api/courses/modules/' + id);
	};
	return api;
}).service('ModuleService', function($http){
	var api = {};
	api.getStaffMember = function(name, department){
		return $http.get('http://uon-timetable-api.jit.su/api/staff?name=' + name + '&department=' + department);
	};

	api.getRoom = function(room){
		return $http.get('http://uon-timetable-api.jit.su/api/room/' + room);
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
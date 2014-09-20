angular.module('UoNTimetableApp.services', []).service('UserService', function($http){
	var api = {};
	api.getCourseByUsername = function(username){
		return $http.get('http://uon-timetable-api.jit.su/api/courses/modules/username/' + username);
	};

	api.getModules = function(id){
		return $http.get('http://uon-timetable-api.jit.su/api/courses/modules/' + id);
	};
	return api;
}).
filter('weekFilter', [function(){
	return function(modules, week, uniqueModules){
		console.log(uniqueModules);
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
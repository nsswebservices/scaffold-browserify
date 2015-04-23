/*global require, localStorage*/
var angular = require('angular');
var angularRoute = require('angular-route');

//Controllers
function MainController() {
	var vm = this;
	vm.people = [];
	vm.beers = [];
	vm.save = save;
	vm.retrieve = retrieve;
	vm.newSession = newSession;
	
	function save() {
		localStorage.setItem('beerTastingPeople', JSON.stringify(vm.people));
		localStorage.setItem('beerTastingBeers', JSON.stringify(vm.beers));
	}
	
	function retrieve() {
		vm.people = JSON.parse(localStorage.getItem('beerTastingPeople')) || [];
		vm.beers = JSON.parse(localStorage.getItem('beerTastingBeers')) || [];
	}
	
	function newSession() {
		vm.people = [];
		vm.beers = [];
		localStorage.setItem('beerTastingPeople', JSON.stringify(vm.people));
		localStorage.setItem('beerTastingBeers', JSON.stringify(vm.beers));
	}
	
	vm.retrieve();
}
	
function AddPersonController($scope) {
	var vm = this;
	vm.newPerson = {};
	vm.addPerson = addPerson;
	vm.removePerson = removePerson;

	function addPerson() {
		vm.newPerson.id = $scope.$parent.vm.people.length + 1;
		$scope.$parent.vm.people.push(vm.newPerson);
		vm.newPerson = {};
		$scope.$parent.vm.save();
		$scope.newPersonForm.$setPristine();
	}

	function removePerson(person) {
		$scope.$parent.vm.people = $scope.$parent.vm.people.filter(function(a){ return a !== person; });
		$scope.$parent.vm.save();
	}
	
	//send session as json?
}

function RoundController($scope, $location) {
	var vm = this;
	vm.newBeer = {};
	vm.scoreBeer = scoreBeer;
	
	
	function scoreBeer() {
		$scope.$parent.vm.beers.push(vm.newBeer);
		$scope.$parent.vm.save();
		$location.path('/scoreboard');
	}
}

function ScoreboardController($scope) {
	var vm = this;
	vm.updateScoreboard = updateScoreboard;
	vm.personId = '';
	
	function totalBeerScore(scores){
		var total = 0;
		if(!!vm.personId) {
			total = !!scores[vm.personId] ? (scores[vm.personId] * 10) / 10 : 'N/A';
		} else {
			for(var score in scores) {
				total += +((scores[score] * 10) / 10);
			}
		}
		return total;
	}
	
	function averageBeerScore(beer) {
		var numScores = !!vm.personId ? 1 : Object.keys(beer.scores).length;
		return +(beer.totalScore / numScores).toFixed(2);
	}
	
	function updateScoreboard() {
		vm.beers = $scope.$parent.vm.beers.map(function(beer){
			beer.totalScore = totalBeerScore(beer.scores);
			beer.averageScore = averageBeerScore(beer);
			return beer;
		});
	}
	updateScoreboard();
}


angular.module('tastingApp', ['ngRoute'])

	.config(['$routeProvider', function($routeProvider) {
			$routeProvider.
			  when('/', { 
				templateUrl: 'partials/addPerson.html',
				controller: 'AddPersonController',
				controllerAs: 'vm'}).
			  when('/round', { 
				templateUrl: 'partials/round.html',
				controller: 'RoundController',
				controllerAs: 'vm'}).
			  when('/scoreboard', { 
				templateUrl: 'partials/scoreboard.html',
				controller: 'ScoreboardController',
				controllerAs: 'vm'}).
			  otherwise( { redirectTo: '/' });
		}])
	.controller('MainController', [MainController])
	.controller('AddPersonController', ['$scope', AddPersonController])
	.controller('RoundController', ['$scope', '$location', RoundController])
	.controller('ScoreboardController', ['$scope', ScoreboardController]);



angular.module('todo', ['ionic'])
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      //Anything native should go here, like StatusBar.styleLightContent()
    });
  })
  /**
  * The Projects factory handles saving and loading projects
  * from local storage, and also lets us save and load the 
  * last active project index.
  */
  .factory('Projects', function() {
    return {
      all: function() {
        var projectString = window.localStorage.getItem('projects');

        if(projectString) {
          return angular.fromJson(projectString);
        }
        return [];
      },
      save: function (projects) {
        window.localStorage.setItem('projects', angular.toJson(projects));
      },
      newProject: function(projectTitle) {
        return {
          title: projectTitle,
          tasks: []
        }
      },
      getLastActiveIndex: function() {
        return parseInt(window.localStorage.getItem('lastActiveProject')) || 0;
      },
      setLastActiveIndex: function(index) {
        window.localStorage.setItem('lastActiveProject', index);
      } 
    };
  })
  .controller('TodoCtrl', function($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {
    // A utility function for creating a new project
    // with the given projectTitle
    var createProject = function(projectTitle) {
      var newProject = Projects.newProject(projectTitle);
      $scope.projects.push(newProject);
      Projects.save($scope.projects);
      $scope.selectProject(newProject, $scope.projects.length - 1);
    };

    // Load or initialize projects
    $scope.projects = Projects.all();

    // Grab the last active, or the first project
    $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

    // Called to create a new project
    $scope.newProject = function() {
        var projectTitle = prompt('Project name');

        if(projectTitle) {
          createProject(projectTitle);
        }
    };

    // Called to select the given project
    $scope.selectProject = function(project, index) {
      $scope.activeProject = project;
      Projects.setLastActiveIndex(index);
      $ionicSideMenuDelegate.toggleLeft(false);
    };


    // Create our modal
    $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
      $scope.taskModal = modal;
    }, {
      scope: $scope
    });

    // Create e task
    $scope.createTask = function (task) {
      if(!$scope.activeProject || !task) {
        return;
      }

      $scope.activeProject.tasks.push({
        title: task.title
      });

      $scope.taskModal.hide();

      // Inefficient but save all the projects
      Projects.save($scope.projects);

      task.title = '';
    };

    // Open the new task modal
    $scope.newTask = function () {
      $scope.taskModal.show();
    };

    // Close the new task modal
    $scope.closeNewTask = function () {
      $scope.taskModal.hide();
    }

    $scope.toggleProjects = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };

    // Try to create the first project, make sure to defer
    // this by using $timeout so everything is initialized
    // properly
    $timeout(function() {
      if($scope.projects.length == 0) {
        while(true) {
          var projectTitle = prompt('Your first project title:');

          if(projectTitle) {
            createProject(projectTitle);
            break;
          }
        };
      }
    });

  });

(function(window, angular, jasmine, undefined) {
   window.t = {};

   var $controllerProvider;

   var findControllerDependencies = function(controllerName) {
      var dependencies = {};

      var found = $controllerProvider.register.calls.allArgs().some(
         function(args) {
            if(args[0] === controllerName) {
               var constructorFn = args[1];
               var dependencyNames = angular.injector().annotate(constructorFn);

               dependencyNames.forEach(function(dep) {
                  if(dep === '$scope') {
                     dependencies[dep] = t.inject('$rootScope').$new();
                  } else {
                     dependencies[dep] = t.inject(dep);
                  }
               });

               return true;
            }
         });

      if(!found) {
         throw new Error(controllerName + ' controller was not found.');
      }

      return dependencies;
   };

   var init = function() {
      module(function(_$controllerProvider_) {
         $controllerProvider = _$controllerProvider_;
         spyOn($controllerProvider, 'register').and.callThrough();
      });
   };

   t.module = function(moduleName) {
      init();

      if(!moduleName) {
         throw new Error('You must specify the module name');
      }

      module(moduleName);
      inject();
      return angular.module(moduleName);
   };

   t.inject = function(name) {
      var injected = null;

      inject([name, function(v) {
         injected = v;
      }]);

      return injected;
   };

   t.provider = function(moduleName, providerName) {
      var provider;

      module(moduleName);

      if(providerName.indexOf('Provider') === -1) {
         providerName += 'Provider';
      }

      module([providerName, function(p) {
         provider = p;
      }]);

      inject();

      return provider
   };

   t.controller = function(controllerName, services) {
      var $controller = t.inject('$controller');

      var dependencies = findControllerDependencies(controllerName);

      services = services || {};
      Object.keys(services).forEach(function(serviceName) {
         if(!dependencies[serviceName]) {
            throw new Error(
                  controllerName + ' does not depend on ' + serviceName);
         }

         dependencies[serviceName] = services[serviceName];
      });

      var controller = $controller(controllerName, dependencies);

      if(typeof controller._t !== 'undefined') {
         throw new Error(
            '_t controller property is reserved for angular-jasmine-helpers.'
         );
      }

      controller._t = { dependencies: dependencies };

      return controller;
   };

   t.mock = {
      provider: function(moduleName, provider, methods) {
         methods = methods || [];

         module(moduleName);

         if(provider.indexOf('Provider') === -1) {
            provider += 'Provider';
         }

         var mock = jasmine.createSpyObj(provider, ['$get'].concat(methods));

         module(function($provide) {
            $provide.provider(provider.split('Provider')[0], mock);
         });

         return mock;
      }
   };

})(window, window.angular, window.jasmine);
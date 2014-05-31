(function(window, angular, jasmine, undefined) {
   window.t = {};

   t.module = function(moduleName) {
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

   t.mock = {
      provider: function(moduleName, provider, methods) {
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
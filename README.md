# angular-jasmine-helpers

*Disclaimer: I created this for my own personal use, to keep my tests DRY without using `beforeEach` blocks and the like. It could be massively improved, and some of its helpers aren't very useful now that I've learnt more about testing Angular modules. For example, there isn't much point in merely testing the dependencies list of an Angular module - what was I thinking?... I will continue to iteratively improve things as and when I feel the need to. Feel free to use it, and feel free to make suggestions and improvements.*

A small set of helper methods to make testing AngularJS applications with Jasmine more fun. I don't like `beforeEach` blocks, and find them to make tests hard to follow and debug. The only times I use `beforeEach` is to expose a function on `this`, to DRY out common functionality of children scenarios. See below for a small sample of my Jasmine tests.

## Example (CoffeeScript)

```coffee
describe 'app', ->
  describe 'module', ->
    it('should load fine', ->
      expect(t.module('app')).toBeDefined()
    )

    it('should require the right set of modules', ->
      expect(t.module('app').requires).toEqual [
        'templates',
        'ui.router',
        'app.layout'
      ]
    )

  describe 'routing', ->
    otherwiseFn = null

    beforeEach ->
      this.otherwise = (url) ->
        $urlRouterProvider = t.mock.provider(
          'ui.router', '$urlRouterProvider', ['otherwise']
        )

        t.module('app')

        expect($urlRouterProvider.otherwise).toHaveBeenCalled()
        otherwiseFn = $urlRouterProvider.otherwise.calls.mostRecent().args[0]
        otherwiseFn(null, { url: -> url })

    it('should redirect URLs missing the trailing "/" to add the "/"', ->
      expect(this.otherwise 'someRoute').toBe 'someRoute/'
    )

    it('should redirect to root URL (/) if no matching route found', ->
      expect(this.otherwise 'someRoute/').toBe '/'
    )

  describe 'states', ->
    it('should also specify "controllerAs" if "controller" is specified', ->
      t.module 'app'
      states = t.inject('$state').get()

      states.forEach (state) ->
        expect(state.controllerAs).toBeDefined("State '#{state.name}' must " +
        "have a 'controllerAs' property") if state.controller
    )
```
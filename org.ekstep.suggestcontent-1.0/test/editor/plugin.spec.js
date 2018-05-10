describe("Suggest Content Plugin:", function() {
    var manifest, ctrl, $scope, pluginInstance, controller, $controller, $timeout;
    beforeAll(function(done) {
        CollectionEditorTestFramework.init(function() {
            manifest = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.suggestcontent");
            path = ecEditor.resolvePluginResource(manifest.id, manifest.ver, "editor/suggestContentApp.js");
            pluginInstance = ecEditor.instantiatePlugin("org.ekstep.suggestcontent");
            var templatePath = ecEditor.resolvePluginResource(manifest.id, manifest.ver, "editor/suggestContent.html");
            var controllerPath = ecEditor.resolvePluginResource(manifest.id, manifest.ver, "editor/suggestContentApp.js");
            org.ekstep.contenteditor.api.getService(ServiceConstants.SEARCH_SERVICE);
            ecEditor.getCurrentStage = jasmine.createSpy().and.callFake(function() {
                return { id: '5437859-543758937' }
            });
            done();
        })
    })

     it('mock suggestcontentApp module', function(done) {
        angular.mock.module('suggestcontentApp');
        beforeEach(inject(function($ocLazyLoad, _$rootScope_, _$controller_, _$timeout_) {
            $controller = _$controller_;
            $scope = _$rootScope_.$new();
            $timeout = _$timeout_;
            $ocLazyLoad.load([{
                type: 'js',
                path: path
            }]).then(function() {
                ctrl = $controller("suggestcontentController", {
                    $scope: $scope
                });
                done();
            }, function(error) {
                done();
            });
            setInterval(function() {
                _$rootScope_.$digest();
            }, 10);
        }));
    });
  
    describe("Suggest content testcases:", function() {
        
        it("Should invoke generateTelemetry method", function(done) {
            var data = { "type": "type", "subtype": "subtype", "target": "target"};
            spyOn($scope, "generateTelemetry").and.callThrough();
            $scope.generateTelemetry();
            expect($scope.generateTelemetry).toHaveBeenCalled();
            expect(data).not.toBe(undefined);
            done();
        })

        it("Should invoke search lesson", function() {
            spyOn($scope, "searchLessons").and.callThrough();
            $scope.searchLessons();
            expect($scope.searchLessons).toHaveBeenCalled();
        })

        it("Should invoke openResourceBrowser for valid query", function() {
            spyOn($scope, "openResourceBrowser").and.callThrough();
            $scope.openResourceBrowser();
            expect($scope.openResourceBrowser).toHaveBeenCalled();
        })

        it("Should add content on invoke of addcontent method", function() {
            var activeNode = org.ekstep.services.collectionService.getActiveNode().folder;
            var index = 0; var lesson = {};
            spyOn($scope, "addContent").and.callThrough();
            $scope.addContent();
            expect($scope.addContent).toHaveBeenCalled();
            expect(activeNode).not.toBe(undefined);
            expect(index).not.toBe(undefined);
            expect(index).not.toBeLessThan(0);
        })
    
    })
})
      
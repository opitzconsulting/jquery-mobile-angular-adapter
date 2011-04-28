describe("templating", function(){
	  var compile, element, scope;

	  beforeEach(function() {
	    scope = null;
	    element = null;
	    compile = function(html) {
		  element = angular.element(html);
	      scope = angular.compile(element)();
	    };
		
	  });

    it('should copy attributes and content', function() {
        var element = angular.element('<div><span ngm:define="tpl1" a1="v1">sp1</span><span ngm:use="\'tpl1\'"></span></div>');
        var spans = element.children("span"); 
        var span1 = angular.element(spans[0]);
        var span2 = angular.element(spans[1]);
        expect(element.children("span").length).toEqual(2);
        expect(span1.attr("a1")).toEqual("v1");
        expect(span2.attr("a1")).toEqual(undefined);
    	compile(element);
        var spans = element.children("span"); 
        span2 = angular.element(spans[1]);
        expect(span2.attr("a1")).toEqual("v1");
        expect(span2.text()).toEqual("sp1");
    });

    it('should watch the template id', function() {
        var element = angular.element('<div><span ngm:define="tpl1">sp1</span><span ngm:define="tpl2">sp2</span><span ngm:use="tplId">noop</span></div>');
        compile(element);
        // initially, the variable for the template is undefined,
        // so the span should be hidden
        var spans = element.children("span"); 
        span2 = angular.element(spans[2]);
        expect(span2.css("display")).toEqual("none");
        // set the template variable
        scope.$set("tplId", "tpl1");
        scope.$eval();
        expect(span2.text()).toEqual("sp1");
        scope.$set("tplId", "tpl2");
        scope.$eval();
        expect(span2.text()).toEqual("sp2");
    });
    
    it('should work with ng:repeat', function() {
        var element = angular.element('<div ng:init="objs=[{name:\'aaa\'},{name:\'bbb\'}]"><span ngm:define="tpl1" a="v1">1{{obj.name}}</span><span ngm:define="tpl2" a="v2">2{{obj.name}}</span><span ng:repeat="obj in objs" ngm:use="tplId"></span></div>');
        compile(element);
        var spans = element.children("span");
        expect(spans.length).toEqual(4);
        for (var i=2; i<4; i++) {
        	var span = angular.element(spans[i]);
            expect(span.css("display")).toEqual("none");
        }
        // set template 1
        scope.$set("tplId", "tpl1");
        scope.$eval();
        var span3 = angular.element(spans[2]);
        var span4 = angular.element(spans[3]);
        expect(span3.text()).toEqual("1aaa");
        expect(span3.attr("a")).toEqual("v1");
        expect(span4.text()).toEqual("1bbb");
        expect(span4.attr("a")).toEqual("v1");
        // set template 2
        scope.$set("tplId", "tpl2");
        scope.$eval();
        var span3 = angular.element(spans[2]);
        var span4 = angular.element(spans[3]);
        expect(span3.text()).toEqual("2aaa");
        expect(span3.attr("a")).toEqual("v2");
        expect(span4.text()).toEqual("2bbb");
        expect(span4.attr("a")).toEqual("v2");
        
    	
    });
});


;(function(global){
	// UglifyJS define hack.  Used for unit testing.
	if (typeof APP_NOW === 'undefined') {
	  APP_NOW = function () {
	    return +new Date();
	  };
	}

	if (typeof APPS === 'undefined') {
	  var global = (function(){return this;})();
	}

	//!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//EXPECTS <whatev class="catSlides"></whatev> in the DOM
	var app = function($,elasticizer){
		$(function(){
			var $actor = $('<div class="elasticizerActor"></div>');
    		$('.elasticizerWidgetFrame').append($actor);
    		var myElasticizer= new elasticizer({
    			$el:$('.elasticizerActor'),
    			$relativeParent:$('.elasticizerWidgetFrame'),
    			animationType:'keyframe'//transition,keyframe
    		});
    		$('.elasticizerWidgetFrame').on('click',function(e){
    			console.log(e)
				myElasticizer.moveTo(e.pageX,e.pageY)
			})
		});
		return 'Hi i am return app';
	};


	if (typeof exports === 'object') {
		// nodejs
		module.exports = app($,elasticizer);
	} else if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jQuery','js/elasticizer'],function(){ 
			return app.apply(null,arguments);
		});
	} else if (typeof global.app === 'undefined') {
		// Browser: Make `Tweenable` globally accessible.
		global.app = app($,elasticizer);
	}



})(this);



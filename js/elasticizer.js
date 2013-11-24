;(function(global){
	// UglifyJS define hack.  Used for unit testing..
	if (typeof ELASTICIZER_NOW === 'undefined') {
	  ELASTICIZER_NOW = function () {
	    return +new Date();
	  };
	}

	if (typeof ELASTICIZER === 'undefined') {
	  var global = (function(){return this;})();
	}

		

	//CLASS DEFINITION WITHIN THIS SCOPE
	var makeElasticizerObject = function($,Tweenable,CSSAnimations){
		//SOME FUNCTIONS USED
		var cssTransitioner = function(cssTransObj){
			if(typeof cssTransObj.duration === 'undefined'){
				cssTransObj.duration = 1200;
			}
			if(typeof cssTransObj.ease === 'undefined'){
				cssTransObj.ease = 'ease-out';
			}
			cssTransObj.target.css({
				'-webkit-transition': cssTransObj.cssProperty+' '+cssTransObj.duration+'ms '+cssTransObj.ease
			})
			cssTransObj.target.bind("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd",function(event){
				if(cssTransObj.target.is($(event.target))){//a selector of more than one jqueryObject might be passed.  Also, there could be transitions on child element (like buttons) and child element transitions trigger the callback.  So this conditional confirms that it's the targeted element itself that gets listened to and this works for a selector of multiple elements.
				//if(event.target == cssTransObj.target[0]){
					//(event.originalEvent.propertyName + ' - - - ping')
					if(event.originalEvent.propertyName.indexOf(cssTransObj.cssProperty) !=-1){//unintended css events leaked through, messing up sequence.  COnditional here fixes it.  Might use property name as argument so this is customizable.
						cssTransObj.target.unbind('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd');
						cssTransObj.target.css({'-webkit-transition': ''})
						cssTransObj.callback(cssTransObj.target);	
					}
				}
			})
			setTimeout(function(){
				//requestAnimFrame(function(){
				cssTransObj.target.css(cssTransObj.cssProperty,cssTransObj.cssValue)
				//});
			},0)
		}

		var cssAnimationer = function(cssTransObj){
			cssTransObj.target.bind("animationend webkitAnimationEnd oanimationend MSAnimationEnd",function(event){
				if(cssTransObj.target.is($(event.target))){//a selector of more than one jqueryObject might be passed.  Also, there could be transitions on child element (like buttons) and child element transitions trigger the callback.  So this conditional confirms that it's the targeted element itself that gets listened to and this works for a selector of multiple elements.
					cssTransObj.target.unbind('animationend webkitAnimationEnd oanimationend MSAnimationEnd');
					cssTransObj.callback(cssTransObj.target);
					cssTransObj.target.css('-webkit-animation','')	
				}
			})
			cssTransObj.target.css(cssTransObj.cssObj)
		}


		var makeKeyframeCSSRule = function(){
			var translateValue = 'translate3d(100%,-100%,0)';
			var possibilities = {
			  	'negative_negative':{
			  		name:'negative_negative',
			  		value:'translate3d(-100%,-100%,0)'
			  	},
			  	'positive_positive':{
			  		name:'positive_positive',
			  		value:'translate3d(100%,100%,0)'
			  	},
			  	'negative_positive':{
			  		name:'negative_positive',
			  		value:'translate3d(-100%,100%,0)'
			  	},
			  	'positive_negative':{
			  		name:'positive_negative',
			  		value:'translate3d(100%,-100%,0)'
			  	}
			};
			for(var key in possibilities){
				var anim = CSSAnimations.create();
				for(var i = 0; i<=100; i++){
				    var interpolatedValues = Tweenable.interpolate(
				      {
				        '-webkit-transform': 'translate3d(0%,0%,0)'
				      },
				      {
				        '-webkit-transform': possibilities[key].value
				      },
				      i*0.01,
				      'easeOutBounce'//'swingFromTo'
				    );
				    anim.setKeyframe(i+'%', interpolatedValues);
			  	}
			  	possibilities[key].anim = anim;
			    possibilities[key].cssRulesObject = {
					'-webkit-animation': anim.name+' '+1+'s '+0+'s ease',
					'-webkit-transform': possibilities[key].value
				};
		  	}
			return possibilities;
		};


		//ACTUAL CLASS THAT IS CALLED IN OTHER MODULES
		var elasticizer = function(options){
			options.animationPossibilities = makeKeyframeCSSRule();
			this.$actor = options.$el;
			this.settings = options;
			this.initialize();	
        };

        elasticizer.prototype.initialize = function(){
        	var self = this;
        	if(typeof self.$actorWrap === 'undefined'){
        		self.$actorWrap = $('<div class="actorWrap" style="position:absolute;"></div>');
				self.$actor.after(self.$actorWrap);
        	}
			self.$actorWrap.append(self.$actor);
			
			
        };
        elasticizer.prototype.moveTo = function(xValue,yValue){
        	var self = this;
        	var relativeParentOffset = self.settings.$relativeParent.offset();
			var actorWidth = self.$actor.width();
			var actorHeight = self.$actor.height();
		    var actorOffset = self.$actor.offset();
		    var cornerYDif = yValue - actorOffset.top;
		    var clientToActorRatioY = (yValue-actorOffset.top)/actorHeight;
		    var cornerXDif = xValue - actorOffset.left;
		    var clientToActorRatioX = (xValue-actorOffset.left)/actorWidth;
		    self.$actorWrap.css({
		        'width':Math.abs(actorWidth * clientToActorRatioX)+'px',
		        'height':Math.abs(actorHeight * clientToActorRatioY)+'px',
		    });
		    
		    if(self.settings.animationType === 'keyframe'){
			    var cssObj = {};
			    if(cornerXDif < 0 && cornerYDif < 0){
			    	cssObj = self.settings.animationPossibilities.negative_negative.cssRulesObject;
			    }
			    if(cornerXDif >= 0 && cornerYDif < 0){
			    	cssObj = self.settings.animationPossibilities.positive_negative.cssRulesObject;
			    }
			    if(cornerXDif >= 0 && cornerYDif >= 0){
			    	cssObj = self.settings.animationPossibilities.positive_positive.cssRulesObject;
			    }
			    if(cornerXDif < 0 && cornerYDif >= 0){
			    	cssObj = self.settings.animationPossibilities.negative_positive.cssRulesObject;
			    }
		    	cssAnimationer({
					target:self.$actorWrap,
					cssObj:cssObj,
					callback:function(){
						self.$actorWrap.css({
				            '-webkit-transform':'translate3d(0,0,0)',
				            'top': (yValue - relativeParentOffset.top) +'px',
				            'left': (xValue - relativeParentOffset.left) +'px',
				            'width':'',
				            'height':''
				        })
					}
				});
		    } else {
			    var oneHunderedX = 100;
			    if(cornerXDif < 0){
			    	oneHunderedX = -100;
			    }
			    var oneHunderedY = 100;
			    if(cornerYDif < 0){
			    	oneHunderedY = -100;
			    }
			    var transformValue = 'translate3d('+oneHunderedX+'%,'+oneHunderedY+'%,0)'
		        cssTransitioner({
					target: self.$actorWrap,
					cssProperty: '-webkit-transform',
					cssValue: transformValue,
					duration: 500,
					ease: 'linear',
					callback: function($that){
						console.log('CALLBSACK')
						self.$actorWrap.css({
				            '-webkit-transform':'translate3d(0,0,0)',
				            'top': (yValue - relativeParentOffset.top) +'px',
				            'left': (xValue - relativeParentOffset.left) +'px',
				            'width':'',
				            'height':''
				        })
					}
				});
		    }
        }

		return elasticizer;
	}
	//return objInstance;

	if (typeof exports === 'object') {
		// nodejs
		module.exports = makeElasticizerObject($,tools);
	} else if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jQuery','Tweenable','CSSAnimations'],function(){
			return makeElasticizerObject.apply(null,arguments);
		});
	} else if (typeof global.elasticizer === 'undefined') {
		// Browser: Make `Tweenable` globally accessible.
		global.elasticizer = makeElasticizerObject($,tools);
	}



})(this);
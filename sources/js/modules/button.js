(function (window, factory) {
	var myModule = factory(window, window.document);

	if (typeof module == 'object' && module.exports) {
		module.exports = myModule;
	}
}(typeof window != 'undefined' ? window : this, function (window, document) {
	'use strict';
	var dom = window.jQuery || window.dom;

	class Button extends rbLife.Widget {
		constructor(element) {

			super(element);

			this.regTarget = /^\s*([a-z0-9-_]+)\((.+)\)\s*$/i;
			this.$element = dom(element);

			this.$element.on('click', () => {
				var target = this.getTarget() || {};
				var widget = target._rbWidget;

				if (!widget) {
					return
				}

				if(widget[this.options.type]){
					widget[this.options.type]();
				} else if(widget.toggle) {
					widget.toggle();
				}
			});
		}

		setTarget(dom) {
			this.element.removeAttribute('data-target');
			this.$element.attr({
				'aria-controls': this.getId(dom)
			});
		}

		getTarget() {
			var target = this.$element.attr('data-target') || this.$element.attr('aria-controls') || '';
			if (!this.target || target != this.targetAttr) {
				this.targetAttr = target;
				this.target = null;

				if (target.match(this.regTarget)) {
					if (RegExp.$1 == 'closest') {
						this.target = this.element.closest(RegExp.$2);
					} else if (RegExp.$1 == 'sel') {
						this.target = document.querySelector(RegExp.$2);
					}
				} else if (target) {
					this.target = document.getElementById(target);
				}
			}

			return this.target;
		}
	}

	Button.defaults = {
		target: ''
	};

	window.rbModules = window.rbModules || {};

	window.rbModules.Button = Button;

	rbLife.register('button', Button);
}));

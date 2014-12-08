@ = require(['sjs:std', 'mho:surface', 'mho:surface/bootstrap']);

var ESCAPE = 27;

var withOverlay = exports.withOverlay = (function() {
	var overlayWidget = @Element("div") .. @CSS('{
		position: fixed;
		overflow: auto;
		left:0;
		top:0;
		bottom: 0;
		right:0;
		background-color: rgba(0,0,0,0.6);
		z-index:99;
	}

	.container {
		margin-top: 5em;
		background: none;
		.panel {
			position:relative;
		}
	}

	.panel {
		box-shadow: 2px 0 30px rgba(0,0,0,0.3);
	}
	
	') .. @Class("overlay");

	var stack = [];
	var overlayElement = null;

	var runDialog = function(widget, canClose, block) {
		var closer = canClose ? @Emitter() : null;
		// hide existing dialogs
		stack .. @each {|[elem, _]|
			elem.style.display = "none";
		};

		// add new dialog
		return overlayElement .. @appendContent(widget) {|elem|
			var pair = [elem, closer];
			stack.push(pair);
			try {
				var body = elem.querySelector('.panel-body');
				if (!closer) return block(body);
				else {
					waitfor {
						return block(body);
					} or {
						closer .. @wait();
					} or {
						elem.querySelector('.panel-title .close') .. @wait('click', {handle:@stopEvent});
					}
				}
			} finally {
				stack .. @remove(pair) .. @assert.ok();
				if(stack.length > 0) {
					stack[stack.length - 1][0].style.display = 'block';
				}
			}
		};
	};

	function _withOverlay(run) {
		try {
			document.body .. @appendContent(overlayWidget) {|el|
				overlayElement = el;
				waitfor {
					return run();
				} or {
					while(true) {
						document.body .. @wait('keydown', {filter: e -> e.which == ESCAPE, handle:@stopEvent});
						var top = stack[stack.length-1];
						var closer = top ? top[1];
						if(closer) closer.emit();
					}
				}
			}
		} finally {
			overlayElement = null;
		}
	};


	return function(opts, block) {
		if (arguments.length == 1) {
			block = arguments[0];
			opts = {};
		}
		if(!opts) opts = {};
		var canClose = opts.close !== false;

		var dialog = @Div(`
			<div class="row">
				<div class="col-sm-8 col-sm-offset-2">
					<div class="panel panel-default ${opts['class']}">
						<div class="panel-heading">
							<h3 class="panel-title"><span>${opts.title}</span>
								${canClose ? `<a class="close">x</a>`}
							</h3>
						</div>
						<div class="panel-body">
						</div>
					</div>
				</div>
			</div>
		`, {'class':"container"});
	
		var run = -> runDialog(dialog, canClose, block);
		return overlayElement ? run() : _withOverlay(run);
	};
})();

exports.spinner = (function() {
	var spinnerWidget = @Img({src:"/static/spinner.svg"});
	var spinDuration = '0.9s';
	var overlayCSS = @CSS("
	@global {
		@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
		@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
		@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
	}

	{
		position: absolute;
		left:0;
		top:0;
		bottom: 0;
		right:0;
		background-color: rgba(0,0,0,0.2);
		opacity:0;
		z-index:199;

		transition: opacity 200ms linear;

		img {
			-webkit-animation:spin #{spinDuration} linear infinite;
			-moz-animation:spin #{spinDuration} linear infinite;
			animation:spin #{spinDuration} linear infinite;
			margin: 0 auto;
			display: block;
			height: 50%;
			max-width: 100%;
			max-height: 100px;
		}
	}
	");

	return function(elem, style, block) {
		if (arguments.length == 2) {
			block = style;
			style = null;
		}
		var containerHeight = elem.offsetHeight || 1;
		var widget = @Element("div",
			spinnerWidget .. @Style("margin-top: #{containerHeight/4}px;")
			) .. overlayCSS;
		if(style) widget = style(widget);
		elem .. @appendContent(widget) {|elem|
			waitfor {
				hold(0);
				elem.style.opacity = '1.0';
			} and {
				return block();
			}
		};
	}
})();

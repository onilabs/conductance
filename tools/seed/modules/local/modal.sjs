@ = require(['sjs:event', 'sjs:xbrowser/dom', 'mho:surface', 'mho:surface/bootstrap/html']);

var ESCAPE = 27;

var withOverlay = exports.withOverlay = (function() {
	var overlay = @Element("div") .. @CSS('{
		position: fixed;
		left:0;
		top:0;
		bottom: 0;
		right:0;
		overflow:auto;
		background-color: rgba(0,0,0,0.6);
		z-index:99;
	}

	.container {
		margin-top: 5em;
		background: none;
	}

	.panel {
		box-shadow: 2px 0 30px rgba(0,0,0,0.3);
	}
	
	') .. @Class("overlay");

	return function(opts, block) {
		if (arguments.length == 1) {
			block = arguments[0];
			opts = {};
		}
		if(!opts) opts = {};
		var o = overlay;
		var canClose = opts.close !== false;
		document.body .. @prependContent(o) {|elem|
			waitfor {
				return elem .. @appendContent(`
				<div class="container">
					<div class="row">
						<div class="col-sm-8 col-sm-offset-2">
							<div class="panel panel-default ${opts['class']}">
								<div class="panel-heading">
									<h3 class="panel-title">${opts.title}
										${canClose ? `<a class="close">x</a>`}
									</h3>
								</div>
								<div class="panel-body">
								</div>
							</div>
						</div>
					</div>
				</div>
				`) {|elem| block(elem.querySelector('.panel-body')) }
			} or {
				if (canClose) {
					waitfor {
						elem.querySelector('.panel-title .close') .. @wait('click', {handle:@stopEvent});
					} or {
						document.body .. @wait('keydown', {filter: e -> e.which == ESCAPE, handle:@stopEvent});
					}
				} else {
					hold();
				}
			}
		}
	};
})();

@ = require('mho:stdlib');
@html = require('mho:surface/html');

var Samples = exports.Samples = function() {
	var rv = {
		add: function(title) {
			var e = {title:title};
			this.current = e;
			this.entries.push(e);
		},
		addCode: function(lang, val) {
			this.current[lang] = val;
		},
		addImpl: function(fn) {
			this.current.fn = fn;
		},
		entries: [],
	};
	return rv;
};

var centered = @Style('{text-align:center}');
var carouselStyle = @Style("
	.carousel-content {
		opacity:1;
		transition: 0.25s;
	}

	.hidden {
		opacity: 0;
	}

	.nav_pill:before {
		/* empty circle */
		content:'\\25cb';
	}

	.nav:hover {
		cursor: pointer;
	}

	.hidden:hover {
		cursor: default;
	}

	.nav_pill:hover:before, .nav_pill.active:before {
		/* solid circle */
		content:'\\25cf';
	}

	.nav {
		font-size:2em;
		text-decoration:none;
	}

	pre {
		max-height: 600px;
		overflow:auto;
	}
");

exports.Carousel = function(container, widgets) {
	var idx = @Observable(0);
	var currentWidget = @Computed(idx, i -> widgets[i]);

	var links = @integers(0, widgets.length - 1) .. @map(function(i) {
		var active = @Computed(idx, _i -> _i === i);
		return @html.A() .. @OnClick(-> idx.set(i)) .. @Class("nav nav_pill") .. @Class("active", active);
	});

	var diff = function(curr,amount) {
		var n = curr + amount;
		if(n>=0 && n<widgets.length) {
			return n;
		}
		return null;
	}

	var arrowAction = function(text, amount) {
		var cant = @Computed(idx, i -> diff(i, amount) === null);
		return @html.A(text) .. @Class("nav") .. @OnClick(function() {
			if(!cant.get()) idx.set(idx.get() + amount);
		}) .. @Class("hidden", cant);
	};

	links.unshift(arrowAction(`&#x2190;`, -1));
	links.push(arrowAction(`&#x2192;`, 1));

	var carousel = @html.Div([
		@html.Div(links) .. centered(),
		@html.Div() .. @Class("carousel-content"),
	])
	.. @Class('carousel-container')
	.. carouselStyle();

	container.innerHTML = "";

	container .. @withWidget(carousel) {|elem|
		var content = elem.querySelector(".carousel-content");
		var change = @Emitter();
		var strata = spawn(currentWidget.observe {|v|
			change.emit(v);
		});

		var curr = currentWidget.get();

		while(true) {
			waitfor {
				content .. @replaceContent(@html.Div(curr));
				var newContent = content.childNodes[0];
				content.style.height = newContent.offsetHeight + "px";
				content.classList.remove('hidden');
				hold();
			} or {
				curr = change.wait();
				content.classList.add('hidden');
				waitfor {
					content .. @wait('transitionend');
				} or {
					hold(400);
					@error("animation timed out...");
				}
			} or {
				strata.waitforValue();
			}
		}
	}
};

exports.displayComparisons = function(comparisons, container) {
	var displayExample = e -> `
		<h3>${e.title .. @RawHTML}:</h3>
		<table>
			<tr>
				<td width="50%">
					<h3>Conductance</h3>
					<pre><code>${e.sjs .. @RawHTML}</code></pre>
				</td>
				<td width="50%">
					<h3>Javascript</h3>
					<pre><code>${e.js .. @RawHTML}</code></pre>
				</td>
			</tr>
		</table>
	`;

	exports.Carousel(container, comparisons.entries .. @map(displayExample));
}

exports.displayUISamples = function(samples, container) {
	var displayExample = function(e) {
		return `
			<h3>${e.title .. @RawHTML}:</h3>
			<table>
				<tr>
					<td width="50%">
						<h3>Source</h3>
						<pre><code>${e.sjs .. @RawHTML}</code></pre>
					</td>
					<td width="50%">
						<h3>Result</h3>
						<div class="interactive">
							${@html.Div() .. @Mechanism(e.fn)}
						</div>
					</td>
				</tr>
			</table>
		`;
	}

	exports.Carousel(container, samples.entries .. @map(displayExample));
};

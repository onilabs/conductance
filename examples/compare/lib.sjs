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

exports.displayComparisons = function(comparisons, container) {
	console.log(comparisons);
	var displayExample = e -> `
		<h2>${e.title .. @RawHTML}:</h3>
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

	container.innerText=""; // remove loading text
	
	// todo: make carousel
	container .. @appendContent(`
		<div>
			${comparisons.entries .. @map(displayExample)}
		</div>
	`);
}

exports.displayUISamples = function(samples, container) {
	var displayExample = function(e) {
		return `
			<h2>${e.title .. @RawHTML}:</h3>
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

	container.innerText=""; // remove loading text
	
	// todo: make carousel
	container .. @appendContent(`
		<div>
			${samples.entries .. @map(displayExample)}
		</div>
	`);
};

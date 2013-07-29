var { Observable, ObservableArray, Computed } = require('mho:observable');
var s = require('mho:surface');
var { Attrib, OnClick, Class, Widget, Mechanism, Button, appendWidget, Id, Style } = require('mho:surface');
var { Select } = require('mho:surface/widgets');
var events = require('sjs:events');
var logging = require('sjs:logging');
var cutil = require('sjs:cutil');
var dom = require('sjs:xbrowser/dom');
var Url = require('sjs:url');
var http = require('sjs:http');
var seq = require('sjs:sequence');
var bootstrap = require('mho:surface/bootstrap');

//----------------------------------------------------------------------

var busy = Observable(false);

// editor operations
var getEditorContents = -> "";
var setEditorContents = -> null;
var updateCurrentCode = -> null;
var addRuntimeAnnotation = -> null;
var clearRuntimeAnnotations = -> null;

var codeInput = Widget("pre",
	[
		s.RequireExternalScript("./ace-editor/ace.js"),
		s.RequireExternalScript("./ace-editor/mode-javascript.js"),
		s.RequireExternalScript("./mode-sjs.js"),
		getEditorContents()
	],
	{id: "code-input"})
	.. Mechanism {|elem|
		var editor = ace.edit(elem);
		var session = editor.getSession();
		editor.setTheme("ace/theme/chrome");
		session.setMode("ace/mode/sjs");

		var errorAnnotations = [];

		getEditorContents = -> editor.getValue();
		setEditorContents = function(t) {
			var initialPos = editor.getCursorPosition();
			editor.setValue(t);
			editor.clearSelection();
			editor.moveCursorToPosition(initialPos);
			editor.focus();
		};
		var getStaticAnnotations = ->
			session.getAnnotations()
			.. seq.filter(ann -> errorAnnotations.indexOf(ann) == -1)
			.. seq.toArray();

		clearRuntimeAnnotations = -> session.setAnnotations(getStaticAnnotations());
		addRuntimeAnnotation = function(obj) {
			errorAnnotations.push(obj);
			var existing = getStaticAnnotations();
			session.setAnnotations(existing.concat(obj));
		};
		editor.commands.addCommand({
			name: 'run',
			bindKey: 'Shift-Enter',
			exec: -> updateCurrentCode(),
			readOnly: true
		});
		editor.focus();
	};


var activeCode = Observable(getEditorContents());
var Tag = (name,attrs) -> Widget(name, undefined, attrs);

var runIcon = Widget("i") .. Class("icon-arrow-right");
var runLabel = Computed(busy, b -> b ? ["Loading ..."] : ["Run ", runIcon]);
var runButton = Widget("Button", runLabel) .. Class("btn run") .. Mechanism {|elem|
	updateCurrentCode = -> activeCode.set(getEditorContents());
	using (var click = events.HostEmitter(elem, "click")) {
		while(true) {
			click.wait();
			updateCurrentCode();
		}
	}
}
.. Attrib("disabled", busy);


var samples = ObservableArray([]);
var sampleDir = "sample/";

var selectedSample = Observable(null);
var loadSample = function(name) {
	if (name == null) return;
	var url = Url.normalize(sampleDir + name + '.sjs', module.id);
	setEditorContents(http.get([url, {format: 'src'}]));
};

var loader = [
	Select({
		items: samples,
		selected: selectedSample,
	}) .. Mechanism {||
		// load list of samples in the background
		var contents = http.json(["sample/", {format: "json"}]);
		// strip .sjs extension
		samples.set(contents.files .. seq.map(f -> f.name.slice(0,-4)));
		waitfor {
			selectedSample.observe( -> loadSample(selectedSample.get()));
		} and {
			selectedSample.set(samples.get()[0]);
		}
	}
];

var runBar = Widget("div", [
	loader,
	runButton,
	Widget("div") .. Style("{clear:both; height:0.5em;}")
]) .. Class("runBar");


var codePanel = Widget("div", [codeInput, runBar]) .. Mechanism {|elem|
	// TODO: builtin layout algorithms, perhaps a Splitter widget?
	var runBar = elem.querySelector('.runBar');
	var codeArea = elem.querySelector('#code-input');
	using(var resize = events.HostEmitter(window, 'resize')) {
		while(true) {
			var avail = elem.offsetHeight - runBar.offsetHeight - 20;
			codeArea.style.height = "#{avail}px";
			resize.wait();
		}
	}
};

var codeResult = Widget("iframe", undefined,
	{src: "scratchpad-eval.app"})
.. Mechanism {|elem|
	//var errorWatcher = null;
	var strata = null;
	var update = function() {
		if(strata) {
			logging.debug("Aborting old strata");
			strata.abort();
			strata = null;
		}
		clearRuntimeAnnotations();
		elem.contentWindow.run = null;
		elem.contentDocument.location.reload();
		hold(0);
		busy.set(true);
		var contentLogging = null;

		try {
			waitfor {
				while (!elem.contentWindow.run) {
					hold(5);
				}
				contentLogging = elem.contentWindow.require('sjs:logging');
			} or {
				hold(1000 * 10);
				throw new Error("Error loading iframe");
			}

		} finally {
			busy.set(false);
		}

		strata = spawn(function() {
			var handleError = null;
			var errors = seq.Stream {|emit|
				handleError = emit;
				hold();
			};

			waitfor {
				var err;
				elem.contentWindow.onerror = function(e) {
					spawn(handleError(e));
					return true;
				};

				try {
					errors .. seq.each {|err|
						logging.debug("got ERROR from child window: #{err}");
						(contentLogging || logging).error(err);
						var match = /^\s*at inline: *(\d+)$/gm.exec(err);
						if (match) {
							addRuntimeAnnotation({
								row: parseInt(match[1], 10) - 1,
								text: err,
								type: "error"
							});
						}
					}
				} finally {
					elem.contentWindow.onerror = null;
				}
			} and {
				try {
					elem.contentWindow.run(activeCode.get());
				} catch(e) {
					handleError(String(e));
				}
			}
		}());
	};

	update(); // run the initial code
	activeCode.observe(update);
}

var content = bootstrap.Bootstrap(
	[
		Widget("div", `
			<h1>Conductance playground</h1>
			<p>Press &lt;shift+return&gt; in the editor window to run the current code</p>
		`) .. Class("header"),
		Widget("div", [
			codePanel .. Class("codePanel"),
			Widget("div", codeResult) .. Class("codeResult"),
		]) .. Style("{padding: 0px 2%}") .. Class("main"),
	]
) .. s.RequireStyle("scratchpad.css") .. Style("{height:100%}") .. Mechanism {|elem|
	var header = elem.querySelector(".header");
	var container = elem.querySelector(".main");
	using(var resize = events.HostEmitter(window, 'resize')) {
		while (true) {
			var avail = document.documentElement.clientHeight - header.offsetHeight - 15;
			window._e = elem;
			container.style.height = "#{avail}px";
			resize.wait();
		}
	}
};

//.. Vbox({stretch: [null, 0.5, 0.5]});

document.body .. appendWidget(content);

var { Attrib, OnClick, Class, Widget, Mechanism, Button, appendWidget, Id, Style } = require('mho:surface');
var seq = require('sjs:sequence');
var {each, map, filter, join} = seq;

exports.VBox = function(contents, settings) {
	var container = Widget("div", contents) .. Mechanism(function(elem) {
		var update = function() {
			var ratios = settings.ratio;
			var totalRatio = ratios .. seq.reduce(0, (acc, r) -> acc + (r || 0));
			if (totalRatio == 0) {
				// just space evenly
				ratios = ratios .. map(r -> 1);
				totalRation = ratios.length;
			}
			ratios = ratios .. map(r -> r == null ? null : r / totalRatio);
			var pairs = elem.childNodes .. seq.zip(ratios);
			var fixedElements = pairs .. filter([node, r] -> r == null);
			var fixedSize = fixedElements .. seq.reduce(0, (acc, [elem, _]) -> acc + elem.offsetHeight);

			console.log("VBox has avail #{settings.total.get()}, minus a fixed size of #{fixedSize}");
			var avail = settings.total.get() - fixedSize;

			pairs .. each {|[child, r]|
				if (r != null) {
					console.log("setting child with ratio #{r} to height #{Math.floor(r * avail)}", child);
					child.style.height = "#{Math.floor(r * avail)}px";
				}
			}
		};
		update();
		waitfor {
			settings.total.observe(update);
		} and {
			if (settings.updateOn) {
				settings.updateOn.observe(update);
			}
		}
	});
	return container;
};

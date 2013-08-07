var {context, test, assert} = require('sjs:test/suite');
var {at} = require('sjs:sequence');

var {observe, Observable, Computed} = require('mho:observable');

context("Observable") {||
	test("observe multiple values at once") {||
		var log = [];
		var a = Observable("a0");
		var b = Observable("b0");
		var c = Observable("c0");

		waitfor {
			observe(a, b, c, function(_a, _b, _c) {
				log.push([_a, _b, _c]);
			});
		} or {
			a.set("a1");
			c.set("c1");
		}

		log .. assert.eq([
			["a1", "b0", "c0"],
			["a1", "b0", "c1"],
		]);
	}

	test("only ever skips intermediate events events when observing") {||
		var log = [];
		var a = Observable("a0");

		waitfor {
			a.observe {|val|
				hold(10);
				log.push(val);
			}
		} or {
			a.set("a1");
			a.set("a2");
			a.set("a3");
			a.set("a4");
			hold(100);
		}

		log .. assert.eq(["a1","a4"]);
	}

	test("tracks (nested) property changes") {||
		var obj = Observable({});
		var changes = [];

		waitfor {
			obj.observe {|val, ch|
				changes.push(ch);
			}
		} or {
			assert.raises({message: /has no property: parent/},
				-> obj.setPath("parent.child", "childVal"));

			var parent = { what: "parent" };
			var child = { what: "child" };
			obj.setPath("parent", parent);
			obj.setPath("parent.child", child);
		}

		obj.get().parent .. assert.is(parent);
		obj.get().parent.child .. assert.is(child);

		changes .. assert.eq([
			{"type":"update", "path": ["parent"]},
			{"type":"update", "path": ["parent", "child"]},
		]);

	}

	test("allows property modification by either path string or array") {||
		var obj = Observable({a: {b: "c"}});
		obj.setPath("a.b", "d");
		obj.get().a.b .. assert.eq("d")

		obj.setPath(["a", "b"], "e");
		obj.get().a.b .. assert.eq("e")
	}
}.timeout(2);

context("Computed") {||
	test("is only recomputed minimally") {||
		var log = [];
		var a = Observable('a0');
		var b = Observable('b0');

		var count = 0;
		var c = Computed(a, b, function(_a, _b) {
			return "#{_a} #{_b} c#{count++}";
		});

		c.get() .. assert.eq('a0 b0 c0');
		c.get() .. assert.eq('a0 b0 c0');
		a.set("a1");
		b.set("b1");
		a.set("a2");
		c.get() .. assert.eq('a2 b1 c1');
	}

	test("is always recomputed when being observed") {||
		var a = Observable('a0');
		var b = Observable('b0');

		var count = 0;
		var c = Computed(a, b, function(_a, _b) {
			return "#{_a} #{_b} c#{count++}";
		});

		var log = [];
		waitfor {
			c.observe(_c -> log.push(_c));
		} or {
			log .. assert.eq([]);
			c.get() .. assert.eq('a0 b0 c0');
			c.get() .. assert.eq('a0 b0 c0');
			log .. assert.eq([]);
			a.set("a1");
			log .. assert.eq(["a1 b0 c1"]);
			b.set("b1");
			log .. assert.eq(["a1 b0 c1", "a1 b1 c2"]);
			c.get() .. assert.eq('a1 b1 c2');
		}
	}

	test("keeps emitting new values while inputs have changed") {||
		var a = Observable();
		var count = 1;
		var c = Computed(a, _a -> _a + " result");
		var log = [];
		waitfor {
			c.observe {|val|
				log.push(val);
				if (count < 5) a.set("a#{count++}");
				hold(0);
			}
		} or {
			a.set("a0");
			hold(500);
		}

		log .. assert.eq(["a0 result","a1 result","a2 result","a3 result","a4 result"]);
	}

	test("get() triggers at most one concurrent compute, always uses most recent inputs") {||
		var a = Observable('a0');
		var log = [];
		var c = Computed(a, function(_a) {
			try {
				log.push("computing #{_a}");
				hold(50);
				return _a;
			} retract {
				log.push("retracted");
			}
		});

		waitfor {
			a.set("a1");
			hold(0);
			a.set("a2");
			hold(0);
			a.set("a3");
		} and {
			log.push("got " + c.get());
			log.push("got " + c.get());
			log.push("got " + c.get());
		}
		log .. assert.eq([
			'computing a1',
			'got a1',
			'computing a3',
			'got a3',
			'got a3'
		]);
	}
}.timeout(2);

context("Computed.Always") {||
	test("is recomputed each time it's accessed") {||
		var count = 0;
		var c = Computed.Always(-> count++);
		c.get() .. assert.eq(0);
		c.get() .. assert.eq(1);
	}

	test("causes dependent values to also be uncacheable") {||
		var count = 0;
		var c = Computed.Always(-> count++);
		var d = Computed(c, _c -> _c);
		d.revision .. assert.is(undefined);
		d.get() .. assert.eq(0);
		d.get() .. assert.eq(1);
	}
}

@ = require('sjs:test/std');
@ .. @extend(require('mho:observable'));

@context("Observable") {||
	@test("observe multiple values at once") {||
		var log = [];
		var a = @Observable("a0");
		var b = @Observable("b0");
		var c = @Observable("c0");

		waitfor {
			@observe(a, b, c) {|_a, _b, _c|
				log.push([_a, _b, _c]);
				if (_c === "c1") {
					console.log("breaking");
					break;
				}
			};
		} or {
			a.set("a1");
			c.set("c1");
			c.set("c2");
		}

		log .. @assert.eq([
			["a0", "b0", "c0"],
			["a1", "b0", "c0"],
			["a1", "b0", "c1"],
		]);
	}

	@test("combine multiple observables") {||
		var log = [];
		var a = @Observable("a0");
		var b = @Observable("b0");
		var c = @Observable("c0");
		var obs = @ObservableTuple(a,b,c);

		waitfor {
			obs .. @each {|[_a, _b, _c]|
				log.push([_a, _b, _c]);
				if (_c === "c1") {
					console.log("breaking");
					break;
				}
			};
		} or {
			a.set("a1");
			c.set("c1");
			c.set("c2");
		}

		log .. @assert.eq([
			["a0", "b0", "c0"],
			["a1", "b0", "c0"],
			["a1", "b0", "c1"],
		]);
	}

	@test("only ever skips intermediate events events when observing") {||
		var log = [];
		var a = @Observable("a0");

		waitfor {
			a .. @each {|val|
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

		log .. @assert.eq(["a0","a4"]);
	}
}.timeout(2);

@context("Computed") {||
	@test("emits initial value") {||
		var log = [];
		var a = @Observable(0);
		var c = @Computed(a, _a -> _a + 1);

		waitfor {
			c .. @each {|val|
				log.push(val);
			}
		} or {
			a.set(1);
		}

		log .. @assert.eq([1, 2]);
	}

	@test("is recomputed each time it's accessed") {||
		var count = 0;
		var c = @Computed(@Observable(), -> count++);
		c .. @first() .. @assert.eq(0);
		c .. @first() .. @assert.eq(1);
	}
}

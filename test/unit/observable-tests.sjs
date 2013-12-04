@ = require('sjs:test/std');
@ .. @extend(require('mho:observable'));

@context("Observable") {||
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

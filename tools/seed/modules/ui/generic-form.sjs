@ = require(['mho:std', 'mho:app']);

exports.formatError = err -> err .. @transform(function(e) {
	if (e) return @Span(e) .. @Class("errorDescription help-text text-danger");
});

exports.formatErrorAlert = err -> err .. @transform(function(e) {
	if (e) return @Div(e) .. @Class("errorDescription alert alert-danger");
});

var pairObject = function(k,v) {
	var rv = {};
	rv[k]=v;
	return rv;
}

var Form = function(source, opts) {
	opts = opts || {};
	var validate = opts.validate;
	var error = @ObservableVar(null);
	var rv = {
		fields: [],
		values: function() {
			var rv = {};
			this.fields .. @each {|field|
				if (field.name) {
					rv[field.name] = field.value .. @first;
				}
			}
			return rv;
		},
		error: error,
		field: function(name, opts) {
			opts = opts || {};
			return Field(source, opts .. @merge({form:this, name:name}));
		},
		validate: function() {
			if(!this.fields .. @map(field -> field.validate()) .. @all(Boolean)) {
				return false;
			}
			var globalValid = validate ? this.values() .. tryValidate(validate, error) : true;
			return globalValid;
		},

		wait: function(elem, block) {
			elem .. @events('submit', {handle: @stopEvent}) .. @each {|e|
				if (!this.validate()) continue;
				if (block) {
					if (!block()) continue;
				}
				return this.values();
			}
		},
	};
	return rv;
};
exports.Form = Form;

function Field(source, opts) {
	opts = opts || {};
	source = opts.source || source;
	@assert.ok(source, "source not given");
	var name = opts.name;

	if (!(source .. @isStream && source.modify)) {
		if(source .. @isStream) source = source .. @first;
		source = @ObservableVar(source);
	}

	var validate = opts.validate;
	var transform = opts.transform;
	var form = opts.form;
	var def = opts['default'];

	var get = function(val) {
		//console.log("getting #{name} from", val);
		if (name) val = val .. @get(name, def);
		if (transform) val = transform(val);
		return val;
	};
	var error = @ObservableVar(null);

	var value = source .. @transform(get) .. @dedupe();
	value.modify = function(fn) {
		return source.modify(function(current, unchanged) {
			var currentV = get(current);
			var v = fn(currentV, unchanged);
			if(v === unchanged) return unchanged;
			if(transform) v = transform(v);
			return name ? current .. @merge(pairObject(name, v)) : v;
		});
	};
	value.set = v -> value.modify(->v);
	value.get = -> get(source.get());
	value.__oni_is_ObservableVar = true; // XXX hacky...

	var rv = {
		name: name,
		value: value,
		error: error,
		validate: -> this.value .. @first .. tryValidate(validate, error),
	};

	if (form) {
		form.fields.push(rv);
	}
	return rv;
};
exports.Field = Field;

function tryValidate(v, validators, error) {
	if (validators) {
		if (!Array.isArray(validators)) validators = [validators];
		try {
			validators .. @each(f -> f(v));
		} catch(e) {
			error.set(e.message);
			@info(`Validation error on ${v}: ${String(e)}`);
			return false;
		}
		error.set(null);
	}
	return true;
};

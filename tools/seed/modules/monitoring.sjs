@ = require('mho:std');
@os = require('nodejs:os');
@type = require('sjs:type');

if (require.main === module) {
	require('./hub');
	require('seed:env').defaults();
}

@datadog = @env.get('datadog').nonblocking({capacity: 100});

var SAMPLE_INTERVAL = -> @env.get('datadog-batch-period') * 1000; 120 * 1000; // 2 mins

var metricLoop = (function() {
	var METRICS = {};
	var metricCount = 0;
	var metricSamples = {};
	var metricLoop = function() {
		hold(1000); // give initial samples time to collect
		var count = -> metricSamples .. @ownKeys .. @count();
		var send = function() {
			// swap cache
			var batch = metricSamples;
			metricSamples = {};

			// and send cached results
			@datadog.metrics(batch);
		};
		while(true) {
			if(count() > 0) {
				send();
			}
			try {
				hold(SAMPLE_INTERVAL());
			} retract {
				var remaining = count();
				// XXX should we send these off instead of just dropping them?
				if (remaining > 0) @logging.warn("Dropping #{remaining} unsent metrics");
			}
		}
	};
	metricLoop.instance = null;

	//records a metric, for later reporting
	var record = function(k,v) {
		var now = Date.now() / 1000;
		if(!metricSamples[k]) metricSamples[k] = [];
		metricSamples[k].push([now, v]);
		if(metricLoop.instance === null) {
			@assert.ok(metricCount > 0, "unexpected metric recorded");
			metricLoop.start();
		}
	};

	metricLoop.start = function() {
		this.instance .. @assert.eq(null, "already started");
		this.instance = spawn(metricLoop());
	};

	metricLoop.stop = function() {
		this.instance .. @assert.ok("not started");
		this.instance.abort();
		this.instance = null;
	};

	metricLoop.add = function(key, metric) {
		if (METRICS .. @hasOwn(key)) throw new Error("metric #{key} is already configured");
		metricCount++;
		METRICS[key] = spawn(function() {
			hold(0);
			try {
				metric .. @each {|val|
					// metrics can be streams of either `value` (a number)
					// or `object` (an object with metric names for keys)
					// or `array` (an array of key-value pairs)
					if(@type.isObject(val)) {
						if(!@type.isArray(val)) val = val .. @ownPropertyPairs;
						val .. @each {|[subkey,v]|
							record(key + '.' + subkey,v);
						}
					} else {
						record(key, val);
					}
				}
			} catch(e) {
				@logging.error("Error collecting #{key} metric: #{e}");
			}
			hold();
		}());
	};

	metricLoop.remove = function(key) {
		@assert.ok(METRICS .. @hasOwn(key));
		var s = METRICS[key];
		delete METRICS[key];
		s.abort();
		metricCount--;
		if(metricCount == 0 && metricLoop.instance) {
			// last one terminates the loop
			// XXX should this trigger an event and wait for graceful end?
			metricLoop.instance.abort();
			metricLoop.instance = null;
		}
	};

	return metricLoop;
})();


exports.sample = function(interval, fn) {
	if(!fn) {
		fn = interval;
		interval = null;
	}
	return @Stream(function(emit) {
		while(true) {
			emit(fn());
			hold((interval || @env.get('datadog-sample-period')) * 1000);
		}
	});
};


exports.withMetric = function(key, stream, block) {
	metricLoop.add(key, stream);
	try {
		block();
	} finally {
		metricLoop.remove(key);
	}
};

exports.withMetrics = function(metrics, block) {
	var added = [];
	try {
		metrics .. @ownPropertyPairs .. @each {|[k,v]|
			metricLoop.add(k,v);
			added.push(k);
		}
		block();
	} finally {
		added .. @each(metricLoop.remove);
	}
};

exports.event = function() {
	@datadog.event.apply(@datadog, arguments);
};

exports.memoryMetrics = function() {
	var freemem = @os.freemem();
	var totalmem = @os.totalmem();
	return {
		//'free_mb': Math.round(freemem / 1000 / 1000),
		'used_percent': 100 - Math.round((freemem / Math.max(totalmem, 1)) * 100),
	}
}

exports.diskMetrics = function() { // only sample every 30m
	return @fs.readFile('/proc/mounts', 'utf-8')
		.. @split('\n')
		.. @transform(line -> line.split(/\s+/g, 2))
		.. @filter([dev] -> dev .. @startsWith('/dev/') && !dev .. @startsWith('/dev/mapper/'))
		.. @sortBy([dev, path] -> path.length) // always use the shortest path if a device is mounted in multiple places
		.. @uniqueBy("0")
		.. @transform(function([device, path]) {
			//console.log("getting dev #{device}, #{path}");
			var id = path == '/' ? 'root' : path.slice(1).replace(/\//g,'_');
			var [pcent, avail, ipcent] = (@childProcess.run('df', [ '--local', '--block-size=M', '--output=pcent', '--output=avail', '--output=ipcent',  path]).stdout
				.split('\n')[1]
				.trim()
				.replace(/[%M]/g,'')
				.split(/\s+/)
				//.. @tap(console.log)
				)
				.. @map(num -> parseInt(num, 10))
			;
			//console.log("ID=#{id}");
			return [
				[id + ".used_percent", pcent],
				[id + ".avail_mb", avail],
				[id + ".iused_percent", ipcent],
			];
		})
		.. @concat()
		.. @toArray
		//.. @tap(console.log)
		.. @pairsToObject()
	;
}

if (require.main === module) {
	console.log("memory metrics: ", exports.memoryMetrics());
	console.log("disk metrics: ", exports.diskMetrics());
}

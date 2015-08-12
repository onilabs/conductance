@ = require('sjs:test/std');
@context {||
  @gcd = require('mho:flux/gcd');
  @context("JS -> GCD conversion") {||
    @context("array values") {||
      var schemas = {
        Data: {
          array_values: [ { __type: 'string', } ],
        },
      };

      function convert(data) {
        return @gcd._JSEntityToGCDEntity(
          {
            schema: 'Data',
            data: data
          },
          schemas);
      }

      function roundtrip(data) {
        var gcd = convert(data);
        var rv = @gcd._GCDEntityToJSEntity(gcd, {schema: 'Data'}, schemas);
        return rv.data;
      }

      @test("are flattened") {||
        var source = {
          array_values: [ "one", "two", "three" ]
        };

        convert(source).properties['array_values'] .. @assert.eq({
          listValue: [
            {stringValue: 'one' },
            {stringValue: 'two' },
            {stringValue: 'three' }
          ]
        });

        roundtrip(source) .. @assert.eq(source);
      }

      @test("disallows gaps") {||
        ;[
          [ undefined, "two" ],
          [ "one", undefined ],
        ] .. @each {|example|
          @assert.raises({message: /Google Cloud Datastore: Undefined values in arrays not supported \(array_values\.\d+\)/},
          -> convert({
            array_values: example,
          }));
        }
      }

      @test("allows undefined if all values are undefined") {||
        var source = {
          array_values: [ undefined, undefined, undefined ],
        };

        convert(source).properties .. @assert.eq({});

        roundtrip(source) .. @assert.eq({});
      }
    }

    @context("array sub-properties") {||
      var schemas = {
        Data: {
          array_values: [ {
            first: { __type: 'string'},
            middle: { __type: 'string'},
            last: { __type: 'string'},
          } ],
        },
      };

      function convert(data) {
        return @gcd._JSEntityToGCDEntity(
          {
            schema: 'Data',
            data: data
          },
          schemas);
      }

      function roundtrip(data) {
        var gcd = convert(data);
        var rv = @gcd._GCDEntityToJSEntity(gcd, {schema: 'Data'}, schemas);
        return rv.data;
      }

      @test("are flattened") {||
        var source = {
          array_values: [
            { first: "f1", middle: "m1", last: "l1" },
            { first: "f2", middle: "m2", last: "l2" },
          ]
        };

        convert(source).properties .. @assert.eq(
          {
            'array_values.first': {
              listValue: [
                {stringValue: 'f1' },
                {stringValue: 'f2' }
              ]
            },
            'array_values.middle': {
              listValue: [
                {stringValue: 'm1' },
                {stringValue: 'm2' }
              ]
            },
            'array_values.last': {
              listValue: [
                {stringValue: 'l1' },
                {stringValue: 'l2' }
              ]
            }
          }
        );

        roundtrip(source) .. @assert.eq(source);
      }

      @test("disallows gaps") {||
        ;[
          [
            { first: "f1", middle: "m1", last: "l1" },
            { first: "f2",               last: "l2" },
          ],
          [
            { first: "f1", middle: "m1", last: "l1" },
            undefined,
          ],
        ] .. @each {|example|
          [example, example .. @clone .. @reverse] .. @each {|example|
            @assert.raises({message: /Google Cloud Datastore: Undefined values in arrays not supported \(array_values\..*\)/},
            -> convert({
              array_values: example,
            }));
          }
        }
      }

      @test("allows undefined if all values are undefined") {||
        var source;
        
        source = {
          array_values: [
            { first: "f1", last: "l1" },
            { first: "f2", last: "l2" },
          ],
        };

        convert(source).properties .. @assert.eq(
          {
            'array_values.first': {
              listValue: [
              {stringValue: 'f1' },
              {stringValue: 'f2' },
            ],
            },
           'array_values.last': {
             listValue: [
               {stringValue: 'l1' },
               {stringValue: 'l2' },
             ]
           }
          });
        roundtrip(source) .. @assert.eq(source);

        // ------
        source = {
          array_values: [ undefined, undefined ],
        };
        convert(source).properties .. @assert.eq({});

        roundtrip(source) .. @assert.eq({});

      }

      @test("an object with no defined properties is treated as undefined") {||
        // this is not necessarily desired, but worth documenting:
        roundtrip({array_values: [ {} ] }) .. @assert.eq({});
      }
    }

    @context("array nested sub-properties") {||
      var schemas = {
        Data: {
          array_values: [ {
            first: {
              lower: {__type: 'string'},
              upper: {__type: 'string'},
            },
            last: {__type: 'string'},
          } ],
        },
      };

      function convert(data) {
        return @gcd._JSEntityToGCDEntity(
          {
            schema: 'Data',
            data: data
          },
          schemas);
      }

      function roundtrip(data) {
        var gcd = convert(data);
        var rv = @gcd._GCDEntityToJSEntity(gcd, {schema: 'Data'}, schemas);
        return rv.data;
      }

      @test("are flattened") {||
        var source = {
          array_values: [
            { first: { lower: "f1", upper: "F1" }, last: "l1"},
            { first: { lower: "f2", upper: "F2" }, last: "l2"},
          ]
        };

        convert(source).properties .. @assert.eq({
          'array_values.first.lower': {
            listValue: [
              {stringValue: 'f1' },
              {stringValue: 'f2' },
            ]
          },
          'array_values.first.upper': {
            listValue: [
              {stringValue: 'F1' },
              {stringValue: 'F2' },
            ]
          },
          'array_values.last': {
            listValue: [
              {stringValue: 'l1' },
              {stringValue: 'l2' },
            ]
          }
        });

        roundtrip(source) .. @assert.eq(source);
      }

      @test("disallows gaps") {||
        ;[
          [
            { first: {lower: "f1", upper: "F1"}, last: "l1" },
            { first: {lower: "f1"             }, last: "l1" },
          ],
          [
            { first: {lower: "f1", upper: "F1"}, last: "l1" },
            {                                    last: "l1" },
          ],
          [
            { first: {lower: "f1", upper: "F1"}, last: "l1" },
            undefined,
          ],
        ] .. @each {|example|
          [example, example .. @clone .. @reverse] .. @each {|example|
            @assert.raises({message: /Google Cloud Datastore: Undefined values in arrays not supported \(array_values\..*\)/},
            -> convert({
              array_values: example,
            }));
          }
        }
      }

      @test("allows undefined if all values are undefined") {||
        var source;
        
        source = {
          array_values: [
            { first: {lower: "f1"}, last: "l1" },
            { first: {lower: "f2"}, last: "l2" },
          ],
        };

        convert(source).properties .. @assert.eq({
          'array_values.first.lower': {
            listValue: [
              {stringValue: 'f1' },
              {stringValue: 'f2' },
            ]
          },
          'array_values.last': {
            listValue: [
              {stringValue: 'l1' },
              {stringValue: 'l2' },
            ]
          }
        });
        roundtrip(source) .. @assert.eq(source);

        // ------
        source = {
          array_values: [
            { last: "l1" },
            { last: "l2" },
          ],
        };

        convert(source).properties .. @assert.eq({
          'array_values.last': {
            listValue: [
              {stringValue: 'l1' },
              {stringValue: 'l2' },
            ]
          }
        });
        roundtrip(source) .. @assert.eq(source);


        // ------
        source = {
          array_values: [ undefined, undefined ],
        };
        convert(source).properties .. @assert.eq({});

        roundtrip(source) .. @assert.eq({});

      }

      @test("an object with no defined properties is treated as undefined") {||
        // this is not necessarily desired, but worth documenting:
        roundtrip({array_values: [ {} ] }) .. @assert.eq({});
      }
    }
  }
}.serverOnly();


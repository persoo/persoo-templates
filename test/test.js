var expect = require('chai').expect;
var assert = require('assert');
var persooTemplates = require('../lib/index');
var embeddedJS = require('../lib/embeddedjs');

describe('persooTemplates.render(template, offerVariant, context)', function() {
    it('template rendering with no fields', function() {
        var template = 'Rendered HTML Content';
        var offer = {
                variants: [{
                    templateID: 'template1',
                    content: {}
                }]
        };
        var context = {};
        var resultHTML = persooTemplates.render(template, offer.variants[0], context);
        expect(resultHTML).to.equal('Rendered HTML Content');
    });
    it('template rendering with profile context', function() {
        var template = 'userName: <%= profile.userName %> and userAge: <%= profile.age %>.';
        var offer = {
                variants: [{
                    templateID: 'template1',
                    content: {}
                }]
        };
        var context = {
        		profile: { // varaibles in user profile
        			age: 18,
        			userName: 'Kuba'
        		}
        };
        var resultHTML = persooTemplates.render(template, offer.variants[0], context);
        expect(resultHTML).to.equal('userName: Kuba and userAge: 18.');
    });
    it('template rendering with fields and profile context', function() {
        var template = 'userName: <%= userNameField %> and userAge: <%= ageField %>.';
        var offer = {
                variants: [{
                    templateID: 'template1',
                    content: {
                    	ageField: '<%= profile.age %>',
                    	userNameField: '<%= profile.userName %>'
                    }
                }]
        };
        var context = {
        		profile: { // varaibles in user profile
        			age: 18,
        			userName: 'Kuba'
        		}
        };
        var resultHTML = persooTemplates.render(template, offer.variants[0], context);
        expect(resultHTML).to.equal('userName: Kuba and userAge: 18.');
    });
});

describe('embeddedJS.compile(str, options)', function () {
    it('compile to a function', function () {
        var fn = embeddedJS.compile('<p>yay</p>');
        assert.equal(fn(), '<p>yay</p>');
    });

    it('empty input works', function () {
        var fn = embeddedJS.compile('');
        assert.equal(fn(), '');
    });

    it('throw if there are syntax errors', function () {
    	var failTemplate = "<% function foo() return 'foo'; %>";
        try {
          embeddedJS.compile(failTemplate);
        }
        catch (err) {
          assert.ok(err.message.indexOf('compiling ejs') > -1);

          try {
            embeddedJS.compile(failTemplate, {filename: 'fail.ejs'});
          }
          catch (err) {
            assert.ok(err.message.indexOf('fail.ejs') > -1);
            return;
          }
        }
        throw new Error('no error reported when there should be');
    });

    it('allow customizing delimiter local var', function () {
        var fn;
        fn = embeddedJS.compile('<p><?= name ?></p>', {delimiter: '?'});
        assert.equal(fn({name: 'geddy'}), '<p>geddy</p>');

        fn = embeddedJS.compile('<p><:= name :></p>', {delimiter: ':'});
        assert.equal(fn({name: 'geddy'}), '<p>geddy</p>');

        fn = embeddedJS.compile('<p><$= name $></p>', {delimiter: '$'});
        assert.equal(fn({name: 'geddy'}), '<p>geddy</p>');
    });

    it('default to using embeddedJS option.delimiter', function () {
        var fn;

        fn = embeddedJS.compile('<p><|= name |></p>', {delimiter: '|'});
        assert.equal(fn({name: 'geddy'}), '<p>geddy</p>');
        delete embeddedJS.delimiter;
    });

    it('have a working client option', function () {
        var fn
          , str
          , preFn;
        fn = embeddedJS.compile('<p><%= foo %></p>', {client: true});
        str = fn.toString();
        if (!process.env.running_under_istanbul) {
          eval('var preFn = ' + str);
          assert.equal(preFn({foo: 'bar'}), '<p>bar</p>');
        }
    });

    it('support client mode without locals', function () {
        var fn
          , str
          , preFn;
        fn = embeddedJS.compile('<p><%= "foo" %></p>', {client: true});
        str = fn.toString();
        if (!process.env.running_under_istanbul) {
          eval('var preFn = ' + str);
          assert.equal(preFn(), '<p>foo</p>');
        }
    });

    it('not include rethrow() in client mode if compileDebug is false', function () {
        var fn = embeddedJS.compile('<p><%= "foo" %></p>', {
                   client: true
                 , compileDebug: false
                 });
        // There could be a `rethrow` in the function declaration
        assert((fn.toString().match(/rethrow/g) || []).length <= 1);
    });

    it('support custom escape function', function () {
        var customEscape
          , fn;
        customEscape = function customEscape(str) {
          return !str ? '' : str.toUpperCase();
        };
        fn = embeddedJS.compile('HELLO <%= name %>', {escape: customEscape});
        assert.equal(fn({name: 'world'}), 'HELLO WORLD');
    });

    it('support custom escape function in client mode', function () {
        var customEscape
          , fn
          , str;
        customEscape = function customEscape(str) {
          return !str ? '' : str.toUpperCase();
        };
        fn = embeddedJS.compile('HELLO <%= name %>', {escape: customEscape, client: true});
        str = fn.toString();
        if (!process.env.running_under_istanbul) {
          eval('var preFn = ' + str);
          assert.equal(preFn({name: 'world'}), 'HELLO WORLD');
        }
    });

    it('strict mode works', function () {
    	// Unspecified execution context should be `undefined` in strict mode
    	var strictModeTemplate = "<% var isReallyStrict = !((function () { return this; })()) -%>" +
                                 "<%= isReallyStrict -%>";

        assert.equal(embeddedJS.render(strictModeTemplate, {}, {strict: true}), 'true');
    });

});

describe('embeddedJS.render(str, data, opts)', function () {
    it('render the template', function () {
        assert.equal(embeddedJS.render('<p>yay</p>'), '<p>yay</p>');
    });

    it('empty input works', function () {
        assert.equal(embeddedJS.render(''), '');
    });

    it('undefined renders nothing escaped', function () {
        assert.equal(embeddedJS.render('<%= undefined %>'), '');
    });

    it('undefined renders nothing raw', function () {
        assert.equal(embeddedJS.render('<%- undefined %>'), '');
    });

    it('null renders nothing escaped', function () {
        assert.equal(embeddedJS.render('<%= null %>'), '');
    });

    it('null renders nothing raw', function () {
        assert.equal(embeddedJS.render('<%- null %>'), '');
    });

    it('zero-value data item renders something escaped', function () {
        assert.equal(embeddedJS.render('<%= 0 %>'), '0');
    });

    it('zero-value data object renders something raw', function () {
        assert.equal(embeddedJS.render('<%- 0 %>'), '0');
    });

    it('accept locals', function () {
        assert.equal(embeddedJS.render('<p><%= name %></p>', {name: 'geddy'}),
            '<p>geddy</p>');
    });

    it('accept locals without using with() {}', function () {
        assert.equal(embeddedJS.render('<p><%= locals.myname %></p>', {myname: 'kuba'}, {_with: false}),'<p>kuba</p>');
        assert.equal(embeddedJS.render('<p><%= locals.nonExistingField %></p>', {}, {_with: false}),'<p></p>');
        assert.throws(function() {
                embeddedJS.render('<p><%= myname %></p>', {myname: 'kuba'}, {_with: false});
            },
            /myname is not defined/
        );
    });

    it('accept custom name for locals', function () {
        assert.equal(embeddedJS.render('<p><%= item.myname %></p>', {myname: 'kuba'}, {_with: false, localsName: 'item'}), '<p>kuba</p>');
        assert.equal(embeddedJS.render('<p><%= item.nonExistingField %></p>', {}, {_with: false, localsName: 'item'}),'<p></p>');
        assert.throws(function() {
                embeddedJS.render('<p><%= myname %></p>', {myname: 'kuba'}, {_with: false});
            },
            /myname is not defined/
        );
    });
//
//    it('support caching', function () {
//        var file = __dirname + '/tmp/render.embeddedJS'
//          , options = {cache: true, filename: file}
//          , out = embeddedJS.render('<p>Old</p>', {}, options)
//          , expected = '<p>Old</p>';
//        assert.equal(out, expected);
//        // Assert no change, still in cache
//        out = embeddedJS.render('<p>New</p>', {}, options);
//        assert.equal(out, expected);
//    });
//
//    it('support LRU caching', function () {
//        var oldCache = embeddedJS.cache
//          , file = __dirname + '/tmp/render.embeddedJS'
//          , options = {cache: true, filename: file}
//          , out
//          , expected = '<p>Old</p>';
//
//        // Switch to LRU
//        embeddedJS.cache = LRU();
//
//        out = embeddedJS.render('<p>Old</p>', {}, options);
//        assert.equal(out, expected);
//        // Assert no change, still in cache
//        out = embeddedJS.render('<p>New</p>', {}, options);
//        assert.equal(out, expected);
//
//        // Restore system cache
//        embeddedJS.cache = oldCache;
//    });

    it('opts.context', function () {
        var ctxt = {foo: 'FOO'}
          , out = embeddedJS.render('<%= this.foo %>', {}, {context: ctxt});
        assert.equal(out, ctxt.foo);
    });
});

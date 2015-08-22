# sdmp-node-journal

An implementation of the [SDMP journal](http://sdmp.io/docs/journal/) in JavaScript.

This module does **not** verify resources or authors in any way. It simply blindly maintains
a journal list.

# install it

Install it the normal [npm](https://www.npmjs.com/) way:

```sh
npm install sdmp-node-journal
```

Or by copying the code into your project some other more difficult way.

# initialize it

Initialize in the following possible ways.

```js
var NodeJournal = require('sdmp-node-journal')
```

With a string containing the full journal (must contain at least the first journal line):

```js
var existingJournal = 'GlvAreTo0lCS...'
var journal = NodeJournal(existingJournal)
```

Or you can pipe in a stream:

```js
var fs = require('fs')
var existingJournal = fs.createReadStream('my-journal.txt')
var journal = NodeJournal(existingJournal)
```
# journal entry object

All functions and streams digest and produce an object containing some or all of the
following properties:

* `line` - The string literal of the [journal line](http://sdmp.io/docs/journal/#journal-entries).
* `identifier` - The calculated
	[journal line identifier](http://sdmp.io/docs/journal/#journal-line-identifier)
	for the object being produced.
* `author` - The [key fingerprint](http://sdmp.io/docs/cryptography/#key-fingerprint)
	of the author publishing the resource.
* `resource` - The [resource identifier](http://sdmp.io/docs/resource/#resource-identifier)
	of the resource being published.

# write to it: `.write(journalEntry, callback)`

Write to the journal by calling `.write` on the instantiated journal. The two properties are:

* `journalEntry` - A journal entry object containing `author` and `resource`. (If an
	`identifier` or `line` property is included, this is considered an *error*.)
* `callback` - A traditional error-first callback function. If there are no errors, the
	second parameter is a complete journal entry object for that line.

The error object returned has the following possible properties:

* `invalidJournalEntry` - The properties `author` and `resource` are not `string`.
* `containsIdentifierOrLine` - The property `line` or `identifier` are not falsey.

For example (data truncated with `...` for readability):

```js
journal.write({
	author: 'GlvAreTo...',
	resource: 'OTA8fSUK...'
}, function(error, entry) {
	console.log(entry.identifier) // 22tfYa3X...
})
```

# read from it: `.read(journalEntry, callback)`

Read from the journal by calling `.read` on the instantiated journal. The two properties are:

* `journalEntry` - A journal entry object containing at least one of `author`, `resource`,
	`identifier`, or `line`.
* `callback` - A traditional error-first callback function. The returned data is an array
	of any lines that match all parameters on the `journalEntry` passed in. Journal lines
	are considered to match when the line contains all of the parameters given in the
	`journalEntry` object.

The error object returned has the following possible properties:

* `invalidJournalEntry` - At least one of `author`, `resource`, `identifier`, or `line` must
	be set. All properties must be falsey or of the type `string`.

For example (data truncated with `...` for readability):

```js
journal.read({
	line: '22tfYa3X...'
}, function(error, entry) {
	console.log(entry.line) // 22tfYa3X...@GlvAreTo.../OTA8fSUK...
	console.log(entry.identifier) // 22tfYa3X...
	console.log(entry.author) // GlvAreTo...
	console.log(entry.resource) // OTA8fSUK...
})
```

# write emitter: `.on('write', callback)`

On any call to `.write`, the `write` event is emitted. The `callback` is given the
journal entry object that was written to the journal.

# read all: `.readAll()`

Returns the entire journal as an ordered array of journal entry objects.

# license

Released under the [Very Open License](http://veryopenlicense.com)

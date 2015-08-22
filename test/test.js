var NodeJournal = require('../')
var test = require('tape')
var fs = require('fs')

var author = 'GlvAreTo0lCSyum7Wzh8pzhxYOOu-gMIgO2N95AAwAGP6-nR8xCvWvIW0t9rF_ZZfpCY_fDV38JDFKaOU91A8Q'
var resource = 'reTo0GlvAlCSyzh8pum7WzhxYgMIgOOu-O2N9AGP65AAw-nR8vIW0xCvWt9rFpCY__ZZffDVJOU91DFKaA8Q38'
var identifier = 'dvgOj3boYBzvEtLGz2DOaGW6SKKTmu-jtgi38nn7t40TBW4ObYTQSmUIJk4xMRJaH-ePzvptJgyaR8J0feJ5jw'
var journalWithBadEntry = 'GlvAreTo0lCSyum7Wzh8pzhxYOOu-gMIgO2N95AAwAGP6-nR8xCvWvIW0t9rF_ZZfpCY_fDV38JDFKaOU91A8Q\nsomebadlinehere'
var goodJournal = fs.readFileSync('./test/good-journal.txt', { encoding: 'utf8' })

function createJournal(string) {
	var passed = false
	try {
		NodeJournal(string)
		passed = true
	} catch(ignore) {}
	return passed
}

test('simple start', function(t) {
	t.ok(createJournal(author), 'starting with only the first line')
	t.end()
})

test('using an invalid journal string', function(t) {
	t.notOk(createJournal(), 'throws error if no journal is passed in')
	t.notOk(createJournal('notlongenough'), 'throws error if journal passed in is too short')
	t.notOk(createJournal(journalWithBadEntry), 'throws error if journal passed in has bad entry')
	t.end()
})

test('good writing to a new journal', function(t) {
	var journal = NodeJournal(author)
	journal.write({
		author: author,
		resource: resource
	}, function(error, entry) {
		t.notOk(error, 'there should not be an error')
		t.equal(entry.author, author, 'author should be identical')
		t.equal(entry.resource, resource, 'resource should be identical')
		t.equal(entry.identifier, identifier, 'calculated identifier should be this')
		t.end()
	})
})

test('good writing emits event', function(t) {
	var journal = NodeJournal(author)
	journal.on('write', function(entry) {
		t.equal(entry.author, author, 'author should be identical')
		t.equal(entry.resource, resource, 'resource should be identical')
		t.equal(entry.identifier, identifier, 'calculated identifier should be this')
		t.end()
	})
	journal.write({
		author: author,
		resource: resource
	}, function(error, entry) {
		t.notOk(error, 'there should not be an error')
	})
})

test('good writing changes the journal', function(t) {
	var journal = NodeJournal(author)
	journal.write({
		author: author,
		resource: resource
	}, function(error, entry) {
		t.notOk(error, 'there should not be an error')
		var entries = journal.readAll()
		t.equal(entries.length, 2, 'the first line and the new written entry')
		t.equal(entries[0].identifier, author, 'the first should be the author')
		t.notOk(entries[0].resource, 'and nothing but the author')
		t.equal(entries[1].identifier, identifier, 'the second should be the new object')
		t.end()
	})
})

test('bad writing without author', function(t) {
	var journal = NodeJournal(author)
	journal.write({
		resource: resource
	}, function(error, entry) {
		t.notOk(entry, 'there should not be an entry')
		t.ok(error.invalidJournalEntry, 'should be this error')
		t.end()
	})
})

test('bad writing without resource', function(t) {
	var journal = NodeJournal(author)
	journal.write({
		author: author
	}, function(error, entry) {
		t.notOk(entry, 'there should not be an entry')
		t.ok(error.invalidJournalEntry, 'should be this error')
		t.end()
	})
})

test('bad writing with identifier', function(t) {
	var journal = NodeJournal(author)
	journal.write({
		identifier: identifier,
		author: author,
		resource: resource
	}, function(error, entry) {
		t.notOk(entry, 'there should not be an entry')
		t.ok(error.containsIdentifierOrLine, 'should be this error')
		t.end()
	})
})

test('bad writing with line', function(t) {
	var journal = NodeJournal(author)
	journal.write({
		line: identifier,
		author: author,
		resource: resource
	}, function(error, entry) {
		t.notOk(entry, 'there should not be an entry')
		t.ok(error.containsIdentifierOrLine, 'should be this error')
		t.end()
	})
})

test('good read by author', function(t) {
	var journal = NodeJournal(goodJournal)
	journal.read({
		author: author
	}, function(error, entries) {
		t.notOk(error, 'there should not be an error')
		t.equal(entries.length, 1, 'there is one by this author')
		t.equal(entries[0].author, author, 'should have this identifier')
		t.end()
	})
})

test('good read by resource', function(t) {
	var journal = NodeJournal(goodJournal)
	journal.read({
		resource: resource
	}, function(error, entries) {
		t.notOk(error, 'there should not be an error')
		t.equal(entries.length, 1, 'there is one of this resource')
		t.equal(entries[0].resource, resource, 'should be the requested resource')
		t.end()
	})
})

test('good read by line identifier', function(t) {
	var journal = NodeJournal(goodJournal)
	journal.read({
		identifier: identifier
	}, function(error, entries) {
		t.notOk(error, 'there should not be an error')
		t.equal(entries.length, 1, 'there is one of this resource')
		t.equal(entries[0].identifier, identifier, 'should be the requested resource')
		t.end()
	})
})

test('good read by author and resource', function(t) {
	var journal = NodeJournal(goodJournal)
	journal.read({
		author: author,
		resource: resource
	}, function(error, entries) {
		t.notOk(error, 'there should not be an error')
		t.equal(entries.length, 1, 'there is one of this resource')
		t.equal(entries[0].author, author, 'should be the requested resource')
		t.end()
	})
})

test('bad read with invalid properties', function(t) {
	var journal = NodeJournal(goodJournal)
	journal.read({
		resource: 123
	}, function(error, entries) {
		t.ok(error, 'there should be an error')
		t.notOk(entries, 'there should be no entries')
		t.end()
	})
})

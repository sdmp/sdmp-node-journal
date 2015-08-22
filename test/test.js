var NodeJournal = require('../')
var test = require('tape')

test('writing to a new journal', function(t) {
	var author = 'GlvAreTo0lCSyum7Wzh8pzhxYOOu-gMIgO2N95AAwAGP6-nR8xCvWvIW0t9rF_ZZfpCY_fDV38JDFKaOU91A8Q'
	var resource = 'reTo0GlvAlCSyzh8pum7WzhxYgMIgOOu-O2N9AGP65AAw-nR8vIW0xCvWt9rFpCY__ZZffDVJOU91DFKaA8Q38'
	var identifier = 'dvgOj3boYBzvEtLGz2DOaGW6SKKTmu-jtgi38nn7t40TBW4ObYTQSmUIJk4xMRJaH-ePzvptJgyaR8J0feJ5jw'

	// the new journal must have *at least* the first line, which is the author
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

var EventEmitter = require('events').EventEmitter
var crypto = require('crypto')
var base64url = require('base64url')

var journalLineRegex = /([a-zA-Z0-9_-]+)(?:@([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+))?$/

module.exports = function(input) {
	var emitter = new EventEmitter()
	var journal = instantiateJournal(input)

	emitter.write = function(journalEntry, callback) {
		if (!isValidWritableJournalEntryObject(journalEntry)) {
			callback({ invalidJournalEntry: true })
		} else if (journalEntry.identifier || journalEntry.line) {
			callback({ containsIdentifierOrLine: true })
		} else {
			var previousJournalEntry = journal[journal.length - 1]
			var realJournalEntry = {
				identifier: hashLineString(previousJournalEntry.line),
				author: journalEntry.author,
				resource: journalEntry.resource
			}
			realJournalEntry.line = generateLineStringForEntry(realJournalEntry)
			journal.push(realJournalEntry)
			emitter.emit('write', realJournalEntry)
			callback(false, realJournalEntry)
		}
	}

	emitter.read = function(journalEntry, callback) {
		if (!isValidReadableJournalEntryObject(journalEntry)) {
			callback({ invalidJournalEntry: true })
		} else {
			callback(false, journal.filter(entriesThatContainTheEntryKeys(journalEntry)))
		}
	}

	emitter.readAll = function() {
		return journal
	}

	emitter.readStream = function() {/* TODO: I don't know streams very well... */}

	return emitter
}

function isUndefinedOrString(input) {
	return input === undefined || typeof input === 'string'
}

function entriesThatContainTheEntryKeys(filterEntry) {
	return function filter(testableEntry) {
		return (!filterEntry.identifier || filterEntry.identifier === testableEntry.identifier)
			&& (!filterEntry.author || filterEntry.author === testableEntry.author)
			&& (!filterEntry.resource || filterEntry.resource === testableEntry.resource)
	}
}

function isValidReadableJournalEntryObject(journalEntry) {
	return !journalEntry
		|| typeof journalEntry !== 'object' 
		|| (!journalEntry.line && !journalEntry.author && !journalEntry.resource)
		|| (isUndefinedOrString(journalEntry.line)
			|| isUndefinedOrString(journalEntry.author)
			|| isUndefinedOrString(journalEntry.resource))
}

function isValidWritableJournalEntryObject(journalEntry) {
	return journalEntry
		&& typeof journalEntry === 'object'
		&& typeof journalEntry.author === 'string'
		&& typeof journalEntry.resource === 'string'
}

function instantiateJournal(input) {
	var minimumLengthOfOneEncodedHash = 86
	if (typeof input !== 'string' || input.length < minimumLengthOfOneEncodedHash) {
		throw { message: 'node journal must be instantiated with valid journal string' }
	}
	var journalLines = input.split('\n')
	var firstJournalEntry = generateFirstJournalEntry(journalLines.shift())
	return [firstJournalEntry].concat(journalLines.map(parseJournalEntryFromString))
}

function generateFirstJournalEntry(string) {
	return {
		identifier: string,
		line: string
	}
}

function parseJournalEntryFromString(journalEntryString) {
	var matcher = journalLineRegex.exec(journalEntryString)
	if (!matcher) {
		throw { message: 'invalid line entry: ' + journalEntryString, invalidJournalEntry: true }
	}
	var journalEntry = {
		identifier: matcher[1],
		author: matcher[2],
		resource: matcher[3]
	}
	journalEntry.line = generateLineStringForEntry(journalEntry)
	return journalEntry
}

function hashLineString(string) {
	var sha512Hash = crypto.createHash('sha512')
	sha512Hash.update(string)
	return base64url.fromBase64(sha512Hash.digest('base64'))
}

function generateLineStringForEntry(journalEntry) {
	if (journalEntry.author && journalEntry.resource) {
		return journalEntry.identifier + '@' + journalEntry.author + '/' + journalEntry.resource
	} else {
		return
	}
}

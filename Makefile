
SRC = lib/events.js lib/superagent.js

TESTS = test/node/*.js
REPORTER = dot

all: superagent.js superagent.min.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--growl \
		$(TESTS)

superagent.js: $(SRC)
	cat $^ > $@

superagent.min.js: superagent.js
	uglifyjs --no-mangle $< > $@

test-server:
	@node test/server

docs: lib

clean:
	rm -f superagent{,.min}.js

.PHONY: test docs clean
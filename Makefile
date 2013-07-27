
TESTS = test/node/*.js
REPORTER = dot

all: superagent.js

new-test:
	@NODE_ENV=test node_modules/.bin/grunt test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 2000 \
		--growl \
		$(TESTS)

test-cov: lib-cov
	SUPERAGENT_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	jscoverage lib lib-cov

superagent.js: components
	@component build \
	  --standalone superagent \
	  --out . --name superagent

components:
	component install

test-server:
	@node test/server

docs: test-docs

test-docs:
	make test REPORTER=doc \
		| cat docs/head.html - docs/tail.html \
		> docs/test.html

clean:
	node_modules/.bin/grunt clean

.PHONY: test-cov test docs test-docs clean

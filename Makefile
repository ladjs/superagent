OLDNODETESTS ?= lib/node/test/*.js lib/node/test/node/*.js
NODETESTS ?= test/*.js test/node/*.js
BROWSERTESTS ?= test/*.js test/client/*.js
REPORTER = spec

ifeq ("$(OLD_NODE_TEST)", "1")
	NODETESTS := $(OLDNODETESTS)
endif

test:
	@if [ "$(BROWSER)" = "1" ]; then \
		echo test on browser; \
		make test-browser; \
	fi

	@if [ "$(NODE_TEST)" = "1" ] || [ "x$(BROWSER)" = "x" ]; then \
		echo test on node; \
		make test-node; \
	fi
	
copy:
	@if [ "$(OLD_NODE_TEST)" = "1" ]; then \
		echo test on old node; \
		cp test/node/fixtures lib/node/test/node -rf; \
	else \
		echo test on plain node; \
	fi
	
test-node:copy
	@NODE_ENV=test HTTP2_TEST=$(HTTP2_TEST) ./node_modules/.bin/nyc ./node_modules/.bin/mocha \
		--require should \
		--trace-warnings \
		--throw-deprecation \
		--reporter $(REPORTER) \
		--slow 2000 \
		--timeout 5000 \
		--exit \
		$(NODETESTS)

test-cov: lib-cov
	SUPERAGENT_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

test-browser:
	SAUCE_APPIUM_VERSION=1.7 ./node_modules/.bin/zuul -- $(BROWSERTESTS)

test-browser-local:
	./node_modules/.bin/zuul --no-coverage --local 4000 -- $(BROWSERTESTS)

lib-cov:
	jscoverage lib lib-cov

test-server:
	@node test/server

docs: index.html test-docs docs/index.md

index.html: docs/index.md docs/head.html docs/tail.html
	marked < $< \
		| cat docs/head.html - docs/tail.html \
		> $@

docclean:
	rm -f index.html docs/test.html

test-docs: docs/head.html docs/tail.html
	make test REPORTER=doc \
		| cat docs/head.html - docs/tail.html \
		> docs/test.html

clean:
	rm -fr components

.PHONY: copy test-cov test docs test-docs clean test-browser-local

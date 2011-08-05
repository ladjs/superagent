
all: superagent.js superagent.min.js

superagent.js: lib/superagent.js
	cp -f $< $@

superagent.min.js: lib/superagent.js
	uglifyjs --no-mangle $< > $@

test:
	@node test/server

clean:
	rm -f superagent{,.min}.js

.PHONY: test clean
install: install-deps install-flow-typed

start:
	npx webpack-dev-server

install-deps:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

deploy:
	npx surge --project ./dist --domain http://ms-rss-loader.surge.sh/

test:
	npm test


test-coverage:
	npm test -- --coverage

lint:
	npx eslint --fix .

publish:
	npm publish

.PHONY: test
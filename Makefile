PYTHON ?= /bin/python3

.PHONY: build build-fe build-be

build: build-fe build-be

build-fe:
	cd frontend && npm run build

build-be:
	$(PYTHON) -m compileall backend/src
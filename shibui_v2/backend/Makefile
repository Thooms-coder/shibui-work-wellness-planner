PYTHON := .venv/bin/python
PIP := .venv/bin/pip
UVICORN := .venv/bin/uvicorn
ALEMBIC := .venv/bin/alembic

.PHONY: venv install install-dev migrate run run-sqlite test

venv:
	python3 -m venv .venv

install:
	$(PIP) install -e .

install-dev:
	$(PIP) install -e .[dev]

migrate:
	$(ALEMBIC) upgrade head

run:
	$(UVICORN) app.main:app --reload

run-sqlite:
	BACKEND_DATABASE_URL=sqlite:///./dev.db BACKEND_CORS_ORIGINS='["http://localhost:3000"]' $(UVICORN) app.main:app --reload

test:
	$(PYTHON) -m pytest

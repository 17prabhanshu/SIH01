.PHONY: bootstrap dev test test-unit test-integration test-e2e test-model test-security lint format type-check benchmark db-migrate db-seed db-reset docker-build docker-up docker-down docs clean

bootstrap:
	@echo "Bootstrapping project..."
	python3 -m venv venv
	./venv/bin/pip install -r requirements.txt
	@echo "Bootstrap complete."

dev:
	@echo "Starting development environment..."
	docker-compose up -d postgres redis minio
	./venv/bin/uvicorn services.api.main:app --reload

test: test-unit test-integration

test-unit:
	@echo "Running unit tests..."
	pytest tests/unit

test-integration:
	@echo "Running integration tests..."
	pytest tests/integration

test-e2e:
	@echo "Running end-to-end tests..."
	pytest tests/e2e

test-model:
	@echo "Running model tests..."
	pytest tests/model

test-security:
	@echo "Running security tests..."
	bandit -r services/ ml/

lint:
	flake8 services/ ml/
	black --check services/ ml/

format:
	black services/ ml/

type-check:
	mypy services/ ml/

benchmark:
	@echo "Running benchmarks..."
	pytest tests/performance

db-migrate:
	alembic upgrade head

db-seed:
	python scripts/seed_database.py

db-reset:
	alembic downgrade base
	alembic upgrade head

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docs:
	mkdocs build

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +

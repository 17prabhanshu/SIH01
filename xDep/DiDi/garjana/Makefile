.PHONY: test lint typecheck baseline-eval ablate benchmark demo clean

# --- Development ---
test:
	pytest tests/ -v --tb=short

test-unit:
	pytest tests/ -v --tb=short -m "not integration and not slow"

lint:
	ruff check garjana/ tests/ train/

format:
	ruff format garjana/ tests/ train/

typecheck:
	mypy garjana/ --ignore-missing-imports

check: lint typecheck test-unit

# --- Evaluation ---
baseline-eval:
	python -m train.evaluate --mode baselines --output eval/baselines.json

ablate:
	python -m train.evaluate --mode ablation --output eval/ablation.json

benchmark:
	python -m garjana.verify.benchmark --output docs/results/

# --- Docker ---
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

# --- Demo ---
demo:
	@echo "Starting Garjana demo with replay bundle..."
	docker compose -f docker-compose.yml up -d
	@echo "Demo running at http://localhost:3000"
	@echo "API at http://localhost:8000"
	@echo "Mode: REPLAY | Data: pre-computed bundle"

# --- Data ---
prepare-sevir:
	python -m train.prepare_sevir

# --- Clean ---
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .pytest_cache .mypy_cache .ruff_cache

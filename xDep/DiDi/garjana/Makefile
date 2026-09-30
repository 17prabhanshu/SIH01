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

compare-opensource:
	@echo "Cloning DeepMind DGMR implementation..."
	@git clone https://github.com/openclimatefix/skillful_nowcasting.git /tmp/skillful_nowcasting || true
	@echo "Running model comparison..."
	python verify/compare_models.py

# --- Docker ---
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

# --- Demo ---
demo:
	@echo "Starting Garjana demo servers..."
	bash -c "source .venv/bin/activate && python -m uvicorn api.main:app --port 8000 > /dev/null 2>&1 &"
	bash -c "cd frontend && npm start > /dev/null 2>&1 &"
	@echo "Waiting for servers to start..."
	sleep 5
	@echo "Running playwright demo test..."
	bash -c "source .venv/bin/activate && pytest tests/test_playwright_demo.py"
	@echo "Killing servers..."
	lsof -ti:8000 | xargs kill -9 || true
	lsof -ti:3000 | xargs kill -9 || true

# --- Data ---
prepare-sevir:
	python -m train.prepare_sevir

# --- Clean ---
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .pytest_cache .mypy_cache .ruff_cache

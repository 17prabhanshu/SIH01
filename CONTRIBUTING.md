# Contributing Guidelines

Thank you for your interest in contributing to the NER Landslide Early Warning platform. Since this is a government-grade system, we have strict quality and security standards.

## Development Workflow
1. Fork the repository and create a new branch for your feature or bug fix.
2. Ensure you have the required dependencies installed (see `Makefile`).
3. Write clean, modular, and well-documented code.
4. Add comprehensive unit and integration tests.
5. Run all linters and tests before committing: `make lint format type-check test`.

## Pull Request Process
1. Ensure your PR addresses a specific issue or feature request.
2. Provide a clear and detailed description of the changes.
3. Ensure all CI checks pass.
4. Your code must be reviewed by at least one core maintainer before merging.

## Coding Standards
- **Python**: Follow PEP 8 guidelines. Use Black for formatting, Flake8 for linting, and Mypy for static type checking.
- **TypeScript**: Follow strict type checking.
- **Documentation**: All public APIs and core algorithms must have comprehensive docstrings.

## Code of Conduct
Please maintain a respectful and professional demeanor in all interactions.

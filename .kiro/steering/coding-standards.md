# Coding Standards and Best Practices

## General Guidelines

- Write clean, readable, production-quality code
- Use type hints in Python for better code clarity
- Follow PEP 8 style guidelines for Python code
- Write descriptive variable and function names
- Keep functions focused and single-purpose
- Add docstrings to all classes and functions

## Python Standards

### Code Style

- Use 4 spaces for indentation
- Maximum line length: 100 characters
- Use snake_case for functions and variables
- Use PascalCase for class names
- Use UPPER_CASE for constants

### Documentation

- Include module-level docstrings explaining purpose
- Use Google-style docstrings for functions and classes
- Document parameters, return values, and exceptions
- Add inline comments for complex logic only

### Error Handling

- Use specific exception types
- Always include error context in exception messages
- Log errors appropriately
- Fail gracefully with meaningful error messages

## Frontend Standards

### UI/UX Principles

- Prioritize clarity and readability
- Use consistent color schemes and typography
- Ensure responsive design for different screen sizes
- Provide loading states for async operations
- Include helpful tooltips and labels
- Make interactive elements obvious

### Performance

- Optimize data updates to prevent UI lag
- Use efficient rendering techniques
- Implement proper state management
- Cache computed values when appropriate

## Data Processing Standards

### Efficiency

- Vectorize operations using pandas/numpy
- Avoid unnecessary data copies
- Use appropriate data structures
- Profile performance-critical sections

### Data Quality

- Validate input data
- Handle missing values explicitly
- Document data transformations
- Maintain data lineage

## Testing Approach

- Focus on core functionality testing
- Test edge cases for critical algorithms
- Validate data processing pipelines
- Test API endpoints if implemented
- Manual testing for UI/UX validation

## File Organization

### Python Files

- `src/data_processing/` - Data ingestion and cleaning
- `src/analytics/` - Core analytics algorithms
- `src/strategy/` - Strategy recommendation engine
- `src/api/` - API layer if needed
- `src/utils/` - Shared utilities and helpers

### Frontend Files

- Organize by feature/component
- Separate business logic from presentation
- Keep configuration separate from code

## Version Control

- Write clear, descriptive commit messages
- Commit logical units of work
- Keep commits focused and atomic
- Use meaningful branch names if branching

## Code Review Checklist

Before considering code complete:

- Code follows style guidelines
- Functions have appropriate docstrings
- No hardcoded values (use constants/config)
- Error handling is appropriate
- Code is DRY (Don't Repeat Yourself)
- Performance is acceptable
- UI is polished and intuitive

## Prohibited Practices

- NO emoji characters in code, comments, or strings
- NO print statements in production code (use logging)
- NO magic numbers (use named constants)
- NO overly complex one-liners
- NO commented-out code in final submission
- NO placeholder or TODO comments in submission

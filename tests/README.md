# Tests Directory

This directory contains all test files for the ClientScopeAI project.

## Organization

All test files should be placed in this directory to keep the codebase clean and organized.

### Test Types

- **Unit Tests**: Test individual components/functions
- **Integration Tests**: Test how components work together  
- **API Tests**: Test backend endpoints and database operations
- **Scraper Tests**: Test Instagram scraping functionality
- **Vision Tests**: Test AI vision/scoring capabilities

### Running Tests

To run tests, use the following commands:

```bash
# Run all tests
npm test

# Run specific test file
node tests/test_filename.js
```

### Best Practices

1. Name test files with the `test_` prefix followed by the feature being tested
2. Include descriptive test names and comments
3. Use proper error handling and logging
4. Clean up any temporary data after tests
5. Make tests independent and repeatable

## Migration Note

All test files have been moved from their previous scattered locations to this centralized directory for better organization and maintainability. 
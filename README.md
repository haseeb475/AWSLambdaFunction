# Plutus21 Serverless Tasks API

A serverless API for a to-do list application built with AWS Lambda, DynamoDB, and TypeScript.

## Overview

This project implements a serverless API for retrieving task lists from a DynamoDB database. It follows object-oriented programming principles and uses TypeScript for type safety.

Key features:
- AWS Lambda function implementation with TypeScript
- Repository pattern for data access
- Service layer for business logic
- Local development and testing support
- AWS SAM for local Lambda invocation

## Prerequisites

- Node.js (v18 or later)
- AWS CLI
- AWS SAM CLI
- Docker (for local DynamoDB and Lambda testing)
- TypeScript

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/haseeb475/AWSLambdaFunction.git
   cd AWSLambdaFunction
   ```

2. Install dependencies:
   ```bash
   npm i --legacy-peer-deps
   ```

3. Compile TypeScript to JavaScript:
   ```bash
   npx tsc
   ```

## Local Development

### Setting up Local DynamoDB

This project supports running against a local DynamoDB instance for development:

1. Start a local DynamoDB instance using Docker:
   ```bash
   docker run -p 8000:8000 amazon/dynamodb-local
   ```

2. Run the setup script to create the table and sample data:
   ```bash
   node dynamoDb.js
   ```

### Running the Lambda Function Locally

You can test the Lambda function locally using AWS SAM CLI:

```bash
# Compile TypeScript first
npx tsc

# Invoke the function with a test event
sam local invoke GetTasksFunction -e events/event.json
```

## Testing

The code includes test data that's automatically used when `NODE_ENV` is set to `test`. This allows for easy testing without a database connection. This can be done in template.yml file.

```bash
# Compile and run
npx tsc
sam local invoke GetTasksFunction -e events/event.json
```

## Deployment

### Prerequisites for Deployment

- AWS Account
- Configured AWS CLI with appropriate permissions

### Deploying to AWS

1. Build the SAM application:
   ```bash
   sam build
   ```

2. Deploy to AWS:
   ```bash
   sam deploy --guided
   ```

3. Follow the prompts to complete deployment.

### Manual Deployment

Alternatively, you can package and deploy manually:

```bash
# Compile TypeScript
npx tsc

# Package the application
sam package --output-template-file packaged.yaml --s3-bucket YOUR_S3_BUCKET

# Deploy the packaged application
sam deploy --template-file packaged.yaml --stack-name plutus21-tasks-api --capabilities CAPABILITY_IAM
```

## Implementation Details

The implementation follows OOP principles with three main components:

1. **Task Repository (TaskRepository)** - Handles data access to DynamoDB
2. **Task Service (TaskService)** - Contains business logic and uses the repository
3. **Lambda Handler** - Manages HTTP requests and responses

The code includes proper error handling and uses async/await for asynchronous operations.

## API Response Format

Successful response:
```json
{
  "success": true,
  "data": [
    {
      "id": "task1",
      "title": "Complete assessment",
      "completed": false,
      "createdAt": "2025-10-20T12:00:00Z"
    },
    {
      "id": "task2",
      "title": "Review code",
      "completed": true,
      "createdAt": "2025-10-21T10:00:00Z"
    }
  ],
  "count": 2
}
```

Error response:
```json
{
  "success": false,
  "message": "An error occurred while retrieving tasks",
  "error": "Error message details"
}
```

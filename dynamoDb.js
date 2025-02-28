const AWS = require('aws-sdk');
const fs = require('fs');

// Configure the DynamoDB client
const dynamoDB = new AWS.DynamoDB({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'dummy',
  secretAccessKey: 'dummy'
});

// Create the table
async function createTable() {
  const params = {
    TableName: 'TasksTable',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    const result = await dynamoDB.createTable(params).promise();
    console.log('Table created successfully:', result);
    return result;
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('Table already exists');
    } else {
      console.error('Error creating table:', error);
    }
  }
}

// Add sample data
async function addSampleData() {
  const tasks = [
    {
      id: { S: 'task1' },
      title: { S: 'Complete assessment' },
      description: { S: 'Implement AWS Lambda function' },
      completed: { BOOL: false },
      createdAt: { S: '2023-10-20T12:00:00Z' }
    },
    {
      id: { S: 'task2' },
      title: { S: 'Review documentation' },
      completed: { BOOL: true },
      createdAt: { S: '2023-10-21T10:00:00Z' }
    },
    {
      id: { S: 'task3' },
      title: { S: 'Deploy application' },
      description: { S: 'Deploy to production environment' },
      completed: { BOOL: false },
      createdAt: { S: '2023-10-22T09:00:00Z' }
    }
  ];

  for (const task of tasks) {
    const params = {
      TableName: 'TasksTable',
      Item: task
    };

    try {
      await dynamoDB.putItem(params).promise();
      console.log(`Added task: ${task.id.S}`);
    } catch (error) {
      console.error(`Error adding task ${task.id.S}:`, error);
    }
  }
}

// Run the setup
async function setupDynamoDB() {
  await createTable();
  console.log('Waiting for table to become active...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await addSampleData();
  console.log('Setup complete!');
}

setupDynamoDB();
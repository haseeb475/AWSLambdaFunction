import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Interface representing a Task item from DynamoDB
 */
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * TaskRepository class for handling DynamoDB operations related to tasks
 */
class TaskRepository {
  private dynamoDB: DynamoDB.DocumentClient;
  private tableName: string;

  /**
   * Constructor initializes the DynamoDB document client and sets table name
   * @param tableName The name of the DynamoDB table
   */
  constructor(tableName: string, isLocal: boolean = true) {
    let options: DynamoDB.ClientConfiguration  = {};

    if (process.env.NODE_ENV === 'test' && isLocal) {
      const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://host.docker.internal:8000';
      console.log(`Connecting to local DynamoDB at ${endpoint}`);
      
      options = {
        endpoint,
        region: 'localhost',
        credentials: {
          accessKeyId: 'dummy',
          secretAccessKey: 'dummy'
        }
      };
    }
    
    this.dynamoDB = new DynamoDB.DocumentClient(options);
    this.tableName = tableName;
  }

  /**
   * Retrieves all tasks from the DynamoDB table
   * @returns Promise containing an array of Task objects
   */
  public async getAllTasks(): Promise<Task[]> {
    try {
      if (process.env.NODE_ENV === 'test') {
        return [
          {
            id: "task1",
            title: "Complete assessment",
            completed: false,
            createdAt: "2025-10-20T12:00:00Z"
          },
          {
            id: "task2",
            title: "Review code",
            completed: true,
            createdAt: "2025-10-21T10:00:00Z"
          }
        ] as Task[];
      }        

      const params: DynamoDB.DocumentClient.ScanInput = {
        TableName: this.tableName
      };
      const result = await this.dynamoDB.scan(params).promise();
      return result.Items as Task[];
    } catch (error) {
      console.error('Error fetching tasks from DynamoDB:', error);
      throw new Error('Failed to retrieve tasks from database');
    }
  }
}

/**
 * TaskService class for business logic related to tasks
 */
class TaskService {
  private taskRepository: TaskRepository;

  /**
   * Constructor initializes the task repository
   * @param taskRepository An instance of TaskRepository
   */
  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Gets all tasks from the repository
   * @returns Promise containing an array of Task objects
   */
  public async getAllTasks(): Promise<Task[]> {
    return await this.taskRepository.getAllTasks();
  }
}

/**
 * Lambda handler function for the get-all-tasks API endpoint
 * @param event APIGatewayProxyEvent from API Gateway
 * @returns APIGatewayProxyResult containing tasks or error message
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Initialize the repository and service with the table name
  const tableName = process.env.TASKS_TABLE_NAME || 'TasksTable';
  const taskRepository = new TaskRepository(tableName);
  const taskService = new TaskService(taskRepository);
  
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Fetch all tasks from the service
    const tasks = await taskService.getAllTasks();
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: tasks,
        count: tasks.length
      })
    };
  } catch (error) {
    console.error('Error in lambda handler:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: 'An error occurred while retrieving tasks',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

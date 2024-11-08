const AWS = require('aws-sdk');
const express = require('express');
const app = express();
const port = 8080;

// Set AWS region (replace with your AWS region, e.g., 'us-east-1')
AWS.config.update({ region: 'us-east-1' });

// Initialize the DynamoDB DocumentClient
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'PatientData'; // DynamoDB Table name

// Middleware to parse JSON requests
app.use(express.json());

// Create a new patient record
app.post('/patients', async (req, res) => {
  const { patientID, name, age, condition } = req.body;

  const params = {
    TableName: TABLE_NAME,
    Item: {
      patientID, // Partition key
      name,
      age,
      condition
    }
  };

  try {
    await dynamodb.put(params).promise();
    res.status(201).json({ message: 'Patient data created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create patient data' });
  }
});

// Get patient record by ID
app.get('/patients/:patientID', async (req, res) => {
  const { patientID } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: { patientID }
  };

  try {
    const result = await dynamodb.get(params).promise();
    if (!result.Item) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(result.Item); // Return the patient data as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve patient data' });
  }
});

// Update patient data
app.put('/patients/:patientID', async (req, res) => {
  const { patientID } = req.params;
  const { name, age, condition } = req.body;

  const params = {
    TableName: TABLE_NAME,
    Key: { patientID },
    UpdateExpression: 'set #name = :name, #age = :age, #condition = :condition',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#age': 'age',
      '#condition': 'condition'
    },
    ExpressionAttributeValues: {
      ':name': name,
      ':age': age,
      ':condition': condition
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    const result = await dynamodb.update(params).promise();
    res.json({ message: 'Patient data updated successfully', updatedAttributes: result.Attributes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update patient data' });
  }
});

// Delete patient record
app.delete('/patients/:patientID', async (req, res) => {
  const { patientID } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: { patientID }
  };

  try {
    await dynamodb.delete(params).promise();
    res.json({ message: 'Patient data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete patient data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.target_table;

exports.handler = async (event) => {
    const { principalId, content } = JSON.parse(event.body);

    const newEvent = {
        id: uuidv4(),
        principalId: principalId,
        createdAt: new Date().toISOString(),
        body: content
    };

    const params = {
        TableName: tableName,
        Item: newEvent
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify({ event: newEvent })
        };
    } catch (error) {
        console.error('Error saving event to DynamoDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not save event' })
        };
    }
};

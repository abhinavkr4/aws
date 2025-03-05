const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);

        // Validate request
        if (!body.principalId || typeof body.principalId !== "number" || !body.content) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid request: 'principalId' (int) and 'content' (map) are required." })
            };
        }

        // Create event object
        const newEvent = {
            id: uuidv4(),
            principalId: body.principalId,
            createdAt: new Date().toISOString(),
            body: body.content
        };

        // Store in DynamoDB
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: newEvent
        }).promise();

        // Return response
        return {
            statusCode: 201,
            body: JSON.stringify({ event: newEvent })
        };

    } catch (error) {
        console.error("Error storing event:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to store event" })
        };
    }
};

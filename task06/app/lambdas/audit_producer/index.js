const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const AUDIT_TABLE = process.env.TARGET_TABLE || "Audit"; // Uses alias from syndicate_aliases.yml

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    const records = event.Records.map(record => processRecord(record));

    try {
        await Promise.all(records);
        console.log("Successfully processed records");
    } catch (error) {
        console.error("Error processing records:", error);
    }
};

async function processRecord(record) {
    const eventName = record.eventName; // INSERT, MODIFY, REMOVE
    const newItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage || {});
    const oldItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage || {});
    const itemKey = newItem.key || oldItem.key;

    const auditEntry = {
        id: uuidv4(),
        itemKey: itemKey,
        modificationTime: new Date().toISOString()
    };

    if (eventName === "INSERT") {
        auditEntry.newValue = newItem;
    } else if (eventName === "MODIFY") {
        auditEntry.oldValue = oldItem.value;
        auditEntry.newValue = newItem.value;
    } else if (eventName === "REMOVE") {
        auditEntry.oldValue = oldItem.value;
    }

    return dynamoDB.put({
        TableName: AUDIT_TABLE,
        Item: auditEntry
    }).promise();
}

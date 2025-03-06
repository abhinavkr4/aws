const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const AUDIT_TABLE = "${target_table}"; // Uses alias from syndicate_aliases.yml

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
    const newItem = record.dynamodb.NewImage ? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) : null;
    const oldItem = record.dynamodb.OldImage ? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage) : null;
    const itemKey = newItem?.key || oldItem?.key || "UnknownKey";

    const auditEntry = {
        id: uuidv4(),
        itemKey: itemKey,
        modificationTime: new Date().toISOString()
    };

    if (eventName === "INSERT") {
        auditEntry.newValue = {
            key: newItem.key,
            value: newItem.value
        };
    } else if (eventName === "MODIFY") {
        auditEntry.oldValue = oldItem?.value ?? null;
        auditEntry.newValue = newItem?.value ?? null;

        // Capture updated attribute (assumes single attribute update)
        if (oldItem?.value !== newItem?.value) {
            auditEntry.updatedAttribute = "value";
        }
    } else if (eventName === "REMOVE") {
        auditEntry.oldValue = oldItem?.value ?? null;
    }

    return dynamoDB.put({
        TableName: AUDIT_TABLE,
        Item: auditEntry
    }).promise();
}

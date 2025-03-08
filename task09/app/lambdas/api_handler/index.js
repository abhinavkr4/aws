import { getLatestWeather } from "weather_sdk"; // Importing from the Lambda Layer

export const handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Extract the request path and method
    const requestPath = event?.rawPath || event?.path;
    const httpMethod = event?.httpMethod || "UNKNOWN";

    if (requestPath === "/weather" && httpMethod === "GET") {
        try {
            // Fetch latest weather data from the weather-sdk layer
            const weatherData = await getLatestWeather();

            // Successful response
            return {
                statusCode: 200,
                body: JSON.stringify(weatherData),
                headers: { "content-type": "application/json" },
                isBase64Encoded: false,
            };
        } catch (error) {
            console.error("Error fetching weather data:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ statusCode: 500, message: "Internal Server Error" }),
                headers: { "content-type": "application/json" },
                isBase64Encoded: false,
            };
        }
    }

    // Invalid request response
    return {
        statusCode: 400,
        body: JSON.stringify({
            statusCode: 400,
            message: `Bad request syntax or unsupported method. Request path: ${requestPath}. HTTP method: ${httpMethod}`,
        }),
        headers: { "content-type": "application/json" },
        isBase64Encoded: false,
    };
};

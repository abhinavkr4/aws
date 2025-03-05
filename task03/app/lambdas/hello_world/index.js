exports.handler = async (event) => {
    // Determine request path and method
    const path = event.rawPath || event.path || "/";
    const method = event.requestContext?.http?.method || event.httpMethod || "UNKNOWN";

    // Handle only /hello GET request
    if (path === "/hello" && method === "GET") {
        return {
            statusCode: 200,
            body: JSON.stringify({statusCode:200, message: "Hello from Lambda" }), // Removed duplicate statusCode
        };
    }


};


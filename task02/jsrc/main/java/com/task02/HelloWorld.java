package com.task02;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.syndicate.deployment.annotations.lambda.LambdaHandler;
import com.syndicate.deployment.model.RetentionSetting;

import java.util.HashMap;
import java.util.Map;

@LambdaHandler(
    lambdaName = "hello_world",
	roleName = "hello_world-role",
	isPublishVersion = true,
	aliasName = "${lambdas_alias_name}",
	logsExpiration = RetentionSetting.SYNDICATE_ALIASES_SPECIFIED
)
public class HelloWorld implements RequestHandler<Map<String, Object>, Map<String, Object>> {

	@Override
	public Map<String, Object> handleRequest(Map<String, Object> request, Context context) {
		System.out.println("Received request: " + request);

		// Extract HTTP method and path
		String method = (String) request.get("httpMethod");
		String path = (String) request.get("path");

		Map<String, Object> response = new HashMap<>();

		// Check if the request is for /hello with GET method
		if ("GET".equalsIgnoreCase(method) && "/hello".equalsIgnoreCase(path)) {
			response.put("statusCode", 200);
			response.put("message", "Hello from Lambda");
		} else {
			// Return 400 for other requests
			response.put("statusCode", 400);
			response.put("error", "Invalid request");
			response.put("message", "The requested endpoint '" + path + "' with method '" + method + "' is not supported.");
		}

		return response;
	}
}
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'First App API',
			version: '1.0.0',
			description: 'API documentation for First App - Project Management API',
		},
		servers: [
			{
				url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000',
				description: 'Development server',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [{ bearerAuth: [] }],
	},
	apis: [
		path.join(__dirname, '..', 'routes', '*.js'),
		path.join(__dirname, '..', 'controllers', '*.js'),
		path.join(__dirname, '..', 'docs', '*.json'),
	],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

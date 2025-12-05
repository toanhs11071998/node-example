Swagger UI

- Visit: http://localhost:3000/api/docs when server is running.
- The OpenAPI spec is generated at runtime by `swagger-jsdoc` from JSDoc comments in `routes/*.js` and `controllers/*.js`.
- To extend documentation, add `@swagger` JSDoc blocks to route/controller files and restart the server.

Optional: create a static `docs/swagger.json` by writing the generated spec to a file during development. I can add a script for that if you want.

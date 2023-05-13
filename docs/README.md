# PvP Bros

This documentation provides an overview of the User model routes available in this API.

## Routes

| Route | Description |
| --- | --- |
| GET / | Retrieves a simple greeting message. |
| POST /sign-up | Creates a new user and generates a JWT token. |
| POST /login | Authenticates user and generates a JWT token. |
| GET /logout | Logs out the user by clearing the JWT token. |
| GET /users | Retrieves all users (requires authentication). |
| GET /users/:id | Retrieves a specific user (requires authentication). |
| PUT /users/:id/update | Updates a specific user's information (requires authentication). |
| DELETE /users/:id/delete | Deletes a specific user (requires authentication). |
| POST /users/:playerId/attack | Performs an attack action on another user (requires authentication). |
| POST /users/:playerId/heal | Heals the specified user (requires authentication). |
| GET /edit-catch-phrase | Retrieves a list of available catch phrase operations (requires authentication). |
| PUT /:id/edit-catch-phrase | Updates the catch phrase of a specific user (requires authentication). |


## Authentication

You will need to be authenticated to access any of the pages within this application.
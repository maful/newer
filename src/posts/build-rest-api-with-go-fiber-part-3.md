---
title: Build REST API with Go Fiber and PlanetScale - Part 3
permalink: "posts/{{ title | slugify }}/index.html"
description: Build REST API with Go Fiber and in this tutorial we will deploy the schema from the dashboard.
opengrapgh: true
date: 2022-10-19
color: instagram-gradient
promotion_code: currency-conversion-ruby
tags:
  - PlanetScale
  - Go
  - API
  - Backend
---

## Deploy the schema

Now, it is time to deploy the `add-users-table` branch into the main branch

```
$ pscale deploy-request create fiber-pscale add-users-table
Deploy request #1 successfully created.
```

Now check your dashboard, you'll see here that you requested schema changes from the development branch to the main branch. If you are familiar with Git, it is similar to Pull Request.

![Deploy Request in Review](./src/assets/images/deploy-request-in-review.png "Deploy Request in Review")

Now, approve the request and PlanetScale automatically apply the new schema into the main branch **without downtime**.

```
$ pscale deploy-request deploy fiber-pscale 1
Successfully deployed dhacze78ukhv from add-users-table to main.
```

Now, back and check the dashboard, it's deployed!🎊

![Deploy Request Deployed](./src/assets/images/deploy-request-deployed.png "Deploy Request Deployed")

if you no longer need to make schema changes from the branch, now you can safely delete it.

```
$ pscale branch delete fiber-pscale add-users-table
```

## Handlers

Create a file called `users.go` inside the `handlers` directory. And now, create a connection to the main branch so the application can communicate with the database.

```
$ pscale connect fiber-pscale main --port 3309
```

> Note: It's recommended to use a secure connection while connecting to the main branch once you deployed your application. More https://docs.planetscale.com/reference/secure-connections

### Create a user

Create a function `CreateUser` and initialize `createUserRequest` struct in `users.go`.

```go
package handlers

import (
    "net/http"

    "github.com/gofiber/fiber/v2"
    "github.com/maful/fiber-pscale/models"
)

type createUserRequest struct {
    Name    string `json:"name" binding:"required"`
    Email   string `json:"email" binding:"required"`
    Website string `json:"website" binding:"required"`
}

func CreateUser(c *fiber.Ctx) error {
    req := &createUserRequest{}
    if err := c.BodyParser(req); err != nil {
        return c.Status(http.StatusBadRequest).JSON(&fiber.Map{
            "message": err.Error(),
        })
    }
    user := models.User{
        Name:    req.Name,
        Email:   req.Email,
        Website: req.Website,
    }
    models.DB.Create(&user)
    return c.Status(fiber.StatusCreated).JSON(&fiber.Map{
        "user": user,
    })
}
```

open `main.go`, add a new handler to call that function

```go
torchlight! {"lineNumbers": false}
import (
    // ...
    "github.com/maful/fiber-pscale/handlers" // shada:add
)

app.Get("/", func(c *fiber.Ctx) error {
		return c.Status(http.StatusOK).JSON(&fiber.Map{
        "message": "API with Fiber and PlanetScale",
		})
})
app.Post("/users", handlers.CreateUser)  // shada:add
```

run the app, and try to create the user

```bash
curl --location --request POST 'http://localhost:3000/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "John",
    "email": "john@example.com",
    "website": "https://example.com"
}'
```

response

```json
{
  "user": {
    "ID": 1,
    "CreatedAt": "2021-09-06T20:04:31.022+07:00",
    "UpdatedAt": "2021-09-06T20:04:31.022+07:00",
    "DeletedAt": null,
    "name": "John",
    "email": "john@example.com",
    "website": "https://example.com"
  }
}
```

### List all users

Still in `users.go`, create a new function called `GetUsers`.

```go
func GetUsers(c *fiber.Ctx) error {
    var users []models.User
    models.DB.Find(&users)

    return c.Status(http.StatusOK).JSON(&fiber.Map{
        "users": users,
    })
}
```

Back to main.go and register the function to the app, place it above the create user handler.

```go
app.Get("/users", handlers.GetUsers) // shada:add
app.Post("/users", handlers.CreateUser)
```

stop the existing app, and run again. You should always do this because the app doesn't refresh automatically when we made changes.

```bash
curl --location --request GET 'http://localhost:3000/users'
```

response

```json
{
  "users": [
    {
      "ID": 1,
      "CreatedAt": "2021-09-06T20:04:31.022+07:00",
      "UpdatedAt": "2021-09-06T20:04:31.022+07:00",
      "DeletedAt": null,
      "name": "John",
      "email": "john@example.com",
      "website": "https://example.com"
    }
  ]
}
```

### Get user details

Add a new function called `GetUser` in the bottom of `GetUsers` function.

```go
func GetUser(c *fiber.Ctx) error {
    var user models.User
    if err := models.DB.First(&user, "id = ?", c.Params("id")).Error; err != nil {
        return c.Status(http.StatusNotFound).JSON(&fiber.Map{
            "message": "Record not found!",
        })
    }

    return c.Status(http.StatusOK).JSON(&fiber.Map{
        "user": user,
    })
}
```

and add a new handler in `main.go`

```go
app.Get("/users", handlers.GetUsers)
app.Get("/users/:id", handlers.GetUser) // shada:add
```

now, we try to get the user details with id 1

```bash
curl --location --request GET 'http://localhost:3000/users/1'
```

response

```json
{
  "user": {
    "ID": 1,
    "CreatedAt": "2021-09-06T20:04:31.022+07:00",
    "UpdatedAt": "2021-09-06T20:04:31.022+07:00",
    "DeletedAt": null,
    "name": "John",
    "email": "john@example.com",
    "website": "https://example.com"
  }
}
```

if try to get the id that doesn't exist

```bash
curl --location --request GET 'http://localhost:3000/users/100'
```

```json
{
  "message": "Record not found!"
}
```

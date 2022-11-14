---
title: Build REST API with Go Fiber and PlanetScale - Part 4
permalink: "posts/{{ title | slugify }}/index.html"
description: Build REST API with Go Fiber and in this tutorial we will finishing the API and deploy the schema to the main branch.
opengrapgh: true
date: 2022-10-20
color: sunny-morning-gradient
illustration: person_working_online
promotion_code: people-management
tags:
  - PlanetScale
  - Go
  - API
  - Backend
---

## Update a user

Again, add a new function called `UpdateUser` in the users handler.

```go
// torchlight! {"lineNumbers": false}
func UpdateUser(c *fiber.Ctx) error {
    // first, check if the user is exist
    user := models.User{}
    if err := models.DB.First(&user, "id = ?", c.Params("id")).Error; err != nil {
        return c.Status(http.StatusNotFound).JSON(&fiber.Map{
            "message": "Record not found!",
        })
    }

    // second, parse the request body
    request := &updateUserRequest{}
    if err := c.BodyParser(request); err != nil {
        return c.Status(http.StatusBadRequest).JSON(&fiber.Map{
            "message": err.Error(),
        })
    }

    // third, update the user
    updateUser := models.User{
        Name:    request.Name,
        Email:   request.Email,
        Website: request.Website,
    }
    models.DB.Model(&user).Updates(&updateUser)

    return c.Status(http.StatusOK).JSON(&fiber.Map{
        "user": user,
    })
}
```

register `UpdateUser` in the `main.go` under the

```go
// torchlight! {"lineNumbers": false}
app.Post("/users", handlers.CreateUser)
app.Put("/users/:id", handlers.UpdateUser) // [tl! add]
```

now, re-run the application. Update the user that we created before.

```curl
# torchlight! {"lineNumbers": false}
curl --location --request PUT 'http://localhost:3000/users/1' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Machine name"
}'
```

response

```json
{
  "user": {
    "ID": 1,
    "CreatedAt": "2021-09-08T08:07:25.042+07:00",
    "UpdatedAt": "2021-09-08T08:15:52.249+07:00",
    "DeletedAt": null,
    "name": "Machine name",
    "email": "joh@example.com",
    "website": "google.com"
  }
}
```

when the user doesn't exist

```curl
# torchlight! {"lineNumbers": false}
curl --location --request PUT 'http://localhost:3000/users/100' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Machine name"
}'
```

response

```json
{
  "message": "Record not found!"
}
```

## Delete a user

Add the delete user function at the bottom of the users handler.

```go
// torchlight! {"lineNumbers": false}
func DeleteUser(c *fiber.Ctx) error {
    // first, check if the user is exist
    user := models.User{}
    if err := models.DB.First(&user, "id = ?", c.Params("id")).Error; err != nil {
        return c.Status(http.StatusNotFound).JSON(&fiber.Map{
            "message": "Record not found!",
        })
    }

    // second, delete the user
    models.DB.Delete(&user)

    return c.Status(http.StatusOK).JSON(&fiber.Map{
        "message": "Success",
    })
}
```

register the function in `main.go`

```go
// torchlight! {"lineNumbers": false}
app.Put("/users/:id", handlers.UpdateUser)
app.Delete("/users/:id", handlers.DeleteUser) // [tl! add]
```

so, create a new user again

```curl
# torchlight! {"lineNumbers": false}
curl --location --request POST 'http://localhost:3000/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Badu",
    "email": "joh@example.com",
    "website": "google.com"
}'
```

see the `id` from the response, we will delete that user

```curl
# torchlight! {"lineNumbers": false}
curl --location --request DELETE 'http://localhost:3000/users/2'
```

response

```json
{
  "message": "Success"
}
```

## Summary

PlanetScale offers Developer plan pricing that you can use for the development lifecycle and it's completely **FREE**. You can create up to 3 databases and 3 branches for each database. Basically, this is going to be new knowledge for the developer who never use a serverless database and with a new workflow how to make a schema.

Fiber is a great web framework to build application in Go, they are fast, have rich features and the documentation is good.

This post, it's just a simple web API application to give a basic understanding of how to use Fiber and PlanetScale database. In the next one, we are going to build a more complex web API with the same tech stacks.

Download the full source code on this [repository](https://github.com/maful/fiber-pscale).

Thank you.

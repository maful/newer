---
title: Build REST API with Go Fiber and PlanetScale - Part 2
permalink: "posts/{{ title | slugify }}/index.html"
description: Build REST API with Go Fiber and in this tutorial we will connect to the database.
opengrapgh: true
date: 2022-10-19
color: spring-warmth-gradient
illustration: person_working_online
promotion_code: versafleet-api
tags:
  - PlanetScale
  - Go
  - API
  - Backend
---

## Models

Create a User model and create a file called user.go inside models directory, and define a struct with gorm.

```go
package models

import "gorm.io/gorm"

// User struct
type User struct {
    gorm.Model
    Name    string `json:"name"`
    Email   string `json:"email"`
    Website string `json:"website"`
}
```

## Connect to Database

Create a development database branch called `add-users-table`.

```
$ pscale branch create fiber-pscale add-users-table
```

Open a new terminal tab, we're going to connect to the database inside add-users-table branch and listen to 3309 PORT. See more [Connect using client certificates](https://docs.planetscale.com/tutorials/connect-any-application#connect-using-client-certificates).

```
$ pscale connect fiber-pscale add-users-table --port 3309
```

Create a file called `database.go` inside the models directory and add a function to connect to the database.

```go
package models

import (
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
    // refer https://github.com/go-sql-driver/mysql#dsn-data-source-name for details
    dsn := "root:@tcp(127.0.0.1:3309)/fiber-pscale?charset=utf8mb4&parseTime=True&loc=Local"
    database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }
    // Migrate the users table
    database.AutoMigrate(&User{})
    DB = database
}
```

open your `main.go`, and call the `ConnectDatabase` function to migrate the tables and connect to the database.

```go
import (
    "github.com/maful/fiber-pscale/models" // shada:add
)

func main() {
    // ...
    models.ConnectDatabase() // shada:add
}
```

then run the app `go run cmd/main.go`, Gorm will automatically migrate the table into `add-users-table` branch. How to know if the migration is success? You can check in the PlanetScale dashboard for the following branch, or use CLI to see the schema for `add-users-table` branch.

```
$ pscale branch schema fiber-pscale add-users-table
-- users --
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `name` longtext,
  `email` longtext,
  `website` longtext,
  PRIMARY KEY (`id`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

The schema won't apply to the `main` branch until you create a deploy request. Lastly, stop the connection from `add-users-table` branch or Ctrl+C.

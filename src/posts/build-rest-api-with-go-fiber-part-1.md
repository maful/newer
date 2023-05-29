---
title: Build REST API with Go Fiber and PlanetScale - Part 1
permalink: "posts/{{ title | slugify }}/index.html"
description: Fiber is web framework written in Go that much like Express in Nodejs. Fiber have many built in features to build rich web application such as Middleware, API Ready, Template Engine, Websocket support, Rate limiter, etc.
opengrapgh: true
date: 2022-10-19
color: night-fade-gradient
illustration: person_working_online
promotion_code: onsigned
tags:
  - PlanetScale
  - Go
  - API
  - Backend
---

## Introduction

Fiber (gofiber.io) is web framework written in Go that much like Express in Nodejs. Fiber have many built in features to build rich web application such as Middleware, API Ready, Template Engine, Websocket support, Rate limiter, etc. They used [fasthttp](https://github.com/valyala/fasthttp) for the engine that claims is the fastest HTTP Engine in Go.

Today, we are going to build a simple REST API with Fiber and integrated it with PlanetScale for the database.

> PlanetScale is serverless database platform for developers that built on top Vitess.

## Set up PlanetScale

Go to https://planetscale.com and sign up, then setup your account such as organization, etc. Then, we'll create a database via PlanetScale CLI, you can also create the database via web.

I don't want to explain how to setup the CLI, PlanetScale's team has managed to explain it very clearly. Check out the documentation [PlanetScale CLI](https://docs.planetscale.com/reference/planetscale-cli).

Once success to setup the CLI, then create a database called `fiber-pscale` and specify the region of your database. I recommended to using the region that close that where you are. In my case I would like to use Asia Pacific Singapore. You can check the list of region, there are 6 regions at the moment.

```
$ pscale region list
  NAME (6)                 SLUG           ENABLED
 ------------------------ -------------- ---------
  US East                  us-east        Yes
  US West                  us-west        Yes
  EU West                  eu-west        Yes
  Asia Pacific Mumbai      ap-south       Yes
  Asia Pacific Singapore   ap-southeast   Yes
  Asia Pacific Tokyo       ap-northeast   Yes
```

Create database

```
$ pscale database create fiber-pscale --region ap-southeast
Database fiber-pscale was successfully created.
```

## Set up Application

We are going to use [go modules](https://go.dev/blog/using-go-modules), first we create empty directory and then initialize the modules. You can use your repo url or application name. In this case, I'm using my repo url.

```
mkdir fiber-pscale && cd fiber-pscale
go mod init github.com/maful/fiber-pscale
```

Then, there are 3 packages we're going to build. Package means the directory. Create three directories.

- cmd: this is the root application for initialize the Fiber and connect to PlanetScale database
- handler: contains all handler for the routing such as list data, create, etc
- models: contains data structure for the application

```
mkdir cmd
mkdir handlers
mkdir models
```

Since we are going to use Fiber and PlanetScale, install the modules

To access PlanetScale, we can use ORM from Go called [Gorm](https://gorm.io/), and since the PlanetScale database is built on top Vitess (MySQL), install the MySQL driver as well.

```
# install fiber
$ go get -u github.com/gofiber/fiber/v2

# install gorm to connect to planetscale database
$ go get -u gorm.io/gorm

# mysql driver
$ go get -u gorm.io/driver/mysql
```

## Basic Handler

write basic handler with Fiber, create file called `main.go` inside cmd directory and add this script.

```go
package main

import (
    "net/http"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
    app := fiber.New(fiber.Config{
        AppName:      "Fiber with Planetscale",
        ServerHeader: "Fiber",
    })
    app.Use(logger.New())
    app.Get("/", func(c *fiber.Ctx) error {
        return c.Status(http.StatusOK).JSON(&fiber.Map{
            "message": "Hello world",
        })
    })
    app.Listen(":3000")
}
```

it will create a new instance of fiber server, and listen to port 3000, back to terminal and run the main.go.

```
$ go run cmd/main.go
 ┌───────────────────────────────────────────────────┐
 │              Fiber with Planetscale               │
 │                   Fiber v2.18.0                   │
 │               http://127.0.0.1:3000               │
 │       (bound on host 0.0.0.0 and port 3000)       │
 │                                                   │
 │ Handlers ............. 3  Processes ........... 1 │
 │ Prefork ....... Disabled  PID ............. 22443 │
 └───────────────────────────────────────────────────┘
```

and then you can access it at http://localhost:3000, below is an example with the curl command.

```bash
curl --location --request GET 'http://localhost:3000'
{"message":"Hello world"}
```

you could use Postman or other similar software if prefer to use GUI.

---
title: Containerizing a Rails Application
permalink: "posts/{{ title | slugify }}/index.html"
description: In this post, we will go through containerizing a Rails API application. Consider you already have a Rails application and you want the same environment for all your team while developing the app and here is the Docker coming in.
opengrapgh: true
date: 2021-07-21
color: warm-flame-gradient
illustration: person_donating_goods
tags:
  - Ruby on Rails
  - Docker
  - Container
  - Backend
---

## Introduction

If you actively working in web development, you may ever hear about docker and how docker makes the development are fun and the environment consistent, and isolated.

In this post, we will go through containerizing a Rails API application. Consider you already have a Rails application and you want the same environment for all your team while developing the app and here is the Docker coming in.

## Prerequisites

- Docker installed on your machine
- Rails application

## Create a Dockerfile

Dockerfile is a file that contains all the commands that users can call to build an image for the application. Since we will build an image for rails, we need to add ruby as the base image.

- Create file `Dockerfile` (without extension) inside your root project and add ruby for the base image. You can choose another version that suitable for your app (Ruby image tags).

```dockerfile
FROM ruby:2.7.3
```

- Create user and install required packages

```dockerfile
# argument
ARG WORK_DIR=/my_app
ARG USER=my_user
ARG HOME=/home/${USER}
ARG UID=999

# create user and user group
RUN groupadd -g ${UID} ${USER} && useradd -r -u ${UID} -g ${USER} ${USER}

# update os and install required packages
RUN apt-get update -qq && apt-get upgrade -y && apt-get install -y postgresql-client
```

- then, copy all necessary files from the host machine and then install the app dependencies

```dockerfile
# set WORK_DIR
RUN mkdir ${WORK_DIR}
COPY Gemfile ${WORK_DIR}/Gemfile
COPY Gemfile.lock ${WORK_DIR}/Gemfile.lock
COPY . ${WORK_DIR}
RUN chown -R ${USER}:${USER} ${WORK_DIR}

# set HOME
RUN mkdir -p ${HOME}
RUN chown -R ${USER}:${USER} ${HOME}
WORKDIR ${WORK_DIR}

# set user before bundle install for dev permission issue
USER ${USER}
RUN bundle install
```

- Add script and main process, and here we expose port 3000 from the image

```dockerfile
# Add a script to be executed every time the container starts.
USER ${USER}
COPY entrypoint.sh /usr/bin/
ENTRYPOINT ["./usr/bin/entrypoint.sh/"]
EXPOSE 3000

# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]
```

Here is the full our Dockerfile

```dockerfile
FROM ruby:2.7.3

# argument
ARG WORK_DIR=/my_app
ARG USER=my_user
ARG HOME=/home/${USER}
ARG UID=999

# create user and user group
RUN groupadd -g ${UID} ${USER} && useradd -r -u ${UID} -g ${USER} ${USER}

# update os and install required packages
RUN apt-get update -qq && apt-get upgrade -y && apt-get install -y postgresql-client

# set WORK_DIR
RUN mkdir ${WORK_DIR}
COPY Gemfile ${WORK_DIR}/Gemfile
COPY Gemfile.lock ${WORK_DIR}/Gemfile.lock
COPY . ${WORK_DIR}
RUN chown -R ${USER}:${USER} ${WORK_DIR}

# set HOME
RUN mkdir -p ${HOME}
RUN chown -R ${USER}:${USER} ${HOME}
WORKDIR ${WORK_DIR}

# set user before bundle install for dev permission issue
USER ${USER}
RUN bundle install

# Add a script to be executed every time the container starts.
USER ${USER}
COPY entrypoint.sh /usr/bin/
ENTRYPOINT ["./usr/bin/entrypoint.sh/"]
EXPOSE 3000

# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]
```

The last thing, create `entrypoint.sh` in your root project and add this script.

```bash
#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /my_app/tmp/pids/server.pid

# Then exec the container's main process (what's set as CMD in the Dockerfile).
"${@}"
```

## Add services with Docker compose

When you want to run multiple docker containers, you should consider using Docker compose. If your app database is PostgreSQL, you can add `postgres` image to compose file.

Create file called `docker-compose.yml` in your project directory, and add our image above (Dockerfile) and postgres image for the database.

```yaml
version: '3'
services:
  db:
    image: postgres:11
    ports:
      - 5432:5432
    environment:
      - POSTGRES_USER=docker
      - POSTGRES_PASSWORD=docker
    volumes:
      - db:/var/lib/postgresql/data

  app:
    build: .
    command: bash -c "bundle exec rails s -p 3000 -b '0.0.0.0'"
    entrypoint: ./entrypoint.sh
    volumes:
      - ./:/my_app
    ports:
      - 3000:3000
    environment:
      - DATABASE_USERNAME=docker
      - DATABASE_PASSWORD=docker
      - DATABASE_HOST=db
    depends_on:
      - db

volumes:
  db:
    external: true
```

## Setting up configuration

If you notice in the compose file above, we set the environment variable for `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and `DATABASE_HOST`. Then, update the `config/database.yml` for the default part.

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  database: <%= ENV.fetch("DATABASE_NAME") { "myapp" } %>
  timeout: <%= ENV.fetch("DATABASE_TIMEOUT") { 5000 } %>
  username: <%= ENV.fetch("DATABASE_USERNAME") { "docker" } %>
  password: <%= ENV.fetch("DATABASE_PASSWORD") { "docker" }%>
  host: <%= ENV.fetch("DATABASE_HOST") { "localhost" } %>
  port: <%= ENV.fetch("DATABASE_PORT") { 5432 } %>
```

## Build and Run Application

After setting up file configuration, the next thing we have to do is Build services. Open your terminal and navigate to your project directory, run compose build to build or rebuild the services.

```bash
docker compose build
```

It will take some time to download the image from Docker Hub if you haven't ruby image installed. And then run the application.

```bash
docker compose up
```

if you got an error message around database setup things, run the database migration just like usual, the difference is you have to add docker command first

```bash
# Setup database
docker compose run --rm app bundle exec rake db:setup

# Migrate database
docker compose run --rm app bundle exec rake db:migrate
```

To stop the application, you can use `Ctrl+C` or `docker compose down` when you run application in the background.

## Conclusion

If this is your first time using docker, maybe you think you should spend more time configure all the above things. But, the other thing is you just got new knowledge and when you working with your team, you will have the same environment for your entire team. Sounds great right!

In the next tutorial, you will learn how to create a brand new rails application with Docker. See you in the next one.

---
title: Devise with Rails API - Part 1
permalink: "posts/{{ title | slugify }}/index.html"
description: When building API, one of the most important part is authentication. Authentication will be a tricky part if we're not handling it properly. In Rails, we have Devise that can make use easier to manage authentication, in this tutorial I'm gonna show you how to install and configure Devise in Rails API.
opengrapgh: true
date: 2021-04-06
color: lady-lips-gradient
illustration: person-practicing-yoga
tags:
  - Ruby on Rails
  - Devise
  - Authentication
  - Backend
---

## Introduction

When building API, one of the most important part is authentication. Authentication will be a tricky part if we're not handling it properly. In Rails, we have Devise that can make use easier to manage authentication, in this tutorial I'm gonna show you how to install and configure Devise in Rails API.

> Flexible authentication solution for Rails with Warden. https://github.com/heartcombo/devise

At the time I'm writing this post, Devise has been downloaded over 92 million downloads so that makes one of the best solution for authentication in Ruby world.

## Creating Application

First, create rails api and in this case I will use postgresql as a database, you can choose whatever you want

```
# torchlight! {"lineNumbers": false}
$ rails new devise-api --api --database=postgresql
```

## Install Devise

Then, let's install devise gem. Open `Gemfile` file and add devise then run bundle install

```ruby
# torchlight! {"lineNumbers": false}
gem 'devise', '~> 4.7', '>= 4.7.3'
```

Once finish to install the gem, the next step is generate devise in the app. Open the terminal and run

```
# torchlight! {"lineNumbers": false}
$ rails generate devise:install
Running via Spring preloader in process 2934
      create  config/initializers/devise.rb
      create  config/locales/devise.en.yml
.....
```

Create user model

```
# torchlight! {"lineNumbers": false}
$ rails generate devise User
```

## Configuring Rails

Initalize the database

```
# torchlight! {"lineNumbers": false}
$ rails db:create
```

Migrate the database

```
# torchlight! {"lineNumbers": false}
$ rails db:migrate
```

Actually, you can check the routing of Devise in the terminal with `rails routes`.

After success install devise, we can verify the installation by doing the register, for this case I'm gonna use Postman, before that we should run the server with `rails s` in the terminal, make sure you already in the root directory of project.

```
# torchlight! {"lineNumbers": false}
$ rails s
=> Booting Puma
=> Rails 6.1.3 application starting in development
=> Run `bin/rails server --help` for more startup options
Puma starting in single mode...
* Puma version: 5.2.2 (ruby 3.0.0-p0) ("Fettisdagsbulle")
*  Min threads: 5
*  Max threads: 5
*  Environment: development
*          PID: 3351
* Listening on http://127.0.0.1:3000
* Listening on http://[::1]:3000
Use Ctrl-C to stop
```

The default port of rails is 3000, so you can access the local server in http://localhost:3000/.

![Devise Rails API 1](./src/assets/images/devise-rails-api-1.png "Devise Rails API 1")

So far, we succeed initializing the Rails API. In the next lesson, we are gonna set up the Devise to only return JSON format.

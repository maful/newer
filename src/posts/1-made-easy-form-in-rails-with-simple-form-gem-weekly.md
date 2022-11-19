---
title: 1 Made easy form in Rails with Simple Form - Gem Weekly
permalink: "posts/{{ title | slugify }}/index.html"
description: There are many ways to create a form in Rails, whether you want to create a form with Form builder from Rails itself or maybe using third party gem like simple_form.
opengrapgh: true
date: 2022-11-19
color: lady-lips-gradient
illustration: person-learning-online
tags:
  - Gem Weekly
  - Ruby on Rails
  - Simple Form
  - Backend
---

## Introduction

There are many ways to create a form in Rails, whether you want to create a form with Form builder from Rails itself or maybe using third party gem like [simple_form](https://github.com/heartcombo/simple_form). Of course, `simple_form` is not the only option we have to build form in rails, there are alternatives out there such as formtastic, cocoon, nested_form, etc. However, in this post I'm going to give you a basic use case to use simple_form in Rails application.

> **Simple Form** aims to be as flexible as possible while helping you with powerful components to create your forms. Most of the DSL was inherited from Formtastic, which we are thankful for and should make you feel right at home.

## Installation

Add `simple_form` in your `Gemfile` application, this will install the latest stable version of `simple_form`

```ruby
gem 'simple_form'
```

However, if you want to install a specific version of the gem, you could include the version number after the gem name. In the example below, you will install the `simple_form` gem with `5.0.2` version.

```ruby
gem 'simple_form', '~> 5.0', '>= 5.0.2'
```

To run the installation process, run the following command

```
bundle install
```

## Simple Form Generator

Simple Form has own generator after you installed it, it helps the user to start using the gem and telling the user where the configuration is. The easiest way to start is run the following command to install or copy the template code to your project.

```
rails generate simple_form:install
```

After you run the command, the gem will copy the starting template to your project and you will use the default configuration. Normally, the configuration will be on `config/initializers/simple_form.rb`. You also can check the configuration template on github file ([simple_form](https://github.com/heartcombo/simple_form/blob/31fe25504771bd6cd425b585a4e0ed652fba4521/lib/generators/simple_form/templates/config/initializers/simple_form.rb)). You may have to update the configuration based on your needs and your design system. The configuration pretty much readable and I believe you can learn it from the code.

You may have a question something like this. "I'm using CSS Framework Bootstrap, it would be great if there is something like configuration for Bootstrap out of the box, do they have it?"

YES! There is configuration for Bootstrap out of the box, simply run the following command and it will generate the configuration based on Bootstrap classes

```
rails generate simple_form:install --bootstrap
```

Hold on, not only Bootstrap, you can also generate the configuration for Zurb Foundation 5

```
rails generate simple_form:install --foundation
```

## Build Application

### Scaffold Application

Let's continue to build a real word application and we will be using `simple_form` as a Form Builder.

- Create a new rails application, in this example we will just using Bootstrap for the CSS Framework. We don't focus on the database for now so using sqlite is enough. Take a note that I'm using **Rails 7** in this example.

```
rails new simple-form-example --css bootstrap
```

- Once success, navigate to the application directory

```
cd simple-form-example
```

- In this example, we will create posts page. There will be no authentication in this example. Let's scaffold the posts first which consisting of `title` and the `body` of the post

```
rails g scaffold Post title body:text
```

- Then migrate the database by running `rails db:migrate`
- Add a validation in Post model, open `app/models/post.rb` . We will add validation for title and body is required

```ruby
# torchlight! {"lineNumbers": true}
class Post < ApplicationRecord
  validates :title, presence: true # [tl! add]
  validates :body, presence: true # [tl! add]
end
```

- To run the application, we don't use `rails s` because it will only run the Puma server. Instead, run with the following command that will run the Puma server, esbuild, and SASS.

```
bin/dev
```

- Open your browser and access [`http://localhost:3000/posts`](http://localhost:3000/posts) and then click `New post` link
- Try to submit the form by clicking **Create** button, as you can see that there is error in the form

![Rails Error Form](https://res.cloudinary.com/newer/image/upload/v1668836872/blog/1-made-easy-form-in-rails-with-simple-form-gem-weekly/classic-error-form.png "Rails Error Form")

- We will replace the built-in form with `simple_form` to take an advantage of simplicity and flexibility.

### Install Simple Form

- Add `simple_form` gem in your `Gemfile`. The run `bundle install` to install the gem

```ruby
gem "simple_form", "~> 5.1"
```

- Run the simple form generator for Bootstrap

```
rails generate simple_form:install --bootstrap
```

- Now check the configuration on `config/initializers/simple_form_bootstrap.rb` and you'll see the configuration for Bootstrap Forms. Don't forget to stop or restart the server.
- Open up the form file `app/views/posts/_form.html.erb`. Delete all the existing code and replace with the following code

```erb
# torchlight! {"lineNumbers": true}
<%= simple_form_for post do |form| %>
  <%= form.input :title %>
  <%= form.input :body %>
  <%= form.submit %>
<% end %>
```

- As you can see, we replace the previous form to `simple_form` to just only 5 lines of code. It is very flexible isn't it
- Run the server `bin/dev` and go to [`http://localhost:3000/posts/new`](http://localhost:3000/posts/new). When you click the **Create Post** button you'll see the error validation little bit different than the previous form where the form message placed in under the text field. The advantage of this UI is the user will quickly knows that the error is for the specific field.

### Understanding Simple Form

Under the hood, Simple Form building your form component based on the configuration. Now, let’s take a look back on `config/initializers/simple_form_bootstrap.rb` and find the `:vertical_form` wrapper, usually in line 52

```ruby
# torchlight! {"lineNumbers": true}
# vertical forms [tl! reindex(49)]
#
# vertical default_wrapper
config.wrappers :vertical_form, tag: 'div', class: 'form-group', error_class: 'form-group-invalid', valid_class: 'form-group-valid' do |b| # [tl! focus]
  b.use :html5
  b.use :placeholder
```

Look at the `tag` and `class` option above, this is where the field wrapped by `div` element with class is `form-group`. To prove that, go back to your form in the browser and inspect the **********Title********** field. That’s where the configuration converted into the form. You could change the class or tag if you want, but remember to restart your server to apply the changes because you’re changing the file under the initializer directory.

```html
<div class="form-group string required post_title">
```

> `vertical_form` wrapper is the default input field component in Simple Form for Bootstrap

You may wonder how Simple Form generate the text field for the Title and textarea for the Body. The answer is pretty simple, behind the scene Simple Form maps the input type which retrieved from the column definition in the database and then generate to a specific helper method. Check out [the available input types on README](https://github.com/heartcombo/simple_form#available-input-types-and-defaults-for-each-column-type).

## Advance Usage

### Change the default input type

In order to change the default input type, you need to check whether the type is supported. Take an example, you want to change the input type of **Body** to text field instead of textarea. Open up the `_form.html.erb` under the `posts` directory in the views, simply add `as: :<type>` after the field name. Check out [List of available input types](https://github.com/heartcombo/simple_form#available-input-types-and-defaults-for-each-column-type).

```erb
<%= form.input :body %> <%# [tl! remove] %>
<%= form.input :body, as: :string %> <%# [tl! add] %>
```

Go back to your browser, reload and see the result. Instead of textarea, it will rendered as text field.

![Change the input type](https://res.cloudinary.com/newer/image/upload/v1668850719/blog/1-made-easy-form-in-rails-with-simple-form-gem-weekly/change%20default%20input%20type.png "Change the input type")

### Add custom class or style to form field

Yes, Simple Form comes with the flexibility by default. But, if you have a case where you need to add a style or classes in place you read in the right place. For instance, adding a css class to **Body** field wrapper to add a margin top. Open your form file and change as follow

```erb
<%= form.input :body %> <%# [tl! remove] %>
<%= form.input :body, wrapper_html: { class: "mt-4" } %> <%# [tl! add] %>
```

And here is the result, now see there is a margin between Title and Body field

![add custom class](https://res.cloudinary.com/newer/image/upload/v1668850764/blog/1-made-easy-form-in-rails-with-simple-form-gem-weekly/add%20custom%20class.png "add custom class")

If you check the generated HTML, the `mt-4` class will added it along with the default class

![add custom class - html](https://res.cloudinary.com/newer/image/upload/v1668850852/blog/1-made-easy-form-in-rails-with-simple-form-gem-weekly/add%20custom%20class%20-%20html.png "add custom class - html")

And not only can change the wrapper attribute, you can also change the label and the input attribute with `label_html` and `input_html` respectively.

### Can I hide the label text while still take an advantage of the other attributes?

Absolutely! Here is the example case where you don’t want to show the label text but still want to show the error message or the other while still using simple form. Let’s hide the label text for **Title** field.

```erb
<%= form.input :title %> <%# [tl! remove] %>
<%= form.input :title, label: false %> <%# [tl! add] %>
```

Check the result, as you can see the `label` has been omitted from the form

![remove label](https://res.cloudinary.com/newer/image/upload/v1668850919/blog/1-made-easy-form-in-rails-with-simple-form-gem-weekly/remove%20label.png "remove label")

![remove label - html](https://res.cloudinary.com/newer/image/upload/v1668850960/blog/1-made-easy-form-in-rails-with-simple-form-gem-weekly/remove%20label%20-%20html.png "remove label - html")

## Conclusion

Not only build a really simple form, but you can also build a really complex form with Simple Form. Just think Simple form is just a mechanism to build a form components and you can reused it in anywhere in your application. You can download the [example code](https://github.com/daily-newer/gem-weekly-simple-form) on GitHub.

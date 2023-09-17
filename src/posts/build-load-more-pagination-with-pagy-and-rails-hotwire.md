---
title: Build Load More Pagination with Pagy and Rails Hotwire
permalink: "posts/{{ title | slugify }}/index.html"
description: Explore the seamless 'Load More' pagination in Rails with Pagy and Hotwire. Learn how to effortlessly paginate content without writing a single line of JavaScript. Discover the power of Turbo Streams and take your web application's user experience to the next level.
opengrapgh: true
date: 2023-09-17
promotion_code: wrappedby
tags:
  - Rails
  - Hotwire
  - Pagy
  - Turbo
---

## Introduction

Hi folks! Welcome to another Hotwire tutorial. A few days ago, I shared a short video on Twitter from WrappedBy Dashboard and I thought it could be really cool to write a blog post to guide you through building an application with a similar concept. If you haven't seen the tweet yet, take a moment to check out what it looks like in the [demo on Twitter](https://twitter.com/mafulprayoga/status/1702723310344347816).

Exciting, isn't it? In this post, we're going to explore how to implement a 'Load More' pagination feature using Pagy and Hotwire. What makes this even more fascinating is that we'll accomplish it **without writing a single line of JavaScript**. Instead, we'll harness the power of Turbo Streams to seamlessly update our page.

According to the official Hotwire documentation, **Turbo Streams** deliver page changes over WebSocket, SSE or in response to form submissions using just HTML and a set of CRUD-like actions. You can dive deeper into Turbo Streams in the [Come Alive with Turbo Streams](https://turbo.hotwired.dev/handbook/streams) handbook.

Now, let's get started by creating our Rails application.

## Create Application

As usual, we won't start everything from scratch. We'll focus on the core concept of 'Load More' pagination. To do that, we'll begin by creating a Rails application with the help of the [UpperBracket](https://github.com/maful/upperbracket) template. If you're already using UpperBracket, you should be all set to follow along with this tutorial.

To kick things off, open your terminal and run the following command:

```bash
rails new hotwire-load-more-pagination \
  -d postgresql \
  -m https://raw.githubusercontent.com/maful/upperbracket/main/template.rb
```

Make sure you have your PostgreSQL database up and running.

> Our goal for this tutorial is not to build a fancy, feature-rich application. Instead, we'll focus on displaying a list of comments and adding a pagination feature to it.

Create Comment model including views, controller, migrations etc. Specify the message and the author name in the Comment model

```bash
rails g scaffold Comment message author_name
```

Open the routes and change the content like this `config/routes.rb`

```ruby
# frozen_string_literal: true

Rails.application.routes.draw do
  resources :comments
  root to: "comments#index"
end
```

Run the database migration to apply the changes

```bash
rails db:migrate
```

Now, let's generate some data for our Comment model by using the database seed feature. Open up the `db/seeds.rb` file in your Rails application directory and replace its contents with the following code:

```ruby
names = [ "Maija", "Aniyah", "Artūras", "Leocadia", "Aikorkem", "Maxime", "Eemeli", "Rahmatullah", "Indrek", "Alfredo", "Villads", "Aelius", "Sofia", "Maor"]
comments = [
  "You've got this! Keep up the great work!",
  "Your smile can brighten anyone's day.",
  "You make the world a better place just by being you.",
  "Believe in yourself, and you can achieve anything!",
  "Sending you a virtual hug!",
  "Every day is a new opportunity to shine!",
  "Your kindness is like a ripple that spreads positivity.",
  "Keep your face always toward the sunshine, and the shadows will fall behind you.",
  "You're a true inspiration to those around you.",
  "Life is full of beautiful moments, and you're one of them.",
  "Your perseverance and hard work are paying off!",
  "Stay positive, and amazing things will happen.",
  "Your energy is contagious—in the best way!",
  "The world is a better place with you in it.",
  "You're a ray of sunshine on a cloudy day.",
  "Success is yours because you work for it!",
  "Dream big, and don't be afraid to chase those dreams.",
  "You're making progress, one step at a time.",
  "Don't forget to take care of yourself; you deserve it!",
  "Surround yourself with positivity, and watch your life change for the better."
]

100.times do
  Comment.create(message: comments.sample, author_name: names.sample)
end
```

In this code snippet:

- We create two arrays, `names` and `comments`, to generate random data for our comments. This data is purely for testing purposes.
- Using a loop (`100.times`), we create a total of 100 comment records by selecting random entries from the `comments` and `names` arrays.

To execute the database seed and populate your Comment model, simply run `rails db:seed`. After running the seed, you can verify that there are now 100 comments in your database. This data will serve as the foundation for our 'Load More' pagination demonstration.

![Rails Console](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/b00ddo9bmh61ihrxixkh.png "Rails Console")

Next we will update the UI of the comment index page, open `app/views/comments/index.html.erb` and replace with the following code

```erb
<div class="max-w-sm mx-auto py-6">
  <div id="comments" class="space-y-2">
    <%= render @comments %>
  </div>
</div>
```

Update the comment partial too by open `app/views/comments/_comment.html.erb` and replace with the following code

```erb
<div id="<%= dom_id comment %>" class="px-4 py-2 border rounded">
  <div class="text-sm">
    <span class="font-semibold"><%= comment.author_name %></span> says
  </div>
  <div class="mt-1 text-sm"><%= comment.message %></div>
</div>
```

Open the `app/controllers/comments_controller.rb` and update the index method

```ruby
def index
  @comments = Comment.order(id: :desc)
end
```

Now run the application with `bin/dev` and access [`http://localhost:3000/`](http://localhost:3000/) and you should see the list of comments.

https://youtu.be/aTr7oos1XKc

## Pagy Pagination

Now, let's dive into the pagination part of this post: setting up [Pagy](https://github.com/ddnexus/pagy) for handling pagination in our Rails application. If you haven't included the Pagy gem in your project, you'll need to add it manually. Here's how you can do it:

**Manual Installation**

Head over to the [Pagy Installation Documentation](https://ddnexus.github.io/pagy/quick-start/) for detailed instructions.

**UpperBracket Users**

If you've created your app using the UpperBracket template, adding Pagy is a breeze. Just follow these steps:

Open your `ApplicationController` located at `app/controllers/application_controller.rb`.

Include the `Pagy::Backend` module in your controller like this:

```ruby
class ApplicationController < ActionController::Base
  include Pagy::Backend
end
```

Now we are gonna use pagy to handle the records from the database, open `app/controllers/comments_controller.rb` and replace the index method with the following code

```ruby
def index
  query = Comment.order(id: :desc)
  @pagy, @comments = pagy(query, items: 10)
end
```

In the code above:

- We create a `query` to retrieve comments from the Comment model, sorting them by ID in descending order (from the oldest to the newest).
- Next, we utilize Pagy to paginate the query results. We assign the Pagy instance to `@pagy` and the paginated comments to `@comments`, specifying that there should be a maximum of 10 records per page.

After making these changes, restart your application, and you'll notice that the index page now displays the newest 10 comments.

![Demo Comments Page](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wbfydmaf2dfgl9zf1ukv.png "Demo Comments Page")

Let’s add the ‘Load More’ button to our page that function to load the next group of data. Create a new file `app/views/comments/_load_more_button.html.erb` and add the following code

```erb
<% if @pagy.next.present? %>
  <%= button_to "Load more", comments_path,
    params: { page: @pagy.next },
    method: :get,
    class: "mt-4 inline-flex items-center justify-center text-sm font-medium ring-offset-background bg-slate-900 text-white hover:bg-slate-900/90 h-9 rounded-md px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    "data-turbo-stream": true %>
<% end %>
```

Here's an overview of what this code does:

- We first check if there's a next group of data available. If not, the 'Load More' button won't be displayed.
- Next, we construct a GET request form using the `button_to` helper. This form sends data to the `comments_path` with the `page` parameter set to `@pagy.next`.
- Take note of the `"data-turbo-stream"` attribute. We're configuring the form to be sent as a TURBO_STREAM instead of HTML. This feature was introduced in July 2022, allowing Turbo Streams even with GET requests. You can find more details in [this pull request](https://github.com/hotwired/turbo/pull/612).

With the 'Load More' button ready, let's include it in our list page. Open `app/views/comments/index.html.erb` and insert the following code after the `div#comments` element:

```erb
<div class="flex justify-center" id="load_more_button">
  <%= render "comments/load_more_button" %>
</div>
```

Now, when you check your application, you should see the 'Load More' button in action, fetching the next group of data. Let's take a closer look at what we've accomplished so far.

https://youtu.be/eLIXK1Cii1Y

However, please note that, as of now, the new data replaces the current data on the page, resembling conventional pagination. Additionally, you might notice changes in the URL based on the current page, similar to what's shown in the video.

## The Magic of Turbo Streams

Now, it's time to introduce Turbo Streams to our application. Turbo Streams will enable us to load the next set of data and seamlessly append it to the existing content on the page, all without altering the URL. Here's how we'll integrate Turbo Streams:

Open `app/controllers/comments_controller.rb` and modify the `index` action to handle Turbo Streams requests triggered by the 'Load More' button:

```ruby
def index
  query = Comment.order(id: :desc)
  @pagy, @comments = pagy(query, items: 10)

  respond_to do |format|
    format.html
    format.turbo_stream
  end
end
```

In this code, we use the [respond_to](https://api.rubyonrails.org/classes/ActionController/MimeResponds.html#method-i-respond_to) method to handle different response formats, including HTML and Turbo Stream. Depending on the format of the incoming request, Rails will render the corresponding view. For HTML requests, it renders `index.html.erb`, while for Turbo Stream requests, it looks for `index.turbo_stream.erb`. However, we haven't created the `index.turbo_stream.erb` file yet, which may result in an error when you test the application.

![Rails Error - No Format](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vj8nwra803ftz3n6ye22.png "Rails Error - No Format")

To fix the errors, let’s create template for turbo_stream format. Create a new file `app/views/comments/index.turbo_stream.erb` and add the following code

```erb
<%= turbo_stream.append "comments" do %>
  <%= render partial: "comments/comment", collection: @comments %>
<% end %>

<%= turbo_stream.update "load_more_button" do %>
  <%= render "comments/load_more_button" %>
<% end %>
```

Here's a breakdown of what this code accomplishes:

- In the first group, `turbo_stream.append`, we render partial data from `app/views/comments/_comment.html.erb` while passing the `@comments` collection. These comments are then appended to the element with the `comments` ID. This code ensures that the new group of data is added to the bottom of the existing content, rather than replacing it.
- In the second group, we update the `load_more_button` element using the same partial file we used in `index.html.erb`. It checks for the presence of a next page; if one exists, it renders the button along with the new data. Otherwise, the button is not displayed.

And that's it! We've successfully implemented seamless 'Load More' pagination in Rails without writing a single line of JavaScript. All of this happens within a single page, providing a user-friendly experience.

Now, to see it in action, go ahead and restart the application and test it out.

https://youtu.be/umEJqZM2Hl8

There you have it – a 'Load More' pagination in Rails that enhances user experience, all without the need for JavaScript. How awesome is that?

## Bonus

If your application experiences slower load times and you want to provide users with real-time feedback that the application is actively fetching data, you can implement a loading indicator. To achieve this, open `app/views/comments/_load_more_button.html.erb` and include the `data-turbo-submits-with` attribute in the `button_to` element. Here's the complete code:

```erb
<% if @pagy.next.present? %>
  <%= button_to "Load more", comments_path,
    params: { page: @pagy.next },
    method: :get,
    class: "mt-4 inline-flex items-center justify-center text-sm font-medium ring-offset-background bg-slate-900 text-white hover:bg-slate-900/90 h-9 rounded-md px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    "data-turbo-stream": true,
    "data-turbo-submits-with": "Loading..." %>
<% end %>
```

For demonstration purposes, you can insert `sleep 3` within the `index` method of `CommentsController` to simulate the delay. With this change, you'll see the "Loading..." text displayed on the button while the application processes the next page.

![Before After](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/332pvw4pphxqo09iriol.png "Before After")

## Summary

Turbo Streams offer numerous advantages for building interactive applications without the need for JavaScript. However, it's important to consider when and where to use Turbo Streams. I recommended if the form using Turbo Streams, you should consider to use [respond_to](https://api.rubyonrails.org/classes/ActionController/MimeResponds.html#method-i-respond_to) in the controller to handle both HTML and TURBO_STREAM formats. This approach ensures that your application remains functional even if JavaScript is disabled in the user's browser. By accommodating both formats, your application gracefully falls back to HTML when JavaScript is unavailable, providing a seamless experience for all users.

Download the source code [hotwire-load-more-pagination](https://github.com/daily-newer/hotwire-load-more-pagination)

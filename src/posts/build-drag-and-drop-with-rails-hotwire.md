---
title: Build Drag and Drop with Rails Hotwire
permalink: "posts/{{ title | slugify }}/index.html"
description: Learn how to effortlessly implement drag-and-drop functionality in your Rails app using Hotwire. Plus, discover bonus tips to level up your user experience. Dive in now!
opengrapgh: true
date: 2023-09-10
promotion_code: wrappedby
tags:
  - Rails
  - Hotwire
  - Sortable
  - Stimulus
---

## Introduction

Hey there, fellow web adventurers! 😄 Building web applications can be a wild ride, right? Well, today, we're diving into something super cool: adding drag-and-drop functionality to your Rails app, all powered by the magic of Hotwire! No worries, we won't start from scratch – we're keeping it hush-hush and diving straight into the fun part. 💫

**Shhh... Our Little Secret Tool**

We've got a secret weapon up our sleeves: [UpperBracket](https://github.com/maful/upperbracket). It's like having a magic wand for generating full-stack Rails applications. It comes with all the goodies – Vite, Tailwind CSS, Rodauth, Rubocop, and more – so we can focus on the fun stuff. Let's keep this between us, though! 😉

Curious about the final result, here it is

## Let’s build

So, what's the plan? We're creating a simple course list app where users can rearrange items with a flick of their mouse. Super cool, right? Let's kick things off by generating our Rails app using the UpperBracket template.

```bash
# create app
rails new hotwire-dragndrop \
  -d postgresql \
  -m https://raw.githubusercontent.com/maful/upperbracket/main/template.rb

# move to the app directory
cd hotwire-dragndrop
```

* Make sure you've got your PostgreSQL database up and running before we dive in.

Create Course model with only title attribute, no fancy here.

```bash
rails g scaffold Course title
```

Open the generated migration for the courses table and define that title should not be null.

```ruby
class CreateCourses < ActiveRecord::Migration[7.0]
  def change
    create_table :courses do |t|
      t.string :title, null: false

      t.timestamps
    end
  end
end
```

Add presence validation for the `title` in the Course model `app/models/course.rb`

```ruby
# frozen_string_literal: true

class Course < ApplicationRecord
  validates :title, presence: true # shada:add
end
```

Update the routes to set the root page to the courses list page `config/routes.rb`

```ruby
# frozen_string_literal: true

Rails.application.routes.draw do
  root "courses#index" # shada:add
  resources :courses # shada:add
end
```

I’m going to add a small styling for the page with Tailwind CSS, this is optional. Open the course index page `app/views/courses/index.html.erb` and update with the following code

```erb
<div class="container">
  <div class="max-w-screen-md mx-auto py-10">
    <p style="color: green"><%= notice %></p>

    <div class="mb-6">
      <%= link_to "New course", new_course_path, class: "rounded border border-slate-500 px-2 py-3" %>
    </div>

    <h1 class="text-2xl font-medium mb-4">Courses</h1>

    <div id="courses" class="flex flex-col gap-4">
      <%= render @courses %>
    </div>
  </div>
</div>
```

Open the single course page in `app/views/courses/_course.html.erb`

```erb
<div
  id="<%= dom_id course %>"
  class="bg-gray-50 shadow-sm space-y-6 py-6 px-4"
>
  <div class="flex gap-4 items-center">
    <div class="text-gray-700 text-base">
      <%= course.title %>
    </div>
  </div>
</div>
```

Run `rails db:migrate` to run the database migration. You can now run the application using `bin/dev`

Add some courses in the application and you should now have something like this

![Initial Preview](https://res.cloudinary.com/newer/image/upload/v1694352546/blog/build-drag-and-drop-with-rails-hotwire/1.png "Initial Preview")

You have list of course now and quite looking good for simple application. However, this isn’t the end and notice that we still unable to drag and drop the course.

## Adding Sortable Library

It is time to adding the main functionality drag and drop, add [ranked-model](https://github.com/brendon/ranked-model) gem to handle record ordering in the backend

```
bundle add ranked-model
```

And add node packages for reorderable library and http request

```
yarn add sortablejs @rails/request.js
```

Create migration to add `row_order` column to courses table

```
rails generate migration AddRowOrderToCourses row_order:integer
```

`row_order` column is nullable, and we already added some courses in the previous section. Let’s fill the row_order for the existing records in the courses table.

```
rails generate migration BackfillRowOrderToCourses
```

Update the generated migration file with this code

```ruby
class BackfillRowOrderToCourses < ActiveRecord::Migration[7.0]
  disable_ddl_transaction!

  def up
    Course.unscoped.in_batches do |relation|
      relation.update_all('row_order = EXTRACT(EPOCH FROM created_at)')
      sleep(0.01)
    end
  end
end
```

This migration basically disable DDL (Data Definition Language) during migration of this file, then iterate over course records in batches and update the `row_order` from the `created_at` data. Execute the new migration by running `rails db:migrate`

Open the Course model and include the ranked-model gem and configure it.

```ruby
# frozen_string_literal: true

class Course < ApplicationRecord
  include RankedModel # shada:add

  ranks :row_order # shada:add
end
```

Now, open the `app/controllers/courses_controller.rb` and update the `@courses` variable in `index` method to use ranked-model for the ordering

```ruby
def index
  @courses = Course.all # shada:remove
  @courses = Course.rank(:row_order).all # shada:add
end
```

Run the application and and check the courses page. Nothing difference in the context of UI, but if you check the development log, you will notice that the `row_order` has been use for for ordering record.

```
Course Load (1ms)  SELECT "courses".* FROM "courses" ORDER BY "courses"."row_order" ASC
```

## Create Sortable Stimulus Controller

In previous section, we have install `sortable` node package, in this section we’re going to use it. Create stimulus controller named sortable in `app/javascript/controllers/sortable_controller.js` and add the following code

```js
import { Controller } from "@hotwired/stimulus"
import Sortable from "sortablejs"

export default class extends Controller {
  connect() {
    const options = {
      onEnd: this.onEnd.bind(this)
    }
    Sortable.create(this.element, options)
  }

  onEnd(evt) {
    const body = { row_order_position: evt.newIndex }
    console.log(body)
  }
}
```

Explanation

- Import the sortablejs to the controller
- Override the `connect` function to create the Sortable instance for the current element. Meaning that it will register the element where you connect with the sortable controller.
- Imagine you've just dragged an item to its new spot. What's next? We're adding a function called `onEnd`. It's like the grand finale of a show! But here's the twist – we're not sending data to the backend just yet. Instead, we're logging the new index to keep an eye on the changes.

Let’s try to connect the stimulus controller to our element. Open `app/views/courses/index.html.erb` file and add `data-controller="sortable"` to the div element with id `courses`

```erb
<div id="courses" class="flex flex-col gap-4"> <%# shada:remove %>
<div id="courses" class="flex flex-col gap-4" data-controller="sortable"> <%# shada:add %>
```

Now, let's put our work to the test! Fire up your app and give that course list a spin. You'll notice that you can drag and drop items, and the item you drag will change its position. Check your browser console to see the new position in action!

But here's the catch – when you refresh the app, it's like hitting the rewind button. Why? Because we haven't saved the changes to the database yet.

https://www.youtube.com/watch?v=BxTQHUTXPao

The position is based on the index, and index in JavaScript is start from 0. If you check again in `sortable_controller.js`, the `body` variable is what we need to send to the backend and backend save it to the database. Let’s do it, in the `onEnd` function, remove the `console.log` line because we don’t need it anymore. So here is the final `sortable_controller.js` for now.

The position we're talking about is based on the index. Quick heads-up – in JavaScript, the index starts at 0. Peek at `sortable_controller.js`, and you'll find the `body` variable. That's the golden nugget we need to send to the backend for database saving.

In the `onEnd` function, we're saying goodbye to the `console.log` line – we don't need it anymore. Here's our polished `sortable_controller.js` for now.

```js
import { Controller } from "@hotwired/stimulus"
import Sortable from "sortablejs"
import { patch } from "@rails/request.js"

export default class extends Controller {
  connect() {
    const options = {
      onEnd: this.onEnd.bind(this)
    }
    Sortable.create(this.element, options)
  }

  onEnd(evt) {
    const body = { row_order_position: evt.newIndex }
    patch(evt.item.dataset.sortableUrl, {
      body: JSON.stringify(body),
      responseKind: "turbo-stream",
    })
  }
}
```

Oh, and one last thing – you'll spot `evt.item.dataset.sortableUrl` in the code. It's like a map to where the request should be sent. Let's create a route for it by opening up the routes and adding the rank with the patch method to the courses resources.

```ruby
resources :courses do
  patch "rank", on: :member # shada:highlight
end
```

Open the `courses_controller.rb` and add new method called `rank`, this will update the `row_order` in the course record

```ruby
def rank
  @course.update(row_order_position: params[:row_order_position])
end
```

Don’t forget to include the `rank` method in the `before_action` callback at the top

```ruby
before_action :set_course, only: [:show, :edit, :update, :destroy] # shada:remove
before_action :set_course, only: [:show, :edit, :update, :destroy, :rank] # shada:add
```

Open `app/views/courses/_course.html.erb` and add `data-sortable-url` attribute which contains the route that we created just now

```erb
<div
  id="<%= dom_id course %>"
  class="bg-gray-50 shadow-sm space-y-6 py-6 px-4"
  data-sortable-url="<%= rank_course_path(course) %>"
>
```

If you inspect the element, you should see something like this

![Inspect HTML Element](https://res.cloudinary.com/newer/image/upload/v1694353155/blog/build-drag-and-drop-with-rails-hotwire/2.png "Inspect HTML Element")

So, the code `evt.item.dataset.sortableUrl` is to find the value of `data-sortable-url` on the item being dragged.

> Tired of the endless server configuration headaches? WrappedBy takes care of it all for you. Say goodbye to manual setup and hello to hassle-free deployment. Discover the ease of deploying Ruby apps with WrappedBy and revolutionize your development process. Start deploying with [WrappedBy](https://wrappedby.com)

Let’s try again the application, the order of the position should be persisted in the database now.

https://www.youtube.com/watch?v=9IZgKbLLeYE

## Bonus 1

So, you've nailed the drag-and-drop with Hotwire in Rails, but here's a cool UX upgrade we can sprinkle in. How about adding a little marker to highlight where your item will land in the list? Let me show you what I mean. Open up your trusty `sortable_controller.js` and introduce the `ghostClass` option within the `connect` function.

```jsx
const options = {
  onEnd: this.onEnd.bind(this),
  ghostClass: "bg-red-300"
}
```

If you try the app again, you'll see a red background at the new position of the dragged item.

https://www.youtube.com/watch?v=rv78bBRtlbc

## Bonus 2

But wait, there's more! Here's another tip for you – what if you want to be super specific about which elements can be dragged and which ones stay put? Well, it's all about using the `handle` selector. Each element will look a little something like this:

![Illustration Bonus 2](https://res.cloudinary.com/newer/image/upload/v1694353304/blog/build-drag-and-drop-with-rails-hotwire/3.png "Illustration Bonus 2")

First, add move icon in the left side of the course title. Here is the complete of `app/views/courses/_course.html.erb` file

```erb
<div
  id="<%= dom_id course %>"
  class="bg-gray-50 shadow-sm space-y-6 py-6 px-4"
  data-sortable-url="<%= rank_course_path(course) %>"
>
  <div class="flex gap-4 items-center">
    <div class="sortable-handle cursor-grab">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move h-4 w-4 text-current"><path d="m5 9-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>
    </div>
    <div class="text-gray-700 text-base">
      <%= course.title %>
    </div>
  </div>
</div>
```

Open `app/views/courses/index.html.erb` and add `data-sortable-handle-selector-value` attribute after the `data-controller`

```html
<div id="courses" class="flex flex-col gap-4" data-controller="sortable" data-sortable-handle-selector-value=".sortable-handle">
```

And also add `handle` selector in `sortable_controller.js` and define the Stimulus values to store the value of `data-sortable-handle-selector-value` attribute.

```js
import { Controller } from "@hotwired/stimulus"
import Sortable from "sortablejs"
import { patch } from "@rails/request.js"

export default class extends Controller {
  static values = {
    handleSelector: String,
  }

  connect() {
    const options = {
      onEnd: this.onEnd.bind(this),
      ghostClass: "bg-red-300"
    }
    if (this.hasHandleSelectorValue) {
      options.handle = this.handleSelectorValue
    }
    Sortable.create(this.element, options)
  }

  onEnd(evt) {
    const body = { row_order_position: evt.newIndex }
    patch(evt.item.dataset.sortableUrl, {
      body: JSON.stringify(body),
      responseKind: "turbo-stream",
    })
  }
}
```

Let’s check again the final result of our application

https://www.youtube.com/watch?v=lr5asfuonsc

Notice the difference here, only elements with class `sortable-handle` that can be dragged, the rest of the element back to the normal element.

## Conclusion

With Stimulus, you've got a powerful tool to take your app's interactivity up a notch. For even more awesome features and Stimulus wizardry, check out the [Stimulus Documentation](https://stimulus.hotwired.dev/).

And that's a wrap, folks! 🎉 We've successfully built a slick list that you can drag and drop like a pro, and guess what? It's all snugly persisted in the database. But hey, don't stop here – you can take it further by adding topics to each course and letting users drag and drop topics across different courses. Sounds intriguing, right? You can make it happen using the `group` options in Sortablejs.

Full source code can be download on [hotwire-sortable](https://github.com/daily-newer/hotwire-sortable) repository.

---

Are you tired of the complexities of deploying Ruby on Rails applications? Discover WrappedBy – the ultimate deployment solution for Ruby enthusiasts. Curious to see how it works? Check out our YouTube video here:

https://www.youtube.com/watch?v=V8g8dQO5UXw&list=PLqU3tAyxlLTuChRN69oLDPf_BFHRe9owz

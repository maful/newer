---
title: How I use Nano ID in Rails
permalink: "posts/{{ title | slugify }}/index.html"
description: Learn and implement Nano ID in Ruby on Rails application.
opengrapgh: true
date: 2023-05-31
color: warm-flame-gradient
illustration: nano_id_x_rails
promotion_code: wrappedby
tags:
  - Nano ID
  - Ruby on Rails
  - Backend
---

## Introduction

When building applications normally we will use database to store the data. Defining the primary key in our database is straightforward, the hard part is what data type for the primary key. Basically, the default primary key is `bigint` and auto-increment, which means when there is a new record created the primary key will increment 1,2,3, and so on. This is the easiest and simplest way to ensure the primary key is unique, there is another option that you may hear which is using UUIDv4 for the primary key. **UUIDv4** (Universally Unique Identifier version 4) is a type of UUID that is randomly generated and 128-bit numbers represented as strings, typically consisting of five groups of hexadecimal digits separated by hyphens. UUIDv4 is generated using random or pseudo-random values and each UUIDv4 is considered unique across systems and time and it is designated to have a low probability of collision. Format UUIDv4 looks like this;

`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

- `x` represents a hexadecimal digit (0-9, a-f) that is randomly generated
- `4` indicates that is version 4 of UUID (UUIDv4)
- `y` specifies certain bits that define the UUID variant

UUIDv4 has become popular in web development and making it suitable for generating unique identifiers in distributed systems.

I have personally used UUIDv4 in several applications and the experience has been great. It may be a good option to use UUIDv4 when you want to expose the primary keys to the end user (e.g URL, API) without providing information about the total amount of data in your table. For example:

```json
{
  "id": "21ba44b5-8ce3-4d07-a303-925c01cd83c3",
  "name": "John Doe",
  "country": "Indonesia"
}
```

And here is when using `bigint` as a primary key

```json
{
  "id": 201,
  "name": "John Doe",
  "country": "Indonesia"
}
```

As you can see, when using `bigint` we can guess that John Doe is the 201st user. However, if using UUIDv4 we can't guess it. But if you don't have concerns to expose the id of the users regardless the user can guess it or not, `bigint` could be your best option.

## The problems

There is no problem when using UUIDv4 in terms of the performance of the application. But as a developer, I always try to find other options to improve my knowledge and I may implement it in the future. UUIDv4 is a great choice if you don't want to use `bigint` for the primary key, but as you already see that the result is pretty long and it is hard to copy the UUIDv4 with just a double click because it is separated by hyphen (`-`) so you need to select manually if you want to copy the whole id. This might be not a good experience at least from my point of view. Another problem is UUIDv4 is not sortable, it means you need to use different columns to sort your data. You can use a timestamp in your table if you have it, you will have this if using migration tools.

- So, how we solve these problems?
- What are we looking for for the solution?
- What if I still want to use `bigint` but I need data that can safely show to the end user?

To answer these questions let's go to the next section where I share what I use for my recent applications.

## Nano ID

Introducing Nano ID. [Nano ID](https://github.com/ai/nanoid) is a tiny, URL-friendly, and unique string ID generator. Nano ID is a library for generating random IDs that still have probability of duplicate IDs. However, this probability is extremely small and it is based on the rules you defined. Here are the features of Nano ID:

- **Small** - No dependencies, Size Limit controls the size.
- **Safe** - It uses hardware random generator and it can safely used in clusters.
- **Short IDs** - Uses larger alphabet than UUID (A-Za-z0-9_-). We can control it.
- **Portable** - Nano ID has been ported to many programming languages.

Source: [Nano ID](https://github.com/ai/nanoid)

To answer previous questions let's break them down one by one

**So, how we solve these problems?**

There are always advantages and disadvantages of the solution, however looking for other alternative that close to our requirements is important.

**What are we looking for for the solution?**

We are looking for a safe, small, and easy to control when generating random IDs where we safely can show to the end user and improve the user experience.

**What if I still want to use `bigint` but I need data that can safely show to the end user?**

You come to the right place, Nano ID is another good option where you want to control what the user can see while still maintaining using `bigint` for the primary key and of course you don't have to worry because `bigint` is sortable. Just like regular `int` but has more capacity.

## Nano ID in Rails

In this post, we are focusing on the Rails ecosystem where try to implement Nano ID in Rails application. Nano ID has been ported to many programming languages including Ruby, you can check the Nano ID for Ruby [here](https://github.com/radeno/nanoid.rb).

We are going to build simple Rails application for the Customer data, we will look Stripe Customers page for the basic inspiration. If you check out the Customer details page in Stripe, you will see the URL is using random string instead of an integer. Here is an example

`https://dashboard.stripe.com/test/customers/cus_MYkMUCVOIudoZg`

The `cus_MYgMUCVOIuqoZg` is a random unique string generated for the customer and you will see this string across all systems in Stripe. So, we will implement this kind of strategy in the Rails application.

> Note that what Stripe implements might be different, so take this post as a reference.

## Building application

Let's start by creating empty rails application by run `rails new rails-nanoid -T`. The `-T` means we will skip the tests file as we don't need for now. If you want to can add it later.

Then, move to the application directory `cd rails-nanoid` and if you use Git, don't forget to commit your changes.

```bash
git add .

git commit -m "Initial commit"
```

Open the app in your text editor, open `Gemfile` and add `nanoid` gem or you can add it from your terminal by running

```bash
bundle add nanoid
```

This command will add `nanoid` to your `Gemfile` and download it. If you check `Gemfile` , now you will see the `nanoid` has been installed.

```ruby
gem "nanoid", "~> 2.0"
```

We we build a customer data which includes name and country. We will still using `bigint` for the primary key and adding a new column called `public_id` to store the random IDs generated by Nano ID. We will not expose the `id`, instead we will use `public_id` for the URL routing. For example, to access the customer details the URL will be `customers/cus_MYgMUCVOIuqoZg`.

### Create Customer Model

We will use the rails scaffold generator to create customers page, this command will create model, views, and controller for us.

```bash
rails g scaffold Customer name:string country:string
```

Add `public_id` field with type `string` and length is 18. Why 18? Here is the illustration:

![Public ID Illustration](https://res.cloudinary.com/newer/image/upload/v1685516509/blog/how-i-use-nano-id-in-rails/illustration.png "Public ID Illustration")

- `cus` is the prefix for the `public_id` that has length 3 characters
- `_` is the separator that has 1 character
- `randomId` followed by random ID that has length 14 characters

So the total is 18 characters length for our `public_id`. We need to specify the length of the field so we don't waste the resources in the database.

Then open up the customers migration, in my case will be `db/migrate/20230531051206_create_customers.rb` and add `public_id` field, you can named it whatever you want but for suggestion named it something meaningful and easy to understand. So the complete migration for customers table looks like this:

```ruby
class CreateCustomers < ActiveRecord::Migration[7.0]
  def change
    create_table :customers do |t|
      t.string :public_id, limit: 18, null: false
      t.string :name
      t.string :country

      t.timestamps
    end
    add_index :customers, :public_id, unique: true
  end
end
```

In this migration, we define `public_id` with `string` type with limit 18 and can't be null. Also, we add new unique index to ensure there is no duplicate `public_id`.

Run the database migration by running `rails db:migrate`.

If you try to create customer, you will get an error because `public_id` is empty and we have define that `public_id` can't be null in the database.

### Generate Random ID with Nano ID

It's time to add Nano ID to our code, create a new concern file called `public_id_generator.rb`

```bash
touch app/models/concerns/public_id_generator.rb
```

And then add this code

```ruby {lineNumbers:true}
# frozen_string_literal: true

module PublicIdGenerator
  extend ActiveSupport::Concern

  included do
    class_attribute :public_id_prefix
    self.public_id_prefix = nil

    before_create :set_public_id
  end

  PUBLIC_ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  PUBLIC_ID_LENGTH = 14
  MAX_RETRY = 1000

  class_methods do
    def generate_nanoid(alphabet: PUBLIC_ID_ALPHABET, size: PUBLIC_ID_LENGTH, prefix: nil)
      random_id = Nanoid.generate(size:, alphabet:)
      prefix.present? ? "#{prefix}_#{random_id}" : random_id
    end
  end

  def set_public_id
    return if public_id.present?

    MAX_RETRY.times do
      self.public_id = generate_public_id
      return unless self.class.exists?(public_id:)
    end
    raise "Failed to generate a unique public id after #{MAX_RETRY} attempts"
  end

  def generate_public_id
    self.class.generate_nanoid(prefix: self.class.public_id_prefix)
  end
end
```

Explanation:

- Line 7-8: Define the class attribute called `public_id_prefix` where each model that include the `PublicIdGenerator` can specify the prefix based on the requirements. Example `cus` for Customer model
- Line 10: Add Active Record Callbacks `before_create` to assign `public_id` field to the random id generated by Nano ID. So this will only be called before creating a resource.
- Line 13: Define constants about what characters that will be used in the generator, the Nano ID will take this constant to generate random IDs.
- Line 14: Define the maximum length of the random ID.
- Line 15: Define the maximum number the application try when there is a collision. In this case, the app will try maximum 1000 times until found the unique random id.
- Line 18-21: Define class method for generating random id with Nano ID which is the actual code of generating random IDs with Nano ID.
- Line 24-32: In line 10, we add callback to call this method. This method doing a job to check whether the unique id has been used or not and assign it to the `public_id` field.
- Line 34-36: Call the `generate_nanoid` method and pass the `prefix` defined in the model.

### Using PublicIdGenerator

After we create a module for generate the public id, now we include the module in Customer model. Also, define the `public_id_prefix` for the Customer in this case is `cus`.

```ruby {lineNumbers:true}
class Customer < ApplicationRecord
  include PublicIdGenerator # shada:add

  self.public_id_prefix = "cus" # shada:add
end
```

So, if you want to use `public_id` in more models, what you have to do is add `public_id` field and include `PublicIdGenerator` module and you're ready to go.

Now let's try this out, run the application by `rails server`, open http://localhost:3000/customers in your browser and try to add a new customer. If success, you will be redirected to the details page, notice that the url is still using default id http://localhost:3000/customers/1. However, if you look at the logs you will see the `public_id` is generated

![Logs public_id](https://res.cloudinary.com/newer/image/upload/v1685516839/blog/how-i-use-nano-id-in-rails/logs-public-id.png "Logs public_id")

you can also check in the rails console to the first customer

![Rails console public_id](https://res.cloudinary.com/newer/image/upload/v1685516944/blog/how-i-use-nano-id-in-rails/rails-console-public-id.png "Rails console public_id")

As you can see, we have successfully generate random IDs with Nano ID. We have one left todo which is expose the `public_id` instead of `id` in the URL.

### Expose public_id

Currently, in the URL is using `id` and we want it to use `public_id` instead. In Rails, this is very common to change the params id in the URL and it is very straightforward.

Open routes file `config/routes.rb` and change the `customers` route.

```ruby
resources :customers # shada:remove
resources :customers, param: :public_id # shada:add
```

Open the customer model and add override `to_param` method which Action Pack uses for constructing a URL to this object. In this case, we will use `public_id` instead of `id`.

```ruby
class Customer < ApplicationRecord
	# code before...

  def to_param # shada:add
    public_id # shada:add
  end # shada:add
end
```

Lastly, open the customers controller `app/controllers/customers_controller.rb` and update to find the customer by `public_id`

```ruby
def set_customer
  @customer = Customer.find(params[:id]) # shada:remove
  @customer = Customer.find_by!(public_id: params[:public_id]) # shada:add
end
```

Let's try again, re-start the server and access the customers page. Click one of the customers you've created and see the URL is changed and now using the `public_id`. In my case, the first customer will be `http://localhost:3000/customers/cus_B0VmfGwUidEvV4`.

Congratulations!🎉 You have successfully implementing Nano ID in Rails application, with this approach we still maintain regular id for the primary key which supports unique data and sortable.

## Conclusion

Although using the default primary key using `bigint` is good, we must have to look out for requirements first. Define what the application needs, and consider the pros and cons of using a different approach.

Using randomly generated IDs like Nano ID could be a good alternative, however, as a developer, we must understand what Nano ID really does in our application. Defining the number of characters in the generated IDs is also important, to help with that Nano ID has a [Collision Calculator](https://zelark.github.io/nano-id-cc/) to give us how many years in order to have a 1% probability of collision.

![Nano ID Calculator](https://res.cloudinary.com/newer/image/upload/v1685517597/blog/how-i-use-nano-id-in-rails/nanoid-calculator.png "Nano ID Calculator")

In our case, we have 14 characters and it needs at least 57 thousand years to have 1% probability of collision if we generate 1000 IDs per hour.

Download source code: https://github.com/daily-newer/rails-nanoid

## References

- https://github.com/ai/nanoid
- https://zelark.github.io/nano-id-cc/
- https://github.com/radeno/nanoid.rb
- https://planetscale.com/blog/why-we-chose-nanoids-for-planetscales-api

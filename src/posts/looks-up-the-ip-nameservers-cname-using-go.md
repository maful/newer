---
title: Looks up the IP, Nameservers, and CNAME using Go
permalink: "posts/{{ title | slugify }}/index.html"
description: One of the advantages to using Go is Standard Library, Go has built in library that already included when installing Go on your machine. There are many libraries you can use to build such as web application, rest api, command line interface (CLI), and many more to just using Standard Library.
opengrapgh: true
date: 2021-04-07
color: juicy-peach-gradient
illustration: browser_window_displaying_workspace
tags:
  - Go
  - Application
  - CLI
  - Backend
---

## Introduction

One of the advantages to using Go is Standard Library, Go has built in library that already included when installing Go on your machine. There are many libraries you can use to build such as web application, rest api, command line interface (CLI), and many more to just using Standard Library.

Today, I'm going to show you how to Lookup the IP, Nameservers, and CNAME for a particular host.

> I assume you know a basic understanding of Go and setup GOPATH on your machine. Check this link about GOPATH https://github.com/golang/go/wiki/SettingGOPATH

## Build

We are gonna using [Go modules](https://blog.golang.org/using-go-modules) to create the app.

- Create directory `go-lookup`.
- Move to the `go-lookup` directory and run `go mod init go-lookup` to initialize the modules.

Then create a new file `main.go` inside the root directory. We're gonna use `main.go` to create the function and act as the main application also.

Here is the inital code inside `main.go`

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from APP")
}
```

Build and run the program with `go run main.go`, make sure you already in the directory.

```
$ go run main.go
Hello from APP
```

As you can see, the program will print Hello from APP using `Println` from the [`fmt`](https://golang.org/pkg/fmt) package.

### Lookup the DNS Records from given domain name

Open `main.go` and remove the `Println` line as before, and now we're going to use the `net` package to lookup the DNS name. First, create a variable to store the domain name inside the main function.

```go
import "fmt" // shada:remove
import ( // shada:add
    "fmt" // shada:add
    "net" // shada:add
) // shada:add

fmt.Println("Hello from APP") // shada:remove
// Define domain name
host := "maful.web.id" // shada:add
fmt.Printf("Domain: %s\n\n", host) // shada:add
```

Then, use LookupNS function from net package

```go
// Lookup the DNS Records from the domain name
ns, err := net.LookupNS(host)
if err != nil {
    panic(err)
}
```

`LookupNS` will return pointer of `NS` array, so that we have to looping the `ns` variable to print the Nameserver. If an error occurs, stop the program immediately by using `panic`.

```go
// Looping the Nameserver and ignore the index
for _, v := range ns {
    fmt.Println(v.Host)
}
fmt.Println()
```

Finally, build and run again. You should see the list of Nameserver for the given domain name, in this case is my domain.

```
$ go run main.go
ns1.vercel-dns.com.
ns2.vercel-dns.com.
```

### Lookup the IP addresses

Secondly, we still use the same package to lookup the IP addresses with [LookupIP](https://pkg.go.dev/net#LookupIP) function.

```go
fmt.Println("Looks up the IP Addresses")
ips, err := net.LookupIP(host)
if err != nil {
    panic(err)
}
for i := range ips {
    fmt.Println(ips[i])
}
fmt.Println()
```

`LookupIP` will return a slice of bytes, so we just need to to use index to get the IP. Here is the result so far when you build and run the program.

```
$ go run main.go

76.76.21.21
```

`76.76.21.21` is the IP of the domain.

### Lookup the CNAME

Lastly, we will use `LookupCNAME` function from net library to get CNAME ([wikipedia](https://en.wikipedia.org/wiki/CNAME_record)).

```go
fmt.Println("Looks up the CNAME")
cname, err := net.LookupCNAME(host)
if err != nil {
    panic(err)
}

fmt.Println(cname)
```

We don't need looping like the previous one, we just print the `cname` directly because `LookupCNAME` returns string. Here is the result:

```
$ go run main.go

maful.web.id.
```

## Conclusion

Finally, we have created a simple application using Go. Based on what we code before, we can refactor the code into several functions, but we're not doing in this tutorial.

```go
package main

import (
    "fmt"
    "net"
)

func main() {
    // Define domain name
    host := "maful.web.id"
    fmt.Printf("Domain: %s\n\n", host)

    // Lookup the DNS Records from the domain name
    fmt.Println("Looks up the Nameservers")
    ns, err := net.LookupNS(host)
    if err != nil {
        panic(err)
    }
    // Looping the Nameserver and ignore the index
    for _, v := range ns {
        fmt.Println(v.Host)
    }
    fmt.Println()

    fmt.Println("Looks up the IP Addresses")
    ips, err := net.LookupIP(host)
    if err != nil {
        panic(err)
    }
    for i := range ips {
        fmt.Println(ips[i])
    }
    fmt.Println()

    fmt.Println("Looks up the CNAME")
    cname, err := net.LookupCNAME(host)
    if err != nil {
        panic(err)
    }

    fmt.Println(cname)
}
```

Full result

```
$ go run main.go

Domain: maful.web.id

Looks up the Nameservers
ns2.vercel-dns.com.
ns1.vercel-dns.com.

Looks up the IP Addresses
76.76.21.21

Looks up the CNAME
maful.web.id.
```

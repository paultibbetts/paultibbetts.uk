+++
title = "Projects"
page_title = "Paul Tibbetts made"
type = "page"
show_in_pages_nav = true
+++

{{<toc>}}

## Websites

### [paultibbetts.uk](paultibbetts.uk)

My website is my favourite project.

### [infra.paultibbetts.uk](infra.paultibbetts.uk)

Documentation that explains how I use code to configure the infrastructure for my website.

### [dev.paultibbetts.uk](dev.paultibbetts.uk)

Documentation for my developer environment and the tools I use.

## Code

### [terraform-provider-mythicbeasts](https://github.com/paultibbetts/terraform-provider-mythicbeasts)

A Terraform provider for Mythic Beasts - which I use to [host my site on a Raspberry Pi 4](/2026/02/19/moved-my-website-from-github-pages-to-a-raspberry-pi/).

### [mythicbeasts-client-go](https://github.com/paultibbetts/mythicbeasts-client-go)

A client so the Terraform provider can speak to the Mythic Beasts APIs.

### [ansible-role-caddy](https://github.com/paultibbetts/ansible-role-caddy)

An Ansible role to install and operate Caddy web server, which I use for my website and my homelab.

### mealie-enricher

[Mealie](https://mealie.io/) is a recipe management and meal planning app I use.

mealie-enricher - not currently public - is a terminal and web app to import recipes from Hello Fresh into my instance into Mealie, and then "enrich" them with corrections and photos.

Written in [#go](/tags/go).

### ingredient-parser-api

Used by `mealie-enricher` and also not currently public. 

The [ingredient-parser-nlp]() package available via HTTP, so it can be used as a micro-service to parse ingredient strings.

## Homelab

I run my own homelab, where I host services on my own hardware.

It is a never-ending project.

I am planning a change that will lead to me publishing it publicly.

### Home

Services I use daily, like RSS, git, and a recipe management app.

### Lab

Kubernetes on a [Turing Pi 2.5]() with 3 x [RK1] nodes. 

I am planning on self-hosting some services for my website and testing out some new apps to run permanently.
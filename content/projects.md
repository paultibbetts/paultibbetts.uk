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

Built with Hugo, uses a custom theme made with TailwindCSS, hosted on a Raspberry Pi.

[Code](https://github.com/paultibbetts/paultibbetts.uk) [Posts](/tags/meta)

<span class="text-muted">#Hugo</span> <span class="text-muted">#TailwindCSS</span>

### [infra.paultibbetts.uk](infra.paultibbetts.uk)

Documentation for how I use code to configure the infrastructure for my website.

[Code](https://github.com/paultibbetts/infra.paultibbetts.uk)

<span class="text-muted">#Terraform</span> <span class="text-muted">#Ansible</span>

### [dev.paultibbetts.uk](dev.paultibbetts.uk)

Documentation for my developer environment and the tools I use.

[Code](https://github.com/paultibbetts/dev) [Posts](/tags/dev-env/)

<span class="text-muted">#Astro</span> <span class="text-muted">#Starlight</span> <span class="text-muted">#bash</span>

### [ya-react-hn](https://ya-react-hn.vercel.app/news/1)

Hacker News client built in React, with dark mode support and unread links highlighted differently.

[Code](https://github.com/paultibbetts/reactHN)

<span class="text-muted">#React</span>

## Code

### [terraform-provider-mythicbeasts](https://registry.terraform.io/providers/paultibbetts/mythicbeasts/latest/docs)

A Terraform provider for Mythic Beasts - which I use to [host my site on a Raspberry Pi](/2026/02/19/moved-my-website-from-github-pages-to-a-raspberry-pi/).

[Code](https://github.com/paultibbetts/terraform-provider-mythicbeasts) [Post](/2026/03/03/i-made-a-terraform-provider-for-mythic-beasts/)

<span class="text-muted">#Terraform</span> <span class="text-muted">#go</span>

### [mythicbeasts-client-go](https://pkg.go.dev/github.com/paultibbetts/mythicbeasts-client-go)

A client so the Terraform provider can speak to the Mythic Beasts APIs.

[Code](https://github.com/paultibbetts/mythicbeasts-client-go)

<span class="text-muted">#go</span>

### [ansible-role-caddy](https://galaxy.ansible.com/ui/standalone/roles/paultibbetts/caddy/)

An Ansible role to install and operate Caddy web server, which I use for my website and in my homelab.

[Code](https://github.com/paultibbetts/ansible-role-caddy) [Post](/2026/02/24/i-made-an-ansible-role-for-caddy/)

<span class="text-muted">#Ansible</span>

### mealie-enricher

[Mealie](https://mealie.io/) is a recipe management and meal planning app I use.

mealie-enricher is a terminal and web app to import recipes from HelloFresh into my instance into Mealie, and then "enrich" them with corrections and photos for each step.

It's not public yet.

<span class="text-muted">#go</span>

### ingredient-parser-api

Used by `mealie-enricher` and also not public yet.

The [ingredient-parser-nlp](https://ingredient-parser.readthedocs.io/en/latest/) package available via HTTP, so it can be used as a micro-service to parse ingredient strings.

<span class="text-muted">#python</span>

## Homelab

I run my own homelab, where I self-host apps and services on my own hardware.

It is a never-ending project.

### Home

Services I use daily, like RSS, git, and a recipe management app.

I have started a [series narrating the setup](/series/homeops-tour).

[Code](https://github.com/paultibbetts/homeops)

<span class="text-muted">#Terraform</span> <span class="text-muted">#Ansible</span>

### Lab

Kubernetes on a [Turing Pi 2.5](https://turingpi.com/) with 3 x [RK1](https://turingpi.com/product/turing-rk1/) nodes.

This is where I experiment with new apps and services to self-host, as well as new ways of doing so.

[Code](https://github.com/paultibbetts/homelab)

<span class="text-muted">#Kubernetes</span> <span class="text-muted">#Argo CD</span> <span class="text-muted">#Helm</span>

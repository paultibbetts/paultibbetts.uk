+++
date = '2026-02-23T16:32:17Z'
draft = false
title = 'I Made a Mythic Beasts Provider for Terraform'
tags = ['Terraform', 'Mythic Beasts']
+++

[paultibbetts/terraform-provider-mythicbeats](https://github.com/paultibbetts/terraform-provider-mythicbeasts) is a Terraform provider for Mythic Beasts that lets you declare your Mythic Beasts infrastructure as code.

I use it to provision the infrastructure for my personal website.

This is why I built it, what it does, and how to use it.

<!--more-->

## Why I built it

I prefer writing down my infrastructure as code. It's something I've been doing for years now, and I don't think I could go back to doing things manually, no matter how small or simple the setup.

I'd decided to use a Pi from Mythic Beasts to host my site and saw that they had APIs available, but no Terraform provider. 

Terraform is a tool I've been using for infrastructure for a while now, and I wanted to use it with Mythic Beasts because:

- I wanted a fully reproducible setup
- I didn't want to click around the control panel
- their Pis are IPv6-only, so I'd need to also set up the proxy
- - I wanted to declare the Pi and the Proxy Endpoints next to each other

Plus, I'd never written a Terraform provider before, and I wanted to see how hard it was.

## What it does

Terraform is a tool for writing your infrastructure as code, and a provider is a plugin that lets it work with different infrastructure providers.

For example you can write:

```hcl
terraform {
  required_version = ">= 1.11.0"

  required_providers {
    mythicbeasts = {
      source = "paultibbetts/mythicbeasts"
    }
  }
}

resource "mythicbeasts_pi" "pi" {
	identifier   = "web"
	disk_size    = 10
	model        = 4
	memory       = 4096
	os_image     = "rpi-bookworm-arm64"
    ssh_key      = "ssh-ed25519 ..."
    wait_for_dns = true
}
```

then run `terraform apply`, and you would get a Raspberry Pi 4 from Mythic Beasts.

### Resources

The provider uses the Mythic Beasts APIs to let you configure the following resources:

- VPS
- Raspberry Pi
- Proxy Endpoint

The Raspberry Pis from Mythic Beasts are on an IPv6-only network, so the Proxy Endpoints are to allow users trying to access from an IPv4-only network.

### Data sources

Some of the settings for the resources require specific values, like the `os_image` to use, and data sources make it easy to get this info from the API.

For example, the `mythicbeasts_pi_operating_systems` data source can be used to get all valid `os_image` values for a Raspberry Pi 4:

```hcl
data "mythicbeasts_pi_operating_systems" "four" {
  model = 4
}
```

where you would inspect the data to choose the right value to use.

Alternatively you could use Terraform to find the right value for you, for example to use "Debian Bookworm":

```hcl
data "mythicbeasts_pi_operating_systems" "four" {
  model = 4
}

locals {
  bookworm = one([
    for id, _ in data.mythicbeasts_pi_operating_systems.four :
    id
    if can(regex("bookworm", id))
  ])
}

resource "mythicbeasts_pi" "bookworm" {
  model    = 4
  os_image = local.bookworm
  ...
}
```

where Terraform will use regex to find the value with "bookworm" in the ID.

### Attributes

Using Terraform for your infrastructure not only lets you write it down as code, and get all the benefits that brings, but you can also use the attributes of one thing as the inputs for another.

For example: the Pis from Mythic Beasts are on an IPv6-only network and need endpoints set up on the proxy to let users access them from IPv4-only networks.

To do this you can get the attribute from a Pi resource, like the IP address, and then use that as the input for the proxy endpoint resource:

```hcl
locals {
  domain = "example.com"
  subdomains = {
    apex  = "@"
    www   = "www"
  }
}

resource "mythicbeasts_pi" "web" {
	identifier   = "web"
	disk_size    = 10
	model        = 4
	memory       = 4096
	os_image     = "rpi-bookworm-arm64"
    ssh_key      = "ssh-ed25519 ..."
    wait_for_dns = true
}

resource "mythicbeasts_proxy_endpoint" "endpoint" {
  for_each = local.subdomains

  domain         = local.domain
  hostname       = each.value
  address        = mythicbeasts_pi.web.ip
  site           = "all"
  proxy_protocol = true
}
```

## How to use it

The provider is available on [the Terraform registry](https://registry.terraform.io/providers/paultibbetts/mythicbeasts/latest/docs).

### Authentication

The Mythic Beasts APIs require an [API key](https://www.mythic-beasts.com/customer/api-users) for authentication.

When creating the key you must add permissions to work with the APIs you wish to use, such as:

- "Virtual Server Provisioning" for VPS
- "Raspberry Pi provisioning" for Pis
- "IPv4 to IPv6 Proxy API" for Proxy Endpoints

### Proxy endpoint domain management

The domain used for proxy endpoints must be registered with the Mythic Beasts control panel.

This can be done by registering the domain using their [domain management](https://www.mythic-beasts.com/customer/domains) or by [adding it as a 3rd party domain](https://www.mythic-beasts.com/customer/3rdpartydomain).

### Installation

```hcl
terraform {
  required_version = ">= 1.11.0"

  required_providers {
    mythicbeasts = {
      source = "paultibbetts/mythicbeasts"
    }
  }
}

provider "mythicbeasts" {
  keyid  = "your-keyid"
  secret = "your-secret"
}
```

Alternatively, credentials can be supplied via environment variables:

- `MYTHICBEASTS_KEYID`
- `MYTHICBEASTS_SECRET`

## Examples

Examples of each resource and data source can be found at [/examples](https://github.com/paultibbetts/terraform-provider-mythicbeasts/blob/main/examples).

These are also used to generate the [documentation hosted by the Terraform registry](https://registry.terraform.io/providers/paultibbetts/mythicbeasts/latest/docs).

## How it works

The provider uses the newer [Terraform Plugin Framework](https://github.com/hashicorp/terraform-plugin-framework).

For it to work with the Mythic Beasts APIs I had to create a Go client, which can be found [on GitHub](https://github.com/paultibbetts/mythicbeasts-client-go/). The client handles the APIs and means that the provider only needs to focus on Terraform itself.

The Mythic Beasts VPS API needs values that are only ever used when creating a VPS and so the provider uses the new [write-only](https://developer.hashicorp.com/terraform/language/manage-sensitive-data/write-only) arguments feature, which is only available in Terraform v1.11.0 and later. Write-only is normally used for sensitive values like passwords but the VPS API doesn't return every attribute so write-only is used for these values when creating the VPS and then they are forgotten.

## Support

To make it clear, this is an unofficial provider that is not endorsed by Mythic Beasts.

It's currently at version `v0.1` and I wouldn't consider it stable until it hits `v1.0`.

I have no immediate plans to work on it. It does what I need it to do - for now.

## In use

I use the provider to provision a Raspberry Pi 4 from Mythic Beasts and set up the proxy endpoints for my personal website.

The whole setup, with Terraform to provision the Pi and then Ansible to configure it, is documented at [infra.paultibbetts.uk](https://infra.paultibbetts.uk).

## What's next?

The provider currently works with the VPS, Pi, and Proxy APIs, as these are what I currently use or have used in the past.

Mythic Beasts also have an API for [DNS](https://www.mythic-beasts.com/support/api/dnsv2) which lets you manage the DNS records for domains.
If I were to add this to the provider I could potentially change the management of my domain from Cloudflare over to Mythic Beasts.
+++
date = '2026-02-24T12:10:45Z'
draft = false
title = 'I Made an Ansible Role for Caddy'
tags = ['Ansible', 'Caddy', 'code']
+++

[paultibbetts/ansible-role-caddy](https://github.com/paultibbetts/ansible-role-caddy) is an Ansible role for Caddy web server that lets you install Caddy with plugins.

I use it for my personal site and in my homelab.

This is what it does and how to use it.

<!--more-->

## What it does

An Ansible role is like a plugin that extends Ansible with the ability to do something, and in this case it's to install and manage [Caddy](https://caddyserver.com/).

Specifically it:

- installs Caddy
- - defaults to using the `apt` package manager
- - or it can be given the URL to a specific binary
- - or it can be given a list of plugins
- can be used to manage Caddy
- - or completely uninstall it
- can write the Caddyfile from a template

## Why Caddy?

I use Caddy because it manages TLS certificates automatically and, with a plugin, supports [DNS-01 challenges](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge).

DNS-01 is useful when services aren't reachable by Lets Encrypt, like in a homelab, so private networks can also have TLS.

## Design goals

The role was designed with the following in mind:

- idempotent and safe to re-run
- Debian and Ubuntu
- works on x86 and ARM
- supports installing with plugins
- can optionally write the Caddyfile

There are already Ansible roles for Caddy, like the one listed in [the docs](https://caddyserver.com/docs/install#ansible), but I needed a role that could install Caddy with plugins.

## How to use it

The role is available on [Ansible Galaxy](https://galaxy.ansible.com/ui/standalone/roles/paultibbetts/caddy/).

### Install

You can install it by adding:

```yaml
- name: paultibbetts.caddy
  version: 1.0.0
```

to your `requirements.yml` file and then running:

```sh
ansible-galaxy role install -r requirements.yml
```

### Variables

The variables for the role, as well as the default settings, can all be overridden.

The most important ones are the install method, the plugins to include, and whether the role writes the Caddyfile for you.

```yaml
caddy_install_method: apt
```

The role defaults to installing Caddy via `apt`, the package manager for Debian/Ubuntu.

This means Caddy does not include any plugins but it does get updated when you run `apt upgrade`.

```yaml
caddy_install_method: download
```

Alternatively you can change the install method to `download`.

Now you can pass in the URL of a specific binary using:

```yaml
caddy_download_url: ""
```

Using this you could build a binary for Caddy (including plugins), host it, then pass that URL to the role and that specific binary will be installed.

This is currently the only way to install a specific version of Caddy that isn't "latest".

If you want to install plugins for Caddy and don't want to build your own binary you can leave the download URL empty and pass in the plugins:

```yaml
caddy_plugins:
  - github.com/caddy-dns/cloudflare
```

and the role will generate a URL from the [download page](https://caddyserver.com/download).

```yaml
caddy_caddyfile_template: "" | "{{ playbook_dir }}/templates/Caddyfile.j2"
```

The Caddyfile template variable lets you pass in a template of a Caddyfile for Caddy to use and it will be written to the appropriate place.

Letting the role write the Caddyfile means you can import the role, set its variables, and have all of Caddy configured by one thing - you don't need to write extra tasks after installation to get it up and running.

### Examples

The following examples show how the role can be used for a public website and for a private homelab reverse proxy.

In both instances Caddy acquires TLS certificates from Lets Encrypt, using Cloudflare to do DNS-01 challenges.

#### Example: Personal website

The role can be used to setup Caddy to host a personal website.

```yaml
- hosts: server
  become: true
  roles:
    - role: paultibbetts.caddy
      vars:
        caddy_caddyfile_template: "{{ playbook_dir }}/templates/Caddyfile.j2"
        caddy_install_method: download
        caddy_plugins:
          - github.com/caddy-dns/cloudflare
        caddy_manage_systemd_env_file: true
        caddy_systemd_env:
            CF_API_TOKEN: "{{ vault_cf_api_token }}"
```

The `download` install method is used to install Caddy with the [Cloudflare plugin](https://github.com/caddy-dns/cloudflare), the Cloudflare API token is passed to Caddy from Ansible vault, and a template is provided for the Caddyfile, which could look like: 

```Caddyfile
(cf_tls) {
    tls {
        dns cloudflare {env.CF_API_TOKEN}
    }
}

{% for site in web_sites %}
{{ site }} {
  import cf_tls
  root * {{ web_sites_root }}/{{ site }}/current
  file_server
  encode zstd gzip
  log
}
{% endfor %}
```

This sets up Caddy to use Cloudflare to do DNS-01 challenges with Lets Encrypt to get a TLS certificate for each `site in web_sites`. 

#### Example: Homelab

The role can also be used to setup Caddy in a private network, like a homelab.

```yaml
- hosts: homelab
  become: true
  roles:
    - role: paultibbetts.caddy
      vars:
        caddy_caddyfile_template: "{{ playbook_dir }}/templates/Caddyfile.j2"
        caddy_install_method: download
        caddy_plugins:
          - github.com/caddy-dns/cloudflare
        caddy_manage_systemd_env_file: true
        caddy_systemd_env:
            CF_API_TOKEN: "{{ vault_cf_api_token }}"
```

```Caddyfile
{
        acme_dns cloudflare {env.CF_API_TOKEN}
}

service.homelab.example {
        reverse_proxy <ip>:<port>
}
```

where the Cloudflare plugin is configured once and is then used to do DNS-01 challenges for any TLS certificates Caddy requests. Note this style has been deprecated and you should do it per host, like the earlier example for a personal website.

DNS-01 challenges are solved by writing a TXT record to prove domain ownership. This means Lets Encrypt is able to issue certificates for domains it can't reach, which makes DNS-01 ideal when Caddy is running in a homelab.

## Molecule Scenarios

Ansible Molecule is a way to run tests for an Ansible role.

The role includes molecule scenarios that test it works on x86 as well as Arm, because I use the role on a Raspberry Pi 4, as well as scenarios for the Cloudflare plugin and the Caddyfile templating.

## In use

I use this role as part of the code that sets up the infrastructure for my website.

Terraform is used to provision the server, then Ansible is used to configure it, with this role setting up Caddy and the Caddyfile it uses.

The complete setup - Terraform, Ansible, Caddy, and the rest of the files - is documented at [infra.paultibbetts.uk](https://infra.paultibbetts.uk), where I explain how it all fits together.

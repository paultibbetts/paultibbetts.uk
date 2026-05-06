+++
date = '2026-05-06T21:05:00+01:00'
title = 'HomeOps Tour: Overview'
series = 'homeops-tour'
tags = ['homelab', 'homeops']
+++

Welcome to my HomeOps Tour, where I'll be your guide to the stable part of my Homelab.

<!--more-->

## What is HomeOps?

HomeOps isn't a widely used term, but I have seen a few people use it. To explain what I mean by it I should first define "Homelab".

A homelab is a setup of computers you control and use for experiments - like a laboratory. It's usually at home, hence the name, but not always. You might own all the equipment, rent it, or even send your own machines to a provider so they can run them for you - called "colocation".

The problem is that homelab seems to cover experimentation as well as self-hosting services you use every day, which have different needs.

HomeOps, short for "Home Operations", is my attempt at labelling the stable part of my homelab.

## Purpose

My HomeOps setup is used to host the apps and services a few people depend on, so I can't be breaking it every five minutes.

Some people call this "HomeProd", short for "Home Production", which separates it from the "development" or "staging" environment you use for experiments. 

As such I treat it like a real production system: stable, reproducible, and intentionally boring to operate.

## Architecture

The system is split over different machines, each with a different purpose.

- a <abbr title="Network Attached Storage">NAS</abbr> provides storage over the network
- a server hosts all the apps and services
- a rented <abbr title="Virtual Private Server">VPS</abbr> lets external users in securely through a "tunnel"
- a Raspberry Pi monitors it all

The whole thing is written down as Infrastructure as Code, with Terraform defining the infrastructure and Ansible for configuring it. This would let me reproduce it if a machine breaks and I need to set up a new one.

The server uses a hypervisor as an operating system and services generally get their own virtual machine. One of those VMs uses Docker to run most of the apps.

## Key Decisions

Each of these deserve their own post later in the series.

### Separating HomeOps from Homelab

I made this split after _the data loss incident_ which taught me not to let others depend on apps I'm only trialing in my lab, especially without working backups.

### Infrastructure as code

Everything is written down as code, so there's as little manual setup as possible. This means I can see what's going on by inspecting the code, and I can automate configuration.

### Terraform and Ansible, not Kubernetes

When I started I wanted to compare Terraform and Ansible against Kubernetes for running a homelab. 

I thought I'd prove that Kubernetes was obviously the better choice, but two years later I've found the Terraform and Ansible setup works just fine, so that's what powers my HomeOps.

I use Kubernetes in its own environment where I run experiments.

### Not highly available

One downside to my setup is that it's not highly available. If a machine breaks then there's nothing to fill in for it until I replace it. I could fix this by running more machines, but that increases the cost.

For now I can live with the downtime. So far nothing's broken, although one day something will.

## What this series will cover

In this series I'll go over each part of the system in more detail, including the hardware, IaC, services that run on top, and how I let people access it from outside my home.

The aim is not to present this as the correct way to run a homelab, but to explain the choices I made, how they fit together, and why I use the apps that I do. 

It will be split up so you can dive in and out at any point to read just the parts that interest you, with links to anything written earlier that provides necessary context. 

It might be awkward in that the system builds up in layers, and things may only make sense for my particular setup, but I'll try my best to generalise each part so it's relevant on its own.

## Next

Coming up first is the hardware I use. 

Check back soon for the link, or subscribe to the [feed for this series]() in your feed reader.

Or jump straight into the code, which is now on [GitHub](https://github.com/paultibbetts/homeops).



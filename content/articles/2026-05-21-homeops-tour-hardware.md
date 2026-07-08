+++
date = '2026-05-21T13:35:06+01:00'
series = 'homeops-tour'
title = 'HomeOps Tour: Hardware'
tags = ['homelab', 'homeops']
+++

The first stop on my HomeOps Tour covers the hardware I use.

<!--more-->

It's a mix of "too expensive" and "I should have spent more on this".

None of this was designed all at once. It's the result of buying things for one reason, repurposing them for another, and slowly discovering a stable setup.

## What it's for

HomeOps is the boring half of my homelab: the part that runs the services I actually depend on.

It started as an all-in-one server, but I eventually moved away from that. It was convenient until it wasn't; every change was risky.

Splitting it up gives me more to manage, but also a smaller blast radius when something goes wrong.

## Overview

| Device | Role       | Purpose                                |
| ------ | ---------- | -------------------------------------- |
| NAS    | Storage    | archiving, media, network shares       |
| NUC    | Server     | apps, databases, services              |
| VPS    | Tunnel     | external entry point for tunnel access |
| Pi     | Monitoring | monitors everything else               |

Each of these devices could do more than they currently do, but I've tried to keep their roles separate.

They are more like pets than cattle: the software is reproducible but the machines are not disposable.

## NAS

I have a dedicated machine for Network Attached Storage. I built it myself; the specs are [in the repo](https://github.com/paultibbetts/homeops/tree/main/hardware/nas). It runs [TrueNAS](https://www.truenas.com/) and is the central place for storage, backups, archiving, and media.

Storage is shared over NFS for Mac and Linux, and SMB for Windows. The only app the NAS runs is [minIO](https://www.min.io/), which provides S3-compatible storage. minIO changed its license recently so I am eventually going to swap it for something else.

It has 4TB of NVMe storage, which is the pool I use most often. My NAS and PC are connected through a small 10GbE switch, so from my PC it feels like the drives are plugged in directly. These drives are **not** set up in a RAID array, so if one failed I would lose data.

For archiving and longer-term storage it has 4 x 6TB HDD set up in a RAIDZ2 array, which means 2 of the drives could fail before I lost data. Anything important is copied to the RAIDZ2 pool, which is why I'm comfortable running the NVMe drives without redundancy. [RAID is not a backup](https://www.raidisnotabackup.com/), so I _should_ back this data up to an external location, but I'm yet to set this up.

It was originally made up of spare parts from an old gaming PC but I decided I wanted <abbr title="Error Correcting Code">ECC</abbr> memory. That meant replacing the CPU and motherboard with parts that supported it, and the affordable options were older server components. At this point the only gaming PC parts still in use are the case and the PSU.

### Review

Those older server components are less efficient and more power-hungry than newer ones would be.

It was expensive. I made the decision that storage was important enough to justify ECC memory, but plenty of people choose to go without it. ECC is there to protect against memory-related corruption, and I don't know whether it's ever actually done that.

It's overpowered and underutilised for its current role, mostly because it used to do everything and now it just does storage.

However, it plays a major part in my HomeOps setup, so it's definitely worth its place.

If you have a homelab, or even just multiple computers in one household, you would benefit from a NAS. It doesn't need to be an expensive one like mine though.

## NUC

I use an Intel NUC as my server. Specs are [in the repo](https://github.com/paultibbetts/homeops/tree/main/hardware/nuc).

Originally I used my NAS as a server, until I found that messing with it made it unstable, so I stopped doing that and looked for something else. I bought something from Kickstarter, and in true Kickstarter fashion it was delayed multiple times, and eventually I got impatient and bought the NUC.

It's modern and pretty power efficient, which means running it is much cheaper than the NAS made out of older components.

The CPU has 12 cores and 16 threads, which gives me plenty of headroom for virtualisation. I have [Proxmox](https://www.proxmox.com/en/products/proxmox-virtual-environment/overview) installed and use it to run 9 virtual machines and 1 LXC. This lets me split services across separate environments instead of installing everything directly on one host, so a problem with one service is less likely to affect the others.

The LXC is for Jellyfin, which is self-hosted Netflix for movies I store on my NAS. The NUC has an integrated Intel GPU that supports _Quick Sync_, which Jellyfin uses for hardware-accelerated transcoding. This means I can watch my movies from any device and let the GPU do the transcoding, leaving the CPU available for the other services hosted by the NUC.

### Review

The NUC is an excellent home server. It's not enterprise hardware with redundant power supplies and room for expansion, but its size and efficiency make it a great fit at home.

The trade-off is that it's not a box for lots of disks. Mine has room for an SSD boot drive and the NVMe I use for local data. After that I needed to pair it with my NAS for extra storage.

It has a 2.5GbE NIC. That is not as fast as the 10GbE link to the NAS, but is more than enough for what I use it for.

If I started again and didn't need much local storage, a machine like this might be all I needed.

Unfortunately Intel has stopped making these but places like [Minisforum](https://www.minisforum.uk/) make ones that are similar.

## VPS

The VPS is the only machine in this setup that I don't physically own. It's rented from [Hetzner](https://www.hetzner.com/).

It is the public side of my "tunnel" setup, which I'll explain in a future post. The services I run are hosted at home and this VPS gives me an entry point without directly exposing my home network.

There isn't much to say about it. Hetzner is some of the cheapest European hosting I could find, and even though the VPS is located in Germany it doesn't add any real delay to my connection.

## MonPi

The final part of the setup is the Raspberry Pi that monitors everything else.

The reason it exists is separation. I didn't want to run monitoring on the same machines that host the services. If the NAS or the NUC has a problem, a separate device has a better chance of catching it.

It runs two types of monitoring: Uptime Kuma for service uptime checks, and Beszel for host metrics. I'll cover these in more detail later in the series.

### Review

The Pi works great for monitoring, but for this particular model that's about all it can do.

It was originally called "DeskPi" and was plugged into a screen to show a live output, but because it has only 2GB of RAM it struggled to run the desktop environment and I quickly gave up on that idea.

## What's missing

There are two pieces of hardware people might expect to see listed here that I don't yet have: a custom router and a <abbr title="Uninterrupted Power Supply">UPS</abbr>.

I still use the router my ISP gave me, instead of something like OPNsense or pfSense. I've worked around some of its limitations by letting Pi-hole handle DHCP - more details on that in the Pi-hole post. I will be moving soon, and when I get settled I'll start working on the router.

The UPS will come after. It is risky running a NAS without one, but I live in the UK, and in the five years I've lived in this house there's been exactly one power cut, so I haven't felt the need to prioritise it.

## Not Highly Available

The obvious limitation of my setup is that it's not highly available.

Splitting storage, compute and monitoring across different machines gives me cleaner roles and a smaller blast radius than the all-in-one server I started with. It does not mean the setup can survive any of those machines breaking.

If the NUC dies, my services go offline. If the NAS fails, the storage layer is unavailable. If the VPS has a problem, friends and family can't get through the tunnel. MonPi monitors the setup, but nothing is monitoring MonPi.

There is an old redundancy saying that "two is one and one is none". That applies here, but in different ways at different layers. The NAS has redundant disks, but it is still a single machine with one motherboard, one power supply and one network path. The NUC is a single host, so the VMs and containers running on it have nowhere else to fail over to.

Making the NUC highly available would mean running multiple Proxmox nodes. That means not just two machines, but three, so Proxmox can [maintain quorum](https://pve.proxmox.com/wiki/High_Availability).

That would be a better <abbr title="High Availability">HA</abbr> design, but it would also mean more hardware and more power usage.

For now, I have accepted that my setup might have downtime because that is the trade-off that keeps it affordable and manageable at home.

## Next

That's the hardware covered for my setup.

The important thing is not that any individual machine is special, it's that each one has a clear job. The NAS stores things, the NUC runs things, the VPS provides the public entry point, and the Pi monitors it all.

It's not perfect, and it's not highly available, but it's much easier to work with than the all-in-one server I started with.

Next I'll look at the storage layer in more detail: how I use TrueNAS for network shares, archives, and the storage services that support the rest of the setup.

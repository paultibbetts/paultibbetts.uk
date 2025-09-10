+++
date = '2025-09-10T15:30:00+01:00'
title = 'The Self-Inflicted Pain Ruining My Homelab'
tags = ['homelab', 'networking', 'DHCP', 'Pi-hole']
+++

The worst pains in tech are self-inflicted. Then it's bad Wi-Fi.

I've just fixed a very niche problem that was both.

<!--more-->

## Home Network

My home network's a bit unusual. The internet comes in downstairs, like the internet usually does, and I need it upstairs where my computers are. I'm renting, and the property owner doesn't want wires going up and into walls, so I have to do it wirelessly. 

WiFi is fine for most of my devices but a few of them are servers that don't have adapters. They want to be plugged in, so I share the internet between floors with a pair of [mesh routers](https://www.dlink.com/en/products/m15-3-pack-ax1500-mesh-system) and plug in the servers to the upstairs mesh device.

It all works great and I can recommend the mesh routers, although they're a bit old and have probably been superseded by now.

## Homelab

The problems started along with my homelab. 

I was creating lots of virtual machines on one of the servers that weren't being recognised by the router, so they wouldn't join the network and had no internet access. 

I couldn't get onto the admin panel of the router because it's the free one you get from the ISP and it wasn't powerful enough to keep up.

I was getting annoyed.

### DHCP

Then I found that Pi-hole, something I was already using for ad-blocking and DNS, could also [act as a DHCP server](https://discourse.pi-hole.net/t/how-do-i-use-pi-holes-built-in-dhcp-server-and-why-would-i-want-to/3026). This would undoubtedly be better than doing it on the free ISP router that couldn't keep up, so I disabled it on the router and enabled it in Pi-hole.

The way DHCP works is that something on your network needs to answer requests from clients telling them what their address is. Usually this is the router,  but it doesn't need to be.

So I set my instance of Pi-hole to handle DHCP.

And it all worked great.

Kind of.

### DHCP over mesh WiFi?

The first clue that things weren't quite right came when my devices wouldn't reconnect to WiFi. The next was when my PC wouldn't get a connection at all, until after I restarted the mesh router. 

It took a while for me to connect the dots, but something about the mesh routers was making things weird. 

If it didn't work then that was fine, I would move on. But it worked some of the time?

### Have you tried not doing that?

I spent a lot of time this week trying to diagnose the issue.

I even started preparing to replace the router.

I needn't have bothered.

Moving the server with Pi-hole on it downstairs, where it doesn't need to use the mesh routers, has fixed the issue.

Pi-hole now responds to DHCP requests and all my devices can connect to the network. 

## Summary

So if you ever have DHCP issues because your instance of Pi-hole is behind a mesh router, try not doing that and see if it fixes things.

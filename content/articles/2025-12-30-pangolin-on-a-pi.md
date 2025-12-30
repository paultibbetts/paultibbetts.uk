+++
date = '2025-12-30T15:10:00Z'
draft = false
title = 'Pangolin on a Pi'
tags = ['Homelab', 'IPv6', 'Pangolin', 'Raspberry Pi']
+++

This post is not a step-by-step guide. It's a record of what I tried and what I learned getting Pangolin to run on a Raspberry Pi with NFS storage in an IPv6-only environment.

**TLDR**: if you want to run Pangolin hassle-free, use a VPS with local SSD storage on an IPv4 network.

## Pangolin

[Pangolin](https://digpangolin.com/) is a "secure access platform" for safely exposing internal services. I'm using it to let friends and family reach a few apps in my homelab without giving them the keys to everything.

It's a free, open-source alternative to [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) for those who like independence from Cloudflare, want to self-host the stack themselves, or prefer not to rely on a third-party network for media streaming, which is not its intended use-case.

If none of those things bother you then you'll be fine using Cloudflare Tunnel or one of the alternatives. Read the terms and conditions first, media streaming is a bit of a grey area, I am not a lawyer and that wasn't legal advice.

## Alternatives

I already use [Wireguard](https://www.wireguard.com/) as a VPN, and I still use it myself to get into my home network. VPNs work, but they're not fun to manage for friends and family and I wanted the ability to lock them down to certain apps.

There's also [Tailscale](https://tailscale.com/), [Netbird](https://netbird.io/), and [ZeroTier](https://www.zerotier.com/), which use Wireguard to make a mesh network, but that's more of the same VPN solution. I'd need to set up profiles and install clients on devices, and I wanted something easier. Tailscale now has its own [Funnel](https://tailscale.com/kb/1223/funnel) project, but by the time I'd seen it I was already setting up Pangolin.

The last alternative to mention is that you can achieve a similar result by renting a server, adding it to your VPN, and setting up a reverse proxy on it. But then you'd need something else to make it secure, and you end up back at Pangolin.

## Hosting

Pangolin needs to be hosted outside your network, so I needed to rent a server. It doesn't need to be a big one, Pangolin can work with 1 vCPU and 1GB of RAM, but ideally it would be close to your internal network and the users that want to get into it.

I live in the UK, so my options were UK, Ireland or Europe. UK-based hosting turned out to be expensive, with Krystal charging [£12 per month](https://krystal.io/cloud-vps), whereas Hetzner, based in Germany, offers the same specs for [£3.97](https://www.hetzner.com/cloud).

I should have gone with Hetzner. The extra latency would likely have been ~20ms and for Pangolin's use case - web apps and media streaming - that wouldn't have been noticeable.

But at the time I wanted my server to be based in the UK, so I carried on looking, until I found [Mythic Beasts](https://www.mythic-beasts.com/). Not only had they recently [donated to the Open Rights Group](https://www.mythic-beasts.com/blog/2025/02/25/supporting-the-open-rights-group/), an organisation I also support, but they have a cluster of Raspberry Pis you can use.

My search was over. I wanted Pangolin on a Pi. I did some initial testing, and the early signs were good, so I signed up for a year.

## Raspberry Pi

The Mythic Beasts Pis come with two obstacles to running Pangolin. The first is that they are IPv6 only, and the second is the storage they use. One of these involves a little workaround and the other makes it a bad choice for hosting Pangolin.

### NFS Storage

Pangolin is actually more of a stack, with Pangolin as the control plane, Traefik doing reverse proxying, Gerbil running the tunnel and a thing called Badger to do the middleware that checks for authentication. The easiest way to run it all is with Docker Compose, and this is the first hurdle to running Pangolin on a Mythic Beasts Pi. 

The Pis only have network storage available, and Docker doesn't like that because NFS doesn't provide the kind of guarantees Docker wants from a filesystem. Docker _can_ work with NFS, but only using the `vfs` storage driver. Unlike the default `overlay2` driver, which uses a layered filesystem, `vfs` doesn't share layers, so every image consumes more space than it should.

So not only does NFS end up being slow, copying over lots of small files, it means the Docker images can't do any of the space saving that would normally happen. I have 50GB of storage and it's at 70% usage, even though the final images only take up 2GB, all because of the way `vfs` does its layering.

Did I mention that it's slow? Starting up the containers takes about 15 minutes. Turning them off isn't fast either. And upgrades? You won't have room for the new images, so you'll have to turn everything off to remove the old ones before you can start downloading the new ones. This means upgrades can take about an hour, with Pangolin down the entire time.

### IPv6

The internet's ran out of IPv4 addresses, by the way, so the Pis are IPv6 only. This means you have to do a bit of extra work to make Pangolin available for everyone.

IPv6 is the future but support for it is still mixed, so Mythic Beasts have an IPv4 to IPv6 proxy to allow users stuck on IPv4-only networks to get to your server. To use it you configure the proxy to forward requests to your domain on to the IPv6 address of the Pi.

The other end of the tunnel, the one in your home network, is managed by a service called Newt. It needs to speak to Gerbil on the Pi, and I was not successful getting it to run with the default `pangolin.example.com` address I was using.

Newt is configured by pointing it at Pangolin, which advertises the Gerbil endpoint it should connect to. Maybe it was Pangolin, or the proxy, or even something else; I could not get it to work. To make some progress I changed the `base_endpoint` in `config/config.yml`. First I tried the IPv6 address of the Pi, but that still didn't work, so I created an AAAA record for Gerbil and pointed it at the Pi. This would do the same thing as the CNAME I'd used for Pangolin, except that went through the proxy and maybe that was messing things up. This time, it worked. 

Mythic Beasts [state their proxy](https://www.mythic-beasts.com/support/topics/proxy):

> will relay traffic for common services, such as HTTP and HTTPS

and I have a suspicion that Wireguard doesn't count as a "common service".

## Home network

The final hurdle to getting this setup to work was my own network. Since the proxy doesn't seem to forward Wireguard traffic, and I have to connect directly to the Pi with IPv6, my network needs to let me do that.

This means I need at least IPv6 egress. That doesn't mean full IPv6 support everywhere, just enough to have a usable outbound path. I tried a bunch of different things to get it to work, and some of my changes actually made things worse, so what follows is what worked for me, in case your setup is similar, most likely it isn't.

### ISP router

I'm still using the router my ISP gave me, which has very basic IPv6 support. I'm with Vodafone and it's the standard "WiFi hub" they gave out several years ago. 

The right combination of buttons to press is under `Settings -> Local Network` and you want:

`IPv6` **Enabled**

`IPv6 ULA` **Disabled**

The `IPv6` toggle enables Router Advertisements (RA) from the router and this gives hosts a global IPv6 address, and also tells them what the default route for IPv6 traffic is, which is through this router.

The `IPv6 ULA` toggle disables Unique Local Addresses, which is a private IPv6 space used for hosts to speak to each other over IPv6, and is not necessary for Newt to reach Gerbil, so it can be disabled.

### Mesh router

I've also got a pair of mesh devices I use as a wireless bridge between floors, since I'm not able to run an ethernet cable.

They're definitely in bridge mode. However, in the admin panel under `Settings -> Network -> Advanced`, IPv6 was set to "Auto Configuration", meaning they were also doing SLAAC and DHCPv6. This added to the confusion, not just for myself but for my devices, so I changed that to "Local Connectivity Only" to simplify things.

### DHCP

My ISP router sucks, it even crashed when I double checked the settings I mentioned above, so I've moved DHCP off of it and instead do that with Pi-hole. It's way more stable and lets me view the admin panel without crashing.

An extra benefit of this is that when Pi-hole tells a device what its address is it will also tell them to use it as the DNS server, which makes it an automatic setup. The device now gets ad-blocking and can see the custom DNS records I've set in Pi-hole without me doing anything.

### RDNSS

Except now that my ISP router is doing IPv6, it's also doing <abbr title="Recursive DNS Server">RDNSS</abbr>, which is DNS for IPv6, and I can't turn it off. This means it does the same thing that Pi-hole is doing but for IPv6 instead of 4. Since IPv6 is the future, every device on the network now prefers going to the router for DNS, instead of Pi-hole, so they lose the ad-blocking and custom DNS records I've set.

If I had a better router that let me turn on IPv6 and either disable RDNSS, or advertise Pi-hole as the IPv6 DNS server, then this wouldn't be a problem. With my ISP router not letting me do that I could manually set every device to use Pi-hole for DNS, which is fine, unless you want to do it on Android.

### Android

Most of the mobile devices in this house run iOS, which lets you manually set the DNS server, and allows you to enter an IPv4 address, which is fine for Pi-hole. 

Android does it differently. It lets you set an IPv4 address, but if it sees RDNSS then it ignores your manual setting and uses that instead, which for me is the ISP router. So no ad-blocking or custom DNS records for Android devices. 

This means if you're in the kitchen and want to check Mealie to see the recipe for tonight's meal you have to go out over the internet to come back and reach the server in the other room.

I don't personally use Android, but as the architect of the setup it still feels bad.

### Router DNS

There is a fix, although it's not ideal, and that's to set my router's DNS to use Pi-hole. I had initially forgotten about doing this, because I thought it was already setup, but it turns out I'd turned it off for good reason.

Whilst it works, and the Android devices can now see apps in my homelab, all the traffic goes to Pi-hole through the router, so you can't distinguish where it came from. I don't really need this, but I remember now why I preferred Pi-hole handing out its own address as the DNS server.

## What I could do to improve it

This project has made me question, well a lot of things. The ability to update my RSS feeds without toggling my VPN on and off is kinda nice, and I can share limited access to my homelab with my friends and family, so for now it can stay.

Here's what would make it better:

### Use a VPS with SSD storage on an IPv4 network

This is the most obvious improvement to the setup.

The NFS storage on the Pi makes it a bad choice to run Docker Compose setups like the Pangolin stack. It works, but startup and even shutdown take too long and so upgrades have far more downtime than they should. NFS is fine for storage for the containers, but it's not suitable for running the containers themselves.

The IPv4 to IPv6 proxy that I'm using doesn't forward Wireguard traffic, so I've had to set up IPv6 in my network, which has caused some manual work I wasn't expecting.

To be clear, the Pi itself is not to blame for any of this, it's more than capable of handling the Pangolin stack. It's the fact it only has NFS storage that lets it down. The proxy not forwarding Wireguard can be worked around, and both are completely understandable tradeoffs that Mythic Beasts have made to make Raspberry PI hosting available in the first place.

The improvement would be to use a VPS, or even another Pi if I could find one, that uses fast local storage and is on an IPv4 network, or has a proxy available that also forwards Wireguard traffic.

If I hadn't already committed to a 12 month contract for the Pi I would have already done this. If I can find an alternative use for it maybe I'll move before the contract runs out. 

Until then, I'm not doing this.

### Host Pangolin without Docker

This is entirely possible, but goes against the point of using Pangolin. I wanted an easy to use system, and as soon as I start deploying each part of it myself and connecting all the parts together it's no longer simple or easy to use.

The same goes for installing Wireguard manually on the Pi and reverse proxying through it into my homelab. I've already got a Wireguard server up and running, so that's half the job already done, but then I'd need to setup something to secure access into that tunnel, and that's what Pangolin's for.

### Blue/Green deployments

NFS means the Pi takes a while to run upgrades, so there's about an hour of downtime. 

I could get around this by spinning up a second Pi, installing the upgraded software, somehow sync the configs, and then switch the DNS to point to the upgraded Pi.

This wouldn't solve any of the problems except the downtime, and it would cost me more money to do so. I'm not doing that. My friends and family will have to put up with the downtime. 

They could chip in to cover the costs, but that turns the whole thing into a business arrangement and I don't want to go down that road.

### Get a better router

This is more of a homelab quality-of-life improvement than a Pangolin-specific fix.

Getting rid of the ISP router and replacing it with something better would mean I can stop using Pi-hole for DHCP and only use it for its original intended purpose, DNS.

It only needs the ability to change the RDNSS setting to advertise Pi-hole as the DNS server to be better than my ISP router. Forwarding DNS through the router works, but advertising Pi-hole directly would preserve the per-device visibility in Pi-hole that I originally had for all devices.

This may need to happen anyway, but I wasn't looking to do this right now, so for now it isn't a priority. When I do upgrade, OpenWRT, OPNsense and pfSense would all allow me to use Pi-hole for RDNSS.

### Host my own IPv4 to IPv6 proxy

I could technically go back to IPv4 only in my network if the proxy I use to connect to the Pi also forwarded Wireguard connections. Since the current one doesn't, the only options are to setup IPv6 in my home network or host my own proxy that can.

I picked the Pi because it was the cheapest UK-based hosting I could find, and this doubles the cost, so it isn't really an option. 

Also I don't want to host a tunnel for my tunnel. That's too many tunnels.

## Would I do this again?

Absolutely not.

### Am I glad I tried it?

Yes. That's the point of a homelab.

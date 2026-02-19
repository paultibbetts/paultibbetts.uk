+++
date = '2026-02-19T17:40:37Z'
draft = false
title = 'Moved My Website From GitHub Pages to a Raspberry Pi'
tags = ['GitHub Pages', 'Raspberry Pi']
+++

My site was hosted on GitHub Pages.

It was simple and free, but it didn't really feel like it was mine.

I've fixed that with a Raspberry Pi.

<!--more-->

## Why leave GitHub Pages?

[GitHub Pages](https://docs.github.com/en/pages) is excellent at what it does. 

You upload the code for your site to GitHub and they will build and  host it for you.  
All for free. 

So why leave?

### Independence

GitHub is owned by Microsoft, one of the biggest companies on the planet. 

I have no problem with Microsoft, or using their economies of scale to do something for free that would otherwise cost me money, but ultimately I didn't feel very indie hosting my site on something I didn't control.

### Sovereignty

GitHub and Microsoft are companies based in the USA, and those of us in Europe are re-considering our dependence on US tech.

Moving has brought my website closer to home - physically, legally, and ethically.

### Portability

The work to move from GitHub Pages to _anything else_ has also made it easier to move it all again to another provider, should I ever choose to do so. 

I've taken the script to build the site out of GitHub Actions and made it part of the code itself. This decouples the site from any specific CI platform and makes both hosting and deployment replaceable.
 
## What it now runs on

There's no good reason for using a Raspberry Pi for this, I just thought it would be cool. 

It is some of the cheapest hosting I could find from a UK-based provider, but there are cheaper options and hosting in Europe works just the same and is even cheaper.

The Pi is from [Mythic Beasts](https://www.mythic-beasts.com/), a UK company based in Cambridge. It lives in London and runs on [green energy](https://www.mythic-beasts.com/article/environment).

I provision it with Terraform, which lets me write the Pi down as code, and then I configure it using Ansible, another tool that sets up the software it runs.

Ansible installs and manages Caddy, which is a web server that has been configured to serve my site.

Deployment is still handled by GitHub Actions but now it goes to the Pi instead of Pages.

From the outside it all works exactly the same, but now it's on hardware I control, with a setup that's more portable than it was before.

## Under the hood

To make this all possible I ended up writing more code than I set out to.

There wasn't a Terraform provider for Mythic Beasts, so [I wrote one](/2026/02/09/2026-02-09-151500/).

For that to work it needed a client to talk to their APIs, so [I wrote that too](/2026/02/06/2026-02-06-130000/).

And to set up Caddy using Ansible [I wrote my own role](/2026/02/03/2026-02-03-175500/). There were already others that did this but none of them did exactly what I wanted, so I made my own.

None of this was really required, I could have moved to the Pi without writing any code, but the change from a manual setup to an automated one - driven by code - has forced me to treat the infrastructure of my website as a real system, that can change and evolve over time.

## What this means

As a result my setup is now reproducible, portable and more independent. 

I can see all the parts that make up my infrastructure and swap them out for alternatives. I'm not tied down to a provider I can replace with a few lines of code.

And ultimately, there's no difference to visitors of the site, who still get the same experience as before.

## What comes next

Through doing this I can see that I might also be able to move my domain from Cloudflare to Mythic Beasts, another win for sovereignty.

If I did that, and moved the code hosting away from GitHub, I'd have a website that's fully independent.

But that's for another time.

Over the next few posts I'll go over:

- how to use the Ansible role
- making a provider for Terraform
- the code that ties it all together
- the site that explains it all in-depth

## Now

For now this post marks that this site's no longer hosted by GitHub Pages.

It's on a tiny computer, closer to home, set up by my own code.

That feels a bit more mine.
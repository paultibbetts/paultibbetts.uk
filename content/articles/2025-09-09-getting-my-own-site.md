+++
date = '2025-09-09T20:00:00+01:00'
title = 'Getting My Own Site'
tags = ['indieweb', 'meta']
+++

The second step to [getting on the IndieWeb](https://indieweb.org/Getting_Started) is to have your own site.

This is easier said than done, and there are lots of different ways of doing it.

This is what I did.

## As a web developer

There are three paths to getting your own site.

### Service

You could use an existing service like [Micro.blog](https://micro.blog/) to host your site.

I already do this for my [microblog](https://micro.paultibbetts.uk/) because it comes with a bunch of features out of the box and gets me onto the IndieWeb, even while I don't yet support all the IndieWeb features on my main site.

### CMS

An alternative path is to use an existing content management system and add on IndieWeb features with plugins. 

I've done this in the past with [WordPress](https://wordpress.org/) but I moved on from the WordPress world a while ago.

### Self-starter

I decided I was more comfortable writing and doing it myself.

## What it needs to do

Before I wrote any code I made sure to cover the basics.

### Information about me

The homepage of my site needs to include a [h-card](https://indieweb.org/h-card) with my name, an icon, and [rel-me](https://indieweb.org/rel-me) links to my social network profiles.

This is not only useful for humans but I can also use it to sign in to other sites using [IndieAuth](https://indieweb.org/IndieAuth).

I used [IndieWebify.me](https://indiewebify.me/) to check I'd done it correctly.

### Publish content

My posts should be marked up using [h-entry](https://indieweb.org/h-entry) so that others can understand my content.

The original site design had words with titles, which makes them technically "articles", although that could change in the fture.

## How the site works

There are lots of different ways to do this.

In fact there are too many, so I kept it as simple as I could.

### Static site generator

I want to write my content in [Markdown](https://www.markdownguide.org/), I would prefer doing that on my laptop instead of my phone, and I'm ok running commands to publish things.

Which means I can use a [static site generator](https://en.wikipedia.org/wiki/Static_site_generator) like [Hugo](https://gohugo.io) to turn my markdown files into HTML.

## Hosting

One of the best parts about using a static site generator is that it makes hosting simpler.

Once you have generated a static site you can upload the files to a web host and you're done.

And you can automate it, so all you do is update it and it gets deployed automatically.

### GitHub pages

I host copies of my code on GitHub so that others can view the source and I was planning on doing the same with my site.

This meant I could use one of GitHub's other features, which is [free hosting for static content](https://pages.github.com/).

All I would need to do is add a [workflow](https://github.com/paultibbetts/paultibbetts.uk/blob/a24aa42e17d0b8f059d9f12118fd69147b3fa12b/.github/workflows/hugo.yaml) for GitHub Actions to perform each time the code gets updated and the site gets deployed automatically.

## IndieMark

There's no official measure of a site's "IndieWebness" but the closest right now is the still-in-development [IndieMark](https://indieweb.org/IndieMark) which would score me a level 1.

Level 0 involves owning your own domain, something I have [written about before](https://paultibbetts.uk/2025/09/09/getting-my-own-domain/), and having a personal site at that domain.

Level 1 involves:

- **identity**, I'll be using this at my primary domain
- **authentication** using [rel-me](https://indieweb.org/rel-me) links to my external social network profiles
- **posts** with **permalinks**, **h-entry** markup and other **microformats**
- **searchable** by **allowing robots to index my site**, my **content is written in HTML** and **no JavaScript is required to read it**

## View source

You can [view the source code](https://github.com/paultibbetts/paultibbetts.uk) to see how I've abused Hugo and [TailwindCSS](https://tailwindcss.com/) into creating my own site, hosted on GitHub Pages.

+++
date = '2025-07-07T16:36:59+01:00'
title = 'Developer Environment Setup'
tags = ["dev-env", "Digital Garden"]
+++

I've pushed my developer environment setup scripts up to GitHub, and now they have their own little website to go with them.

## Dotfiles

Dotfiles are the files on your system that are hidden by default, which is done by adding a `.` in front of the name, hence "dotfiles". 

They're used for settings and preferences and between them they configure your system just the way you like it. They are arguably the most important part of a developer setup.

Lots of developers will store their dotfiles on GitHub, and [GitHub has a little site](https://dotfiles.github.io/bootstrap/) telling you why and how to do so.

But they aren't enough to setup the whole system. What use is a dotfile that tells Git I want to use a certain tool for looking at diffs if that tool isn't even installed?

So together with my dotfiles are my setup scripts. They install the tools that the dotfiles reference and then they install the dotfiles. Between them my developer environment is prepared and ready to use.

## Sharing on GitHub

I've pushed my setup scripts up to GitHub. This is both a backup, in case I lose my local copy, and also part of the installation process.

If I had to setup a new machine from scratch I can download the install script from GitHub and use it to install the rest of the scripts. The script itself pulls other files down from GitHub, so it needs to be publicly available for me to do that.

But I also did it because I learnt so much about setting up my developer environment from other people sharing their setups and I wanted to do the same.

Usually it's just the code itself that's shared, since most devs will skip the readme and go straight to the code, but I added a little website as an experiment.

## Digital Garden

The main reason I created a website for my scripts was to test out [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/) for creating documentation sites. It was pretty easy, and I liked the result, so I will most likely use them for something like this again in the future.

The other reason was to plant a seed in my digital garden.

Digital gardens are a bit like blogs, except they aren't usually sorted by date. They're more like notebooks that you share publicly. You might even go back to your notes and refine them over time, growing them from seedlings to full blown... idea bushes? I don't know what to call them. Some people call them trees, which can grow fruit. That sounds good. Let's go with that.

So the site is a seedbed in my digital garden. It's a place for me to share my notes on developer environment setups and dotfiles and stuff. It's not a project I want other people to use, in fact I'll probably write up what the alternatives are and which one you should pick instead of mine.

## Seedling <span aria-hidden="true">🌱</span>

If you're curious you can [check it out](https://dev.paultibbetts.uk/).

It's just a seedling right now, but who knows, maybe I can grow it into something fruitful.

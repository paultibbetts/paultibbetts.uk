+++
date = '2026-03-17T23:30:00Z'
draft = false
title = "Added support for photos and videos"
tags = ['meta']
+++

Three days after posting [Changes to the Site](/2026/03/14/changes-to-the-site/) and it's already out of date.

I wrote that I was going to optimise my photos so they would be smaller and I could include them in my posts, since that's all I was planning to do.

Then I realised I _needed_ a video in my post. If you've read [Museum memories](/2026/03/17/museum-memories) you'll know why.

<!--more-->

## The problem

My website is powered by Hugo, a static site generator that takes an input, like my markdown files where I write my posts, and outputs a website.

I store both my site code and content in Git, which also drives my deployment process: every change triggers a new build and deploy.

This is where it gets tricky with media files.

### Photos

To include my own photos in a blog post I need to host them. I can do that in Hugo, but I would need to save the photos with Git so it's part of the site and the deployment process. The problem with this is photos can be quite large, so they bloat the Git repository.

This isn't really a problem with one blog post with a few photos, but it does become a problem when you do it over and over for many years.

I don't know if I'll be posting lots of photos, or doing it for many years, but I don't like the idea of one day having a scaling problem, I'd rather fix it now.

### Videos

Videos are even more of a problem. They're much bigger than photos, and they don't compress down as effectively.

A 7 MB photo can compress down to 200 KB, which might be tolerable in a Git repo.

A 15 second video might be 30 MB and only compress down to 15 MB.

## A solution

Instead of keeping my photos and videos inside the Git repo I am moving towards separate media hosting for them. I wanted to publish [my photo post](/2026/03/17/museum-memories/) before fully solving media hosting, so I'm using a temporary solution for now.

I have made a directory on my server and uploaded the videos there. I then changed my web server to serve the files in this directory at `https://paultibbetts.uk/media/` and updated my post to use this URL for videos.

You can see the change in infrastructure code [on GitHub](https://github.com/paultibbetts/infra.paultibbetts.uk/commit/72240f724e786a189c2138d73a643c3b2ae4b4d9).

## It's Temporary™

My web server has 50 GB of storage so there is a limit to how many photos and videos I can upload. This type of storage is relatively expensive and it's awkward changing the setup.

A better solution for media hosting would be a storage bucket and a Content Delivery Network to serve the files, as mentioned in [Changes to the Site](/2026/03/14/changes-to-the-site/).

I don't know when that's happening.

+++
date = '2026-03-01T11:36:03Z'
draft = false
title = 'Ways to make your feed followable'
tags = ['indieweb']
+++

You've got 3 posts on your site and you want people to be notified about new ones.

Here's all the ways I can think of doing that.

<!--more-->

## Email

Some sites let you send out your posts as emails.

Don't do it. It can be tempting, because it's easy, but emails are for emails. 

There are better options for your feed.

## RSS

RSS stands for "Really Simple Syndication". 

It's a standard format for publishing a feed so apps can subscribe to your updates.

Feed readers and podcast apps use it.

It looks a bit like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS Example Site</title>
    <link>https://example.com/</link>
    <description>Example site description.</description>

    <item>
      <title>Hello, World!</title>
      <link>https://example.com/hello-world.html</link>
      <description>My first post.</description>
    </item>

  </channel>
</rss>
```

You would host a file like this, link to it from the `<head>` part of your pages, and readers would check it occasionally for updates.

Its simplicity means it's supported by almost all feed reading apps.

Because of this I'd say RSS is the best starting point for letting users subscribe to your posts and is worth adding to your site first, before the other alternatives.

## Atom

RSS isn't the only way to create an XML feed. Atom is another standard which is more formally specified.

In the early 2000's, after Atom's launch, there was a time called the "RSS vs Atom wars". There was no real winner. Atom was decided to be technically better, but by then RSS had already become dominant. 

These days you can add a few Atom elements to your RSS feed, like a `rel=self` link, to get the best of both worlds.

## JSON

[JSON feed](https://www.jsonfeed.org/) is the one of the newer standards. It works in the same way as RSS and Atom but the data is presented as JSON instead of XML.

Web development has moved on from XML and these days JSON-based things are much more common. The idea is that by using JSON we allow developers to build new things like feed readers using modern techniques and tooling, instead of ones used only for legacy publishing steps like an XML-based feed.

It looks a bit like this:

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "Example JSON Feed Site",
  "home_page_url": "https://example.com/",
  "feed_url": "https://example.com/feed.json",
  "items": [
    {
      "id": "2026-02-28-153000",
      "url": "https://paultibbetts.uk/notes/2026-02-28-153000/",
      "content_html": "<p>Hello world</p>",
      "date_published": "2026-02-28T15:30:00Z"
    }
  ]
}
```

JSON feed is already supported by many feed readers and, at least in theory, makes it easier than XML-based feeds to make new ones.

I'd say it's worth adding to your site after you've got an RSS feed, since those are more universally supported right now.

## Microformats

[Microformats](https://indieweb.org/microformats) is a standard for marking up the contents of your posts, and in doing so makes your feed followable without any other files.

Classes like `h-entry` and `h-card` help others to understand the content you're publishing, and the `h-feed` class is used to identify feeds. This means readers using apps that understand microformats can subscribe to your content directly, without needing an XML or JSON file.

Right now most feed readers expect RSS or Atom feeds, so whilst I would suggest adding microformats, I would do it after adding an RSS feed.

## Social media

There's also social media, where you would post a link to your content on another site, like Facebook or Instagram.

It's a great way to get your posts in front of users across the web on the apps they're already using, but it's no longer on your own site and you're now at the mercy of whatever the algorithms think of your content.

I'd consider doing this as an extra, and only after making your own feed available.

For more information on posting out to social media the IndieWeb.org wiki has a great page called [Publish Own Site, Syndicate Elsewhere (POSSE)](https://indieweb.org/POSSE).

## ActivityPub

Another option is to use the ActivityPub protocol for your content. 

ActivityPub is what powers Fediverse apps like Mastodon and making your content available through it makes your site part of the Fediverse itself. Readers can then subscribe using whatever Fediverse app they want.

This involves a lot of work, and is difficult to implement for static sites, so hosted solutions like [Bridgy Fed](https://fed.brid.gy/) can be used to do this for you.

## All of the above

The best option could even be to do all of the above, to give your readers freedom to choose the method that works for them.

If you want the most compatible way to let others follow your posts: start with RSS.

Then add alternatives after.


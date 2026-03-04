+++
date = '2026-03-01T16:33:46Z'
draft = false
title = 'How to create an RSS Feed'
tags = ['indieweb', 'RSS']
+++

In my last post I recommended starting with RSS to make your site followable.

This is how to do that.

<!--more-->

## You might already have one

If you're using a static site generator like Hugo, or a CMS like WordPress, then you might already have an RSS feed.

If not, and you're writing your site manually, or just want to understand what's going on, here's what an RSS feed looks like.

## A minimal RSS feed

At a minimum an RSS feed contains:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Example Blog</title>
    <link>https://example.com/</link>
    <description>Updates from my blog.</description>

    <item>
      <title>Hello World</title>
      <link>https://example.com/hello-world</link>
      <description>My first post.</description>
    </item>

  </channel>
</rss>
```

### Required

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

This line declares the XML version of the file and the encoding that it uses. `UTF-8` supports text and emoji.

It's strongly recommended to include this line so the file is read correctly.

```xml
<rss version="2.0">
```

This is the start of the `<rss>` element. The `version="2.0"` tells consumers that the feed conforms to the RSS 2.0 specification, the most widely supported version.

```xml
<channel>
  <title>Example Blog</title>
  <link>https://example.com/</link>
  <description>Updates from my blog.</description>
```

The `<channel>` declares the feed itself, so `<title>`, `<link>` and `<description>` are used to describe the feed and its contents.

These details should match what's displayed on your site and will show up for users when adding or managing your feed in their reader.

The `<link>` should point to the URL of the `<channel>`, which is the site itself.

```xml
<item>
  <title>Hello World</title>
  <link>https://example.com/hello-world</link>
  <description>My first post.</description>
</item>
```

The `<item>` tag is used for each post in the feed.

An `<item>` **must** contain at least one of:

- `<title>`
- `<description>`

which means you could do:

```xml
<item>
  <title>My first post</title>
</item>
```

which is valid, but not very useful, or:

```xml
<item>
  <description>Hello, World!</description>
</item>
```

which is also valid, and slightly more useful, if only for microblogs and notes and other posts without a title.

```xml
<item>
  <title>An example</title>
  <link>https://example.com/posts/1</link>
</item>
```

Title + link is more practical, and may be all you need, but:

```xml
<item>
  <title>An example</title>
  <link>https://example.com/posts/1</link>
  <description>Hello, World!</description>
</item>
```

using all three is most common.

You could use the `<description>` for the summary of your post or for the whole thing.

There's no upper limit on the amount of `<item>`s you can include in a feed, but there are some practical things to consider:

- RSS does not do pagination
- - everything is listed in one file
- if the file gets really big then it takes longer to download
- - aim to keep it under 500KB
- maybe only show your latest posts if you have lots of them

### Optional

The fields mentioned above are all that is required for a minimal feed, but there are some optional extras that are recommended.

```xml
<item>
  ...
  <guid isPermaLink="true">
    https://example.com/posts/1
  </guid>
</item>
```

A `guid`, for "Globally Unique IDentifier", gives each item in the feed a stable identity. This means feed readers can detect and remove duplicates correctly.

This is usually the permalink of the post. If so, `isPermaLink` defaults to true and can be omitted, however it it's not the permalink, like a database ID, or the exact datetime the post was published, you would change `isPermaLink` to `false`.

Note that the `L` in `PermaLink` is also capitalised.

```xml
<item>
  ...
  <pubDate>Sun, 1 Mar 2026 14:00:00 GMT</pubDate>
</item>
```

The `<pubDate>` is used to show when an item in the feed was published. It can help feed readers understand the order of your posts and should be added.

```xml
<rss version="2.0"
xmlns:atom="http://www.w3.org/2005/Atom">
```

Changing the `<rss>` tag to include `xmlns:atom="http://www.w3.org/2005/Atom"` is also optional but recommended.

This tells whatever is reading the feed that anything defined with `atom:` comes from the Atom specification, and lets you use extra tags defined by the Atom spec.

This isn't useful by itself, but it is used when you also add:

```xml
<atom:link
href="https://example.com/index.xml"
rel="self"
type="application/rss+xml" />
```

which defines the URL of the feed and helps feed readers know the canonical URL of the feed itself, which helps prevent duplicate subscriptions.

```xml
<lastBuildDate>Sun, 1 Mar 2026 14:00:00 GMT</lastBuildDate>
```

The `<lastBuildDate>` can be used by feed readers to know if the feed has changed.

Set it to the date of the most recent post.

```xml
<language>en-gb</language>
```

You should declare the language of the feed. It's small, but it's technically correct.

## Things to remember

RSS is pretty simple but dealing with XML means you have to remember a few things.

### XML must be well-formed

Writing an RSS feed is still writing XML, and so it must obey the rules of an XML file.

This means the file must not have any missing closing tags, or mix ups with the order in which you close them.

It also means you must handle special characters, otherwise the file is invalid and won't be understood.

For example:

```xml
<title>Special & Character</title>
```

won't work, because of the `&`, which must be escaped:

```xml
<title>Special &amp; Character</title>
```

#### No unescaped HTML in the description

The same happens with the `<description>` tag, which usually holds the summary or the contents of the post, and must not include unescaped HTML characters.

The first option is to escape all of the HTML in the description:

```xml
<description>&lt;p&gt;Hello, World!&lt;/p&gt;</description>
```

or the more common option is to wrap the HTML content in the description in a `CDATA` tag:

```xml
<description><![CDATA[
<p>Hello, World!</p>
]]></description>
```

where CDATA tells whatever is reading the XML file that everything inside this is raw text.

#### Dates must be written as RFC 822

If you do use `<pubDate>` or `<lastBuildDate>` to show dates you must ensure they are written using the [RFC 822 format](https://www.w3.org/Protocols/rfc822/#z28):

```xml
<pubDate>Sun, 1 Mar 2026 14:00:00 GMT</pubDate>
```

### Serve the file with the correct Content-Type

When your server responds to a request to show the feed it should send:

```
Content-Type: application/rss+xml
```

so that feed readers recognise it as an RSS feed.

Most static web hosting handles this for you, I only mention it in case you are setting up a server and are messing with the Content-Type of the files you serve.

## How to check your feed

There are a few ways to check you've written your feed correctly.

### Open it in a browser

The file should open and look similar to what you wrote it as. If it doesn't open, there's a problem, and if it shows an error then you need to fix it.

### Use a validator

You can use [validator.w3.org/feed](https://validator.w3.org/feed/) to validate your feed. It can work with the URL of your feed online or you can paste in its contents if you're still working on it.

### Add it to your reader

The best test is to add your own feed to your reader and check it looks the way you want.

Make sure it's showing in the order you expect and you can edit posts without making duplicates in your reader.

## Full example

Here is a condensed version of my own RSS feed, containing two articles and a note.

The note doesn't have a `<title>`, which influenced the URL used for its `<guid>`.

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<rss version="2.0"
	xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>Paul Tibbetts</title>
		<link>https://paultibbetts.uk/</link>
		<description>Recent posts by Paul Tibbetts</description>
		<generator>Hugo</generator>
		<language>en-gb</language>
		<lastBuildDate>Sun, 01 Mar 2026 12:41:46 +0000</lastBuildDate>
		<atom:link href="https://paultibbetts.uk/feed.xml" rel="self" type="application/rss+xml" />
		<item>
			<title>How to create an RSS Feed</title>
			<link>https://paultibbetts.uk/2026/03/01/how-to-create-an-rss-feed/</link>
			<pubDate>Sun, 01 Mar 2026 16:33:46 +0000</pubDate>
			<guid>https://paultibbetts.uk/2026/03/01/how-to-create-an-rss-feed/</guid>
			<description>In my last post I recommended starting with RSS to make your site followable. This is how to do that.</description>
		</item>
		<item>
			<title>Ways to make your feed followable</title>
			<link>https://paultibbetts.uk/2026/03/01/ways-to-make-your-feed-followable/</link>
			<pubDate>Sun, 01 Mar 2026 11:36:03 +0000</pubDate>
			<guid>https://paultibbetts.uk/2026/03/01/ways-to-make-your-feed-followable/</guid>
			<description>You’ve got 3 posts on your site and you want people to be notified about new ones. Here’s all the ways I can think of doing that.</description>
			</item>
		<item>
			<title>2026-02-15 14:54:58</title>
			<link>https://paultibbetts.uk/2026/02/15/2026-02-15-145458/</link>
			<pubDate>Sun, 15 Feb 2026 14:54:58 +0000</pubDate>
			<guid>https://paultibbetts.uk/2026/02/15/2026-02-15-145458/</guid>
			<description>Launched: infra.paultibbetts.uk A documentation site for the infrastructure that runs paultibbetts.uk.</description>
		</item>
	</channel>
</rss>
```

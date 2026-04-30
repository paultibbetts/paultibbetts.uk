+++
date = '2026-04-30T16:46:04+01:00'
title = 'Turning a page into a feed'
summary = 'Why and how I added a feed to my indie web directories directory.'
tags = ['IndieWebCamp', 'RSS']
+++

During a session on feeds at [IndieWebCamp Düsseldorf](https://events.indieweb.org/2026/04/-indiewebcamp-d%C3%BCsseldorf-ewHCZehNA3gg) a question came up: how do you signal updates to a page?

For pages that are really just lists you can treat them like posts on a blog.

My [directory of indie web directories](/indieweb-directories) is one of those, it's a collection of links that grows over time.

Since my site is built with Hugo, I:

- changed the page into a [section](https://gohugo.io/content-management/sections/)
- made a file for each entry

and Hugo made a feed for it.

The only tweak it needed was in the RSS template, so that for this new section the `<item><link>` would point to the directory instead of my own site, which for me looked a bit like:

```go
{{- $itemLink := .Permalink -}}
{{- if eq .Section "indieweb-directories" -}}
	{{- with .Params.link -}}
		{{- $itemLink = . -}}
	{{- end -}}
{{- end -}}
```
```xml
<item>
  <title>{{ .Title }}</title>
  <link>{{ $itemLink }}</link>
```

This works well for pages where updates are incremental additions, such as changelogs or collections.

It works less well for pages that are edited in place. You'd need to post what changed, which means keeping a history of revisions - something wikis do by publishing diffs.

Those updates can be harder to read, and while you could do it with Hugo, you'd have to write them manually. There's no built-in way of creating them.

In my case it works, not because I've solved how to signal updates to a page, but because it turns out my page wasn't even a page in the first place.


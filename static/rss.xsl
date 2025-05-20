<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en" class="bg-night">
      <head>
        <title>
          RSS Feed | <xsl:value-of select="/rss/channel/title"/>
        </title>
        <link rel="stylesheet" href="/css/main.css"/>
      </head>
      <body>
        <div class="alert-box red">
        <p class="text-sm">
          This is an RSS feed. Visit
          <a href="https://aboutfeeds.com">About Feeds</a>
          to learn more and get started.
        </p>
          </div>
        <h1 class="mb-2 text-lg lowercase">Recent posts</h1>
        <xsl:for-each select="/rss/channel/item">
          <article class="mb-4">
            <h2>
              <a class="mb-2 inline-block">
                <xsl:attribute name="href">
                  <xsl:value-of select="link"/>
                </xsl:attribute>
                <xsl:value-of select="title"/>
              </a>
            </h2>
            <p class="prose prose-invert"><xsl:value-of select="description"/></p>
            <p class="mb-2"><small>Published: <xsl:value-of select="pubDate"/></small></p>
          </article>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

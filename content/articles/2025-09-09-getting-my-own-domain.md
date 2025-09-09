+++
date = '2025-09-09T15:53:46+01:00'
title = 'Getting My Own Domain'
tags = ['indieweb', 'meta']
+++

The first step to [getting on the IndieWeb](https://indieweb.org/Getting_Started) is to have your own domain. 


This is an easy step for me because I've already got one, so I thought I'd explain how I got it.


<!--more-->


## Ruler

Years ago I registered my name as my domain.


I'm not a company, so I didn't want `.com`, but there weren't many options, and so to make me "Paul Tibbetts from the UK" I went with `.co.uk`.


Some time later `.uk` was made available and to make it fair to the `.co.uk` owners who wanted to drop the `.co` you had to also own the `.co.uk` version to register it, so for a while I owned both.


This was all before the newer extensions like `.blog` and `.dev` came out. When they did I considered changing but decided against it.


## Registrar


I registered my domain with [Heart Internet](https://www.heartinternet.uk/) because that's who we used at work and I didn't have any kind of preference. 


They don't expose my personal data when you run a [whois query on the domain](https://www.whois.com/whois/paultibbetts.uk) so I haven't found a reason to move away from them. 


Renewals are £9.99 per year.


## Management


For a while I managed the domain using the interface on Heart Internet but since then I've moved it to [Cloudflare](https://www.cloudflare.com/).


To do this I changed the nameservers that the domain uses from Heart Internet's to Cloudflare's.


## Records


There aren't that many records right now.


### @


The apex domain, as in the bare one without any subdomains (`https://paultibbetts.uk`), points to a really small landing page I made for myself. 


I'll be redoing this soon so I won't talk about it yet.


### www


I **don't** use the `www` subdomain. 


I know there are people who think this is wrong but growing up sharing links with others the moment I discovered you could get rid of it I did and haven't looked back.


Maybe one day I will revisit this.


### micro


`micro.paultibbetts.uk` is powered by [Micro.blog](https://micro.blog). 


I _could_ run my main domain with Micro.blog but I want to have a go at doing that myself.


I followed [the Micro.blog guide to set up a custom domain](https://help.micro.blog/t/custom-domain-names/53) and used a `CNAME` on my domain to point `micro` to `https://paultibbetts.micro.blog`.


## Emails


Once upon a time I hosted my own email server.


The company I worked at, Sixth Story, had an email address `iwanttowork @ sixthstory` that I thought was clever, so I wanted `hire @ paultibbetts` for myself. Applying for jobs as a web developer I thought it would help me stand out.


Even after all the work though I still found myself using my regular Apple email address because I knew it was more stable, and less likely to get marked as spam, so when Apple announced [you can use custom domains with iCloud mail](https://support.apple.com/en-us/102540) I got rid of my email server and used Apple's instead.


This means I have some `MX` and `TXT` records to allow that to work.


## In review


I have always been jealous of others with better domains than me.


### Difficult to spell


I have trouble getting people to spell my surname correctly. 


I don't blame them, there's lots of Bs and Ts, and saying "technically there's 3 Ts" isn't helpful when they're typing the double T towards the end.


#### Potential fix


Aral's `ar.al` domain is much better than mine. It's short and easy to spell.


Maybe I could find a short domain and set it up to redirect?


Time for another disappointing trip to [IWantMyName](https://iwantmyname.com/) to see all the good domains have been taken.


### Did you mean the other one?


I share a name with someone way more famous than me. 


It's spelt a little different but search engines will assume you meant the other Paul.


#### Potential fix


There are a few ways I can improve my search engine rankings.


I'm going to try writing lots of content to go on my domain, hoping that does it.


I will **not** do what the other guy did.


### dot UK


My `.uk` address works whilst I live here but it wouldn't if I moved.


#### Potential fix


I don't have any immediate plans to move abroad so I'm not too concerned with this. 


If I ever did I can setup redirects.


### Not a cool internet name


Jeremy Keith's `adactio.com` domain regularly reminds me I'm not creative enough to come up with a cool internet name.


#### Potential fix


Maybe another decade of thinking about it will help.

## Reposted

This was originally posted on my <a class="u-repost-of" href="https://micro.paultibbetts.uk/2025/01/02/getting-my-own-domain.html">microblog</a> before this site existed and I wanted a copy of it here.

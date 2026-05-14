---
title: NGINX Caching for nextjs app
date: 2020/6/22
description: A Guide to use NGINX as a cache server for static assets
author: You
---

NGINX Caching for nextjs app
============================

![Nginx caching seen in browser developer tool](https://miro.medium.com/max/1400/1*06opjo5S4OoiKzTn4WHQBQ.png)**NGINX caching header indicating Cache HIT**

NGINX can act as a cache server — what this means is that NGINX can cache content received from other servers.

Since NGINX can proxy requests to other web servers , it’s commonly used to increase performance for serving static files while proxying application requests to other processes.

The main benefit of a cache server is that we put less load on our application servers. Requests for static or dynamic assets that are cached need not even reach the application (or static content) servers — our cache server can handle many requests all by itself!

Let’s combine a nextjs Application with NGINX caching.

We can leverage caching for two types of files.

1.  js and css files under `_next/static/*`
2.  Images , fonts etc under `public/`

First we will define Caching zone in NGINX which is nothing but in memory cache in NGINX

```
proxy\_cache\_path /var/cache/nginx levels=1:2 keys\_zone=STATIC:10m inactive=7d use\_temp\_path=off;
```

The options we have used here are as follows:

*   `/var/cache/nginx` sets a directory to store the cached assets
*   `levels=1:2` sets up a two‑level directory hierarchy as file access speed can be reduced when too many files are in a single directory
*   `keys_zone=STATIC:10m` defines a shared memory zone for cache keys named “STATIC” and with a size limit of 10MB (which should be more than enough unless you have thousands of files)
*   `inactive=7d` is the time that items will remain cached without being accessed (7 days), after which they will be removed
*   `use_temp_path=off` tells NGINX to write files directly to the cache directory and avoid unnecessary copying of data to a temporary storage area first

```
\# We tell NGINX to use our cache zone that we called STATIC to cache any file whose path contains the /\_next/static directorylocation /\_next/static {  
  proxy\_cache STATIC;  
  proxy\_pass http://nextjs\_upstream;;  
  add\_header X-Cache-Status $upstream\_cache\_status;  
}
```

We’ve added a custom header, X-Cache-Status, with the value set to $upstream\_cache\_status. It will tell if Cache is HIT or MISS at NGINX level.

Next up are the static assets, such as images, fonts…, that we place in the public/ directory and Next.js makes available at the path /\*.

```
location ~\* ^/.\*\\\\.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|ttf)$ {  
  proxy\_cache STATIC;  
  proxy\_ignore\_headers Cache-Control;  
  proxy\_ignore\_headers Set-Cookie;  
  proxy\_cache\_valid 60m;  
  proxy\_pass $onboardingUrl;  
  add\_header X-Cache-Status $upstream\_cache\_status;  
}
```

Next.js handles setting headers for browser caching. The static assets in the public/ directory has no build ID. They are just made available at the /\* path unchanged. Therefore, Next.js sets no-cache headers for these assets so the browser never caches them. If the assets change, the url remains the same so we don’t want our users to have out-of-date assets. The problem is that NGINX respects these headers and, therefore, will not actually cache these files by default. We can get around this by telling NGINX to ignore the Cache-Control headers from our proxied Next.js app.

Also if response headers have `Set-Cookie`, the `proxy_cache` is ignored. So We need to ignore that as well.

Our Next.js app will only be hit at most once an hour for each /public/\* asset.

Final NGINX conf will look like this

```
proxy\_cache\_path /var/cache/nginx levels=1:2 keys\_zone=STATIC:10m inactive=7d use\_temp\_path=off;  
  
upstream nextjs\_upstream {  
  server nextjs:3000;  
}  
  
server {  
  listen 80 default\_server;  
  
  server\_name \_;  
  
  server\_tokens off;  
  
  gzip on;  
  gzip\_proxied any;  
  gzip\_comp\_level 4;  
  gzip\_types text/css application/javascript image/svg+xml;  
  
  proxy\_http\_version 1.1;  
  proxy\_set\_header Upgrade $http\_upgrade;  
  proxy\_set\_header Connection 'upgrade';  
  proxy\_set\_header Host $host;  
  proxy\_cache\_bypass $http\_upgrade;  
  
  location /\_next/static {  
    proxy\_cache STATIC;  
    proxy\_pass http://nextjs\_upstream;  
  
    # For testing cache - remove before deploying to production  
    add\_header X-Cache-Status $upstream\_cache\_status;  
  }  
  
  location ~\* ^/.\*\\\\.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|ttf)$ {  
    proxy\_cache STATIC;  
    proxy\_ignore\_headers Cache-Control;  
    proxy\_cache\_valid 60m;  
    proxy\_pass http://nextjs\_upstream;  
  
    # For testing cache - remove before deploying to production  
    add\_header X-Cache-Status $upstream\_cache\_status;  
  }  
  
  location / {  
    proxy\_pass http://nextjs\_upstream;  
  }  
}
```

Testing NGINX caching
=====================

Let’s test that our NGINX cache is working by making use of that `X-Cache-Status` header that we added earlier.

In the developer tools, open the **Network** tab and click on one of the requests for a file with the path `/_next/static/*` or `/*.(css|svg|png|ico)` .

You will see the `X-Cache-Status` header. Its value should be **MISS** the first time you load the site. This is because the cache is empty the first time.

If you refresh the page (ensure that browser cache is disabled or cleared) then you should see that this time the `X-Cache-Status` header has a value of **HIT**, signalling that NGINX served the file from cache.

You can test using this repo. [https://github.com/eeshdarthvader/nextjs-nginx-caching](https://github.com/eeshdarthvader/nextjs-nginx-caching)
----------------------------------------------------------------------------------------------------------------------------------------------

```
npm installdocker-compose build  
docker-compose up
```

We can now go to [http://localhost](http://localhost) in a browser (no port as 80 is default for HTTP)

The docker compose file has following instructions

```
version: '3'  
services:  
  nextjs:  
    build: ./  
  nginx:  
    build: ./nginx
```

This builds two images, one for nginx and one for nextjs app.

Then it connects nextjs app running at [localhost:3000](<http://localhost:3000>) internally to nginx expose at port 80 (`localhost`)

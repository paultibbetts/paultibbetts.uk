# paultibbetts.uk

My personal website.

Powered by [Hugo](https://gohugo.io), hosted on [a Raspberry Pi](https://infra.paultibbetts.uk/), styled by a custom theme that uses [TailwindCSS](https://tailwindcss.com/).

## Media commands

The `media:*` scripts load settings from `.env` automatically if it exists.

Copy `.env.example` to `.env` and set:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PORT`
- `SSH_KEY_PATH`
- `SSH_KNOWN_HOSTS_PATH`
- `MEDIA_REMOTE_ROOT`
- `MEDIA_PUBLIC_ROOT`

For day-to-day use there are wrapper commands in `bin/`:

- `./bin/media/dry-run <post-path>`
- `./bin/media/publish <post-path>`
- `./bin/new/article "Title"`
- `./bin/new/note ["Optional title"]`
- `./bin/new/reply ...`

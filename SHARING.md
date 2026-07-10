# Sharing SketchRef with remote friends

Your app already runs 24/7 on your PC via pm2 (see README). That covers
*uptime*. This covers making it *reachable from outside your home network*,
so friends in other locations can open a URL and use it.

Each person gets their own progress automatically now — the app asks for a
name the first time you open it in a browser, and tracks "done" separately
per person while everyone shares the same picture library. See
`ARCHITECTURE.md` for how that works under the hood.

## Recommended: Cloudflare Tunnel (free, no router changes)

This creates a public URL that forwards to your PC's `localhost:4000`,
without opening any ports on your router. It runs alongside pm2.

**1. Install `cloudflared`:**
Download the Windows installer from
https://github.com/cloudflare/cloudflared/releases (get the `.msi` file),
or install via `winget install --id Cloudflare.cloudflared`.

**2. Quick, no-account option (URL changes each time you restart it):**

```powershell
cloudflared tunnel --url http://localhost:4000
```

This prints a `https://<random-name>.trycloudflare.com` URL — share that
with friends. Good for trying it out today.

**3. Persistent option (same URL every time — needs a free Cloudflare
account and a domain, e.g. bought cheaply or a free one from Freenom-style
registrars, or a subdomain if you already own one):**

```powershell
cloudflared tunnel login
cloudflared tunnel create sketchref
cloudflared tunnel route dns sketchref sketch.yourdomain.com
```

Then create `C:\Users\<you>\.cloudflared\config.yml`:

```yaml
tunnel: sketchref
credentials-file: C:\Users\<you>\.cloudflared\<tunnel-id>.json
ingress:
  - hostname: sketch.yourdomain.com
    service: http://localhost:4000
  - service: http_status:404
```

Run it with `cloudflared tunnel run sketchref`, or install it as a Windows
service so it starts automatically:

```powershell
cloudflared service install
```

**4. Keep it running long-term:** put the quick command (step 2) into a
pm2 process too, so it restarts with everything else:

```powershell
pm2 start cloudflared --name tunnel -- tunnel --url http://localhost:4000
pm2 save
```

## Alternative: deploy to a cloud host instead of your own PC

If you'd rather not keep your own PC on all the time, you'd move the app
to a small always-on server (e.g. Railway, Render, Fly.io — all have free
or cheap tiers). The catch: this app stores uploaded images as files on
disk, so the host needs a **persistent volume/disk**, not just ephemeral
storage, or your uploads will vanish on redeploy. This is a bigger step
(accounts, billing, deployment config) — ask if you want to go this route
and I'll set it up.

## A few things worth knowing before sharing publicly

- **Anyone with the URL can use the app** — there's no login/password
  protecting it, just the per-person name for tracking progress. Fine for
  a small group of friends who won't share the link further; not suitable
  if you want to restrict who can add/remove pictures.
- **Everyone shares one picture library.** Anyone can add or remove
  pictures for everyone. If you want friends to only track progress
  without being able to delete each other's uploads, that's a further
  permissions feature — let me know if you'd like that added.
- Your home internet upload speed is the bottleneck for how fast images
  load for friends, since your PC is the server.

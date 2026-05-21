# Deploy — Raspberry Pi + k3s + Cloudflare Tunnel

This deploys `duhyunkim.page` to a single-node k3s cluster on a Raspberry Pi,
exposed through a Cloudflare Tunnel (no open ports, no public IP needed).

## 0. Pi prerequisites

- Raspberry Pi 4/5, **4GB+ RAM**, 64-bit OS (Raspberry Pi OS Lite 64-bit or Ubuntu Server arm64).
- **Boot from a USB SSD, not an SD card.** k3s + SQLite writes wear SD cards out fast.
- Docker installed (used to build the image): `curl -fsSL https://get.docker.com | sh`

## 1. Install k3s

```sh
curl -sfL https://get.k3s.io | sh -
# kubectl is bundled as `k3s kubectl`; check the node is Ready:
sudo k3s kubectl get nodes
```

## 2. Get the source onto the Pi

```sh
git clone <repo-url> duhyunkim-page && cd duhyunkim-page
# (or rsync from your Mac)
```

## 3. Build the image and import it into k3s

k3s uses its own containerd, so the locally built image must be imported into it.

```sh
docker build -t duhyunkim-page:latest .
docker save duhyunkim-page:latest | sudo k3s ctr -n k8s.io images import -
# verify:
sudo k3s ctr -n k8s.io images ls | grep duhyunkim-page
```

## 4. Create the Cloudflare Tunnel

1. Cloudflare dashboard → **Zero Trust → Networks → Tunnels → Create a tunnel** (Cloudflared type).
2. Name it (e.g. `pi-blog`). Copy the **tunnel token**.
3. Under **Public Hostnames**, add:
   - Subdomain: *(blank)* · Domain: `duhyunkim.page`
   - Service: `HTTP` → `blog.blog.svc.cluster.local:80`
   - (Optional) add `www` the same way.

Store the token as a secret:

```sh
sudo k3s kubectl create namespace blog
sudo k3s kubectl -n blog create secret generic cloudflared-token \
  --from-literal=token=<TUNNEL_TOKEN>
```

## 5. Apply manifests

```sh
sudo k3s kubectl apply -f k8s/namespace.yaml
sudo k3s kubectl apply -f k8s/deployment.yaml
sudo k3s kubectl apply -f k8s/cloudflared.yaml

sudo k3s kubectl -n blog get pods -w
```

Once both pods are `Running`, `https://duhyunkim.page` is live.

## 6. Redeploy after changes

```sh
docker build -t duhyunkim-page:latest .
docker save duhyunkim-page:latest | sudo k3s ctr -n k8s.io images import -
sudo k3s kubectl -n blog rollout restart deployment/blog
```

## Notes / next phases

- **Content** is baked into the image at build time from `content/*.md`. To publish
  a new post: add a markdown file, rebuild, redeploy. (The Tiptap editor + writable
  DB come in a later phase — that's when a PersistentVolume + Litestream backup to R2
  get added.)
- **`/admin`** doesn't exist yet. When it does, gate it with **Cloudflare Access**
  (Zero Trust → Access → Applications) so only you can reach the editor.

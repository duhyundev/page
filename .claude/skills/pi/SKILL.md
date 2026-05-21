---
name: pi
description: Connect to and operate the duhyunkim.page Raspberry Pi homelab (k3s cluster) over Tailscale SSH. Use when SSHing to the Pi, running kubectl/k3s commands, checking ArgoCD, debugging the cluster, or operating/deploying this project's infra.
---

# Pi 홈랩 접속 & 운영 — duhyunkim.page

Pi는 `duhyunkim.page`를 호스팅하는 k3s 클러스터를 돌린다. **헤드리스이고 Tailscale로만 접근 가능**하다 (집 ISP가 Mac과 Pi에 *서로 다른 공인 /24*를 줘서 같은 LAN이 아니고, 직접 SSH·mDNS가 안 됨). 배경: `docs/infra-network-tailscale.md`, 아키텍처·부트스트랩은 `CLAUDE.md`.

## 접속 (Tailscale SSH)
```sh
ssh duhyunkim@100.91.78.61        # 고정 tailnet IP. MagicDNS 이름: duhyunkim-pi
```
- Tailscale SSH라 **키/비밀번호 불필요**, `sudo`도 **패스워드리스**.
- **전제:** 로컬 머신이 같은 tailnet(계정 `duhyun.dev@`)에 있어야 함.
  확인: `tailscale status`에 `duhyunkim-pi`가 보여야 함. `ssh`가 멈추거나 거부되면 Tailscale가 꺼졌거나 이 머신이 tailnet에 없는 것 → `tailscale up`. **LAN/공인 IP로는 절대 안 됨**(서브넷이 다름).
- macOS tailscale CLI: `/usr/local/bin/tailscale` (또는 `/Applications/Tailscale.app/Contents/MacOS/Tailscale`).
- 새 머신에서 첫 접속 시 host-key 확인 프롬프트 → `yes`.

## 세션에서 Pi 조작
원격 명령을 직접 실행:
```sh
ssh duhyunkim@100.91.78.61 'COMMAND'
```
kubectl은 k3s를 통해 root로 (kubeconfig `/etc/rancher/k3s/k3s.yaml`, root 전용):
```sh
ssh duhyunkim@100.91.78.61 'sudo k3s kubectl get pods -A'
```

### ⚠️ 함정 (겪고 배운 것)
- **긴 원격 명령을 `| tail` / `| head`로 파이프하지 말 것.** 명령이 끝날 때까지 버퍼링돼서 중간 출력이 안 보이고, hang이 침묵처럼 보인다. 스트리밍하거나 파일로 출력할 것.
- **`kubectl apply`로 클러스터를 직접 바꾸지 말 것.** GitOps라 git이 단일 진실이고 ArgoCD가 self-heal(수동 변경을 되돌림). `gitops/` 수정 후 `git push`로.
- **sealed-secrets 컨트롤러를 재설치하지 말 것**(Helm/ArgoCD로도). 봉인 키를 들고 있어서, 키가 바뀌면 기존 `SealedSecret`을 복호화 못 한다.
- 로컬 foreground `sleep` 루프는 피하고, 폴링이 필요하면 원격 셸에서(`ssh ... 'for ...; do ...; sleep N; done'`).

## 자주 쓰는 명령
```sh
# 상태
ssh duhyunkim@100.91.78.61 'sudo k3s kubectl get pods -A'
ssh duhyunkim@100.91.78.61 'sudo k3s kubectl -n argocd get applications'
ssh duhyunkim@100.91.78.61 'sudo k3s kubectl -n blog get pods'

# 로그
ssh duhyunkim@100.91.78.61 'sudo k3s kubectl -n blog logs deploy/blog --tail=50'
ssh duhyunkim@100.91.78.61 'sudo k3s kubectl -n blog logs deploy/cloudflared --tail=30'

# ArgoCD 재동기화 유도 (보통 push 시 자동)
ssh duhyunkim@100.91.78.61 'sudo k3s kubectl -n argocd annotate app blog argocd.argoproj.io/refresh=hard --overwrite'
```

## ArgoCD UI
- `http://duhyunkim-pi.tail601229.ts.net` — **tailnet 전용**(`tailscale serve`로 노출, 공인 노출 0).
- 로그인: `admin` / 초기 비번 = `sudo k3s kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d`.

## 배포 / 발행 (참고 — Pi 수동 작업 없음)
- **배포** = `main`에 `git push` → GitHub Actions가 arm64 빌드 → `ghcr.io/duhyundev/page:<sha>` push → Kustomize 태그 bump → ArgoCD 롤아웃.
- **새 글** = `content/<n>-slug.md`(frontmatter: title/date/excerpt/published) 추가 → `git push`.

## Pi 정보
- `duhyunkim@100.91.78.61` (tailnet `duhyunkim-pi`) · Pi 5 · RAM 16GB · 4코어 · aarch64 · Debian 13(trixie) · NVMe SSD 부팅.
- k3s 주의: `/boot/firmware/cmdline.txt`에 `cgroup_memory=1 cgroup_enable=memory` 필요(+재부팅), 없으면 k3s가 `failed to find memory cgroup`으로 실패.

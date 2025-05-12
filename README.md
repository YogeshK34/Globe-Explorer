
# 🌐 Globe Explorer - Next.js App with Docker & Helm Deployment

This project is a Next.js web application containerized with Docker and deployable to Kubernetes using Helm.

---

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/)
- [Helm](https://helm.sh/)
- [Kubernetes](https://kubernetes.io/) cluster (e.g. Minikube, Docker Desktop)

---

## 🚀 Local Development

Install dependencies and run locally:

```bash
npm install
npm run dev
```

---

## 🐳 Docker Setup

### 1. Build the Docker Image

```bash
docker build --network=host -t nextjs-app-new:latest .
```

> Note: `--network=host` helps avoid `ECONNRESET` errors during `npm install`.

### 2. Run the Docker Container

```bash
docker run -p 3000:3000 nextjs-app-new:latest
```

---

## 🎛 Helm Deployment

### 1. Structure

Ensure you have the following Helm files:
```
helm/
├── templates/
│   ├── deployment.yaml
│   └── service.yaml
├── values.yaml
```

### 2. Install with Helm

```bash
helm install release-1 ./helm
```

### 3. Upgrade with Changes

```bash
helm upgrade release-1 ./helm
```

### 4. Uninstall

```bash
helm uninstall release-1
```

---

## 🧾 Notes

- If you’re behind a proxy or experience network errors, add a `.npmrc` file with:

```
registry=https://registry.npmjs.org/
strict-ssl=false
```

- In `next.config.js`, you should have:
```js
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}
```

---

## 📄 License

MIT License
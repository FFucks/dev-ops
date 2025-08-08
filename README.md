# DevOps Kata: Jenkins + Helm + OpenTofu + Minikube + Prometheus/Grafana

Este repositório contém um template funcional para o desafio:

- **2 clusters Minikube** (perfis `infra` e `apps`)
- **Jenkins** rodando no cluster `infra`
- **Observabilidade** com kube-prometheus-stack (Prometheus + Grafana) nos clusters
- **Aplicação exemplo** (Node.js) com `/health`, `/ready` e `/metrics`
- **Helm Chart** da aplicação com **ServiceMonitor** (Prometheus Operator) por padrão
- **OpenTofu** para provisionar namespace/conta de serviço no cluster `apps`
- **Jenkinsfile** com: testes, build/push de imagem, `tofu validate/plan/apply` e `helm upgrade --install`

## Pré-requisitos

- Ubuntu 20.04 com `docker`, `kubectl`, `minikube`, `helm`
- Dois perfis Minikube:
  ```bash
  minikube start -p infra --cpus=4 --memory=8192
  minikube start -p apps  --cpus=4 --memory=8192

  minikube -p infra addons enable default-storageclass
  minikube -p infra addons enable storage-provisioner
  minikube -p infra addons enable ingress
  minikube -p apps  addons enable ingress
  ```

- kube-prometheus-stack em ambos os clusters (recomendado):
  ```bash
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm repo update

  kubectl --context=infra create ns monitoring
  helm upgrade --install kube-prom-stack prometheus-community/kube-prometheus-stack -n monitoring --set grafana.adminPassword='admin'

  kubectl --context=apps create ns monitoring
  helm upgrade --install kube-prom-stack prometheus-community/kube-prometheus-stack -n monitoring --set grafana.adminPassword='admin'
  ```

- Jenkins (Bitnami) no cluster `infra`:
  ```bash
  kubectl --context=infra create ns ci
  helm repo add bitnami https://charts.bitnami.com/bitnami
  helm repo update

  helm upgrade --install jenkins bitnami/jenkins -n ci     --set admin.username=admin     --set admin.password=admin123     --set service.type=NodePort     --set resources.requests.cpu=1000m     --set resources.requests.memory=2Gi     --set resources.limits.cpu=2000m     --set resources.limits.memory=4Gi

  # URL de acesso
  minikube -p infra service jenkins -n ci --url
  ```

## App de exemplo (Node.js)

- Endpoints:
  - `GET /health` → 200 OK
  - `GET /ready`  → 200 OK
  - `GET /metrics` → métricas Prometheus via `prom-client`

## Deploy manual (sem Jenkins)

```bash
# Se quiser construir a imagem diretamente no runtime Docker do Minikube (cluster apps):
eval $(minikube -p apps docker-env)

# Build da imagem local
docker build -t myapp:dev ./app

# Deploy via Helm
kubectl config use-context apps
helm upgrade --install myapp charts/myapp -n apps --create-namespace   --set image.repository=myapp   --set image.tag=dev

# Teste local
kubectl -n apps port-forward svc/myapp 8080:80
curl -s http://localhost:8080/health
```

## Jenkins Pipeline

O pipeline (`jenkins/Jenkinsfile`) faz:
1. **Testes** (falha se testes falharem)
2. **Build & Push** da imagem para Docker Hub/GHCR
3. **OpenTofu**: `fmt -check`, `validate`, `plan` (com `-detailed-exitcode`), `apply` manual em `main`
4. **Helm upgrade/install** no cluster `apps`
5. **Smoke test**

### Credenciais esperadas no Jenkins
- `dockerhub-user` e `dockerhub-pass` (ou adeque para GHCR)
- Ajuste `IMAGE` no Jenkinsfile se usar outro registry.

## OpenTofu

Arquivos em `infra/tofu`. Exemplo simples que cria `Namespace` `apps` e um `ServiceAccount` `deployer`.

Para rodar localmente:
```bash
cd infra/tofu
tofu init
tofu validate
tofu plan -var="kubeconfig_path=$HOME/.kube/config" -var="kube_context=apps"
tofu apply -auto-approve -var="kubeconfig_path=$HOME/.kube/config" -var="kube_context=apps"
```

## Observabilidade

O Helm Chart da aplicação inclui:
- **Anotações** no Service para scrape
- **ServiceMonitor** (se o Prometheus Operator estiver presente)

No Grafana (senha `admin` se você usou o comando acima), explore os dashboards Kubernetes e adicione painéis para a sua aplicação.

## GitHub

Para subir este template no seu repositório `dev-ops`:

```bash
git init
git remote add origin git@github.com:FFucks/dev-ops.git  # ou use HTTPS
git add .
git commit -m "Bootstrap: Jenkins + Helm + OpenTofu + Minikube + Prometheus/Grafana"
git push -u origin main
```

Boa sorte no desafio! Qualquer ajuste (ex.: usar Java em vez de Node), me avise que eu gero uma variante.

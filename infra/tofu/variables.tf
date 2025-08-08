variable "kubeconfig_path" {
  description = "Caminho para o kubeconfig (~/.kube/config)"
  type        = string
}

variable "kube_context" {
  description = "Contexto do kubectl (ex.: apps)"
  type        = string
}

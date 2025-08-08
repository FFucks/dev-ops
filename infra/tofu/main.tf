terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
  }
}

provider "kubernetes" {
  config_path    = var.kubeconfig_path
  config_context = var.kube_context
}

variable "kubeconfig_path" { type = string }
variable "kube_context"    { type = string }

resource "kubernetes_namespace" "apps_ns" {
  metadata { name = "apps" }
}

resource "kubernetes_service_account" "deploy_sa" {
  metadata {
    name      = "deployer"
    namespace = kubernetes_namespace.apps_ns.metadata[0].name
  }
}

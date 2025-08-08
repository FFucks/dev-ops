output "namespace" {
  value = kubernetes_namespace.apps_ns.metadata[0].name
}

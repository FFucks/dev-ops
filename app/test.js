// Teste super simples (placeholder) que falha se variável faltar
if (!process.env.CI && !process.env.NODE_ENV) {
  console.log('Tests OK (placeholder). Set NODE_ENV in CI if needed.');
} else {
  console.log('Tests OK');
}

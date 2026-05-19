export const generateIdempotencyKey = () => {
  return window.crypto && window.crypto.randomUUID
    ? window.crypto.randomUUID()
    : 'idemp_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
}
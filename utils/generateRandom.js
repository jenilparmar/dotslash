function generateRandom() {
  let transaction = window.crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  console.log(transaction);
}
export { generateRandom };

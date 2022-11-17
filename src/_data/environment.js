module.exports = function() {
  return {
    app_url: process.env.VERCEL_URL || "http://localhost:8080"
  }
}

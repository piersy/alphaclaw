const registerProxyRoutes = ({ app, proxy, SETUP_API_PREFIXES, requireAuth }) => {
  app.all("/openclaw", requireAuth, (req, res) => {
    req.url = "/";
    proxy.web(req, res);
  });
  app.all("/openclaw/*path", requireAuth, (req, res) => {
    req.url = req.url.replace(/^\/openclaw/, "");
    proxy.web(req, res);
  });
  app.all("/assets/*path", requireAuth, (req, res) => proxy.web(req, res));

  app.all("/webhook/*path", (req, res) => {
    if (!req.headers.authorization && req.query.token) {
      req.headers.authorization = `Bearer ${req.query.token}`;
      delete req.query.token;
      const url = new URL(req.url, `http://${req.headers.host}`);
      url.searchParams.delete("token");
      req.url = url.pathname + url.search;
    }
    proxy.web(req, res);
  });

  app.all("/api/*path", (req, res) => {
    if (SETUP_API_PREFIXES.some((p) => req.path.startsWith(p))) return;
    proxy.web(req, res);
  });
};

module.exports = { registerProxyRoutes };

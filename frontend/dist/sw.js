self.addEventListener("push", (event) => {
  const payload = event.data?.json() || {
    title: "NutriTrack",
    body: "You have a new notification.",
    url: "/",
  };

  const title = payload.title || "NutriTrack";
  const options = {
    body: payload.body || "You have a new notification.",
    icon: "/favicon.ico",
    data: {
      url: payload.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

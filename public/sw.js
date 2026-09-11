// TS Grammar Dojo service worker: リマインダーの Push 通知を表示する
self.addEventListener("push", (event) => {
  let data = { title: "TS Grammar Dojo", body: "今日の学習を始めましょう！", url: "/practice/daily" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // JSON でない場合はデフォルトの文面を使う
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: data.url },
      tag: "ts-dojo-reminder",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url ?? "/dashboard", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});

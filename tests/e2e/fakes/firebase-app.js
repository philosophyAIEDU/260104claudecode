const apps = [];
export function initializeApp(cfg) { const a = { cfg }; apps.push(a); return a; }
export function getApps() { return apps; }
export function getApp() { return apps[0]; }

const fs = require('fs');
const j = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const e = j.expo;
const tahap = process.argv[2] || 'awal';
const tambah = (nama, opsi) => { e.plugins = (e.plugins || []).filter((p) => (Array.isArray(p) ? p[0] : p) !== nama); e.plugins.push([nama, opsi]); };

if (tahap === 'awal') {
  e.name = 'INGETIN'; e.slug = 'ingetin';
  e.version = '1.1.0';
  e.scheme = 'ingetin';
  e.icon = './assets/icon.png'; e.userInterfaceStyle = 'light';
  e.runtimeVersion = { policy: 'appVersion' };
  e.android = { ...(e.android || {}), package: 'id.ingetin.app',
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#1A92F1' } };
  if (fs.existsSync('google-services.json')) e.android.googleServicesFile = './google-services.json';
  tambah('expo-build-properties', { android: { buildArchs: ['arm64-v8a', 'armeabi-v7a'], enableProguardInReleaseBuilds: true, enableShrinkResourcesInReleaseBuilds: true } });
  tambah('expo-notifications', { color: '#2563EB' });
  tambah('expo-image-picker', { photosPermission: 'INGETIN memakai foto untuk bukti nota.', cameraPermission: 'INGETIN memakai kamera untuk foto bukti nota.', microphonePermission: false });
} else {
  e.updates = { url: 'https://u.expo.dev/' + e.extra.eas.projectId };
}
fs.writeFileSync('app.json', JSON.stringify(j, null, 2));

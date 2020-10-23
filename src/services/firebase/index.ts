import * as admin from 'firebase-admin';

const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin as firebase };

import * as admin from 'firebase-admin';
import serviceAccount from './service-account.json';

// jest can't import json and tsc needs to import it so we add a fallback to require
const serviceAccountFallback = require('./service-account.json');
const serviceAccountToUse = serviceAccount || serviceAccountFallback;

admin.initializeApp({
  credential: admin.credential.cert({
    privateKey: serviceAccountToUse.private_key,
    clientEmail: serviceAccountToUse.client_email,
    projectId: serviceAccountToUse.project_id,
  }),
});

export { admin as firebase };

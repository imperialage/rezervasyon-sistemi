const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

exports.setAdminCustomClaims = functions.https.onCall(async (data, context) => {
  // Süper admin kontrolü
  if (!context.auth || context.auth.token.email !== 'oguzcanibili@gmail.com') {
    throw new functions.https.HttpsError('permission-denied', 'Only super admin can set custom claims');
  }

  try {
    // Kullanıcıyı email ile bul
    const userRecord = await admin.auth().getUserByEmail('esber@kelleci.com');
    
    // Custom claims ayarla
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin',
      permissions: ['read:reservations', 'write:reservations']
    });

    // Firestore'daki kullanıcı dokümanını güncelle
    await admin.firestore().collection('users').doc(userRecord.uid).update({
      role: 'admin',
      permissions: ['read:reservations', 'write:reservations'],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.token.email
    });

    return {
      success: true,
      message: 'Admin claims set successfully',
      userId: userRecord.uid
    };
  } catch (error) {
    console.error('Error setting admin claims:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
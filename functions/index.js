const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

exports.setAdminCustomClaims = functions.https.onCall(async (data, context) => {
  // Güvenlik kontrolü
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Süper admin kontrolü
  if (context.auth.token.email !== 'oguzcanibili@gmail.com') {
    throw new functions.https.HttpsError('permission-denied', 'Only super admin can set custom claims');
  }

  try {
    // Kullanıcıyı bul
    const user = await admin.auth().getUserByEmail('esber@kelleci.com');
    
    // Custom claims ayarla
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      permissions: ['read:reservations', 'write:reservations']
    });

    return {
      success: true,
      message: 'Admin claims set successfully',
      userId: user.uid
    };
  } catch (error) {
    console.error('Error setting admin claims:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
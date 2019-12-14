const functions = require('firebase-functions');

const express = require('express');
const {getAllscreams,postOneScream,getScream,  commentOnScream , likeScream,
    unlikeScream} = require('./handlers/screams');

const app = express();
const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');
const {signup,login,uploadImage,addUserDetails,getAuthenticatedUser} = require('./handlers/users');
// https://github.com/hidjou/classsed-react-firebase-functions/blob/master/functions/handlers/screams.js
 //router scream
app.get('/screams',getAllscreams);
app.post('/scream',FBAuth,postOneScream);
app.get('/scream/:screamId', getScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
//route user
app.post('/signup',signup);

app.post('/login',login);

app.post('/user/image',FBAuth,uploadImage);

app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


//https://baseur1.com/api/
exports.api = functions.https.onRequest(app) ;
exports.createNotificationOnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            created: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });
exports.deleteNotificationOnUnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });
exports.createNotificationOnComment = functions
  .region('us-central1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            created: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
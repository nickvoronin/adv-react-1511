import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

window.firebase = firebase

class ApiService {
  fb = firebase

  // Auth
  signIn = (email, password) =>
    this.fb.auth().signInWithEmailAndPassword(email, password)
  signUp = (email, password) =>
    this.fb.auth().createUserWithEmailAndPassword(email, password)

  // Events
  fetchAllEvents = () =>
    this.fb
      .database()
      .ref('events')
      .once('value')
      .then((res) => res.val())

  fetchLazyEvents = (id = '') =>
    this.fb
      .database()
      .ref('events')
      .orderByKey()
      .limitToFirst(10)
      .startAt(id)
      .once('value')
      .then((data) => data.val())

  // People
  createPerson = (person) =>
    this.fb
      .database()
      .ref('people')
      .push(person)
      // return id of created person
      .then((res) => res.key)

  fetchPeople = () =>
    this.fb
      .database()
      .ref('people')
      .once('value')
      .then((res) => res.val())

  onAuthStateChanged = (callback) => this.fb.auth().onAuthStateChanged(callback)
}

export default new ApiService()

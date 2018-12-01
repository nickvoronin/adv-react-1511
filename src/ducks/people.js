import { appName } from '../config'
import { Record, List } from 'immutable'
import { reset } from 'redux-form'
import { createSelector } from 'reselect'
import { all, call, put, takeEvery, select } from 'redux-saga/effects'
import api from '../services/api'

/**
 * Constants
 * */
export const moduleName = 'people'
const prefix = `${appName}/${moduleName}`
export const ADD_PERSON = `${prefix}/ADD_PERSON`
export const ADD_PERSON_REQUEST = `${prefix}/ADD_PERSON_REQUEST`
export const FETCH_PEOPLE_REQUEST = `${prefix}/FETCH_PEOPLE_REQUEST`
export const FETCH_PEOPLE_START = `${prefix}/FETCH_PEOPLE_START`
export const FETCH_PEOPLE_SUCCESS = `${prefix}/FETCH_PEOPLE_SUCCESS`
export const FETCH_PEOPLE_ERROR = `${prefix}/FETCH_PEOPLE_ERROR`

/**
 * Reducer
 * */

const PersonRecord = Record({
  id: null,
  firstName: null,
  lastName: null,
  email: null
})

const ReducerState = Record({
  loading: false,
  loaded: false,
  entities: new List([])
})

export default function reducer(state = new ReducerState(), action) {
  const { type, payload } = action

  switch (type) {
    case ADD_PERSON:
      return state.update('entities', (entities) =>
        entities.push(new PersonRecord(payload.person))
      )
    case FETCH_PEOPLE_START:
      return state.set('loading', true).set('loaded', false)
    case FETCH_PEOPLE_SUCCESS:
      return state
        .set('loading', false)
        .set('loaded', true)
        .set('entities', new List(Object.values(payload)))

    default:
      return state
  }
}
/**
 * Selectors
 * */

export const stateSelector = (state) => state[moduleName]
export const peopleSelector = createSelector(
  stateSelector,
  (state) => state.entities.valueSeq().toArray()
)
export const loadingSelector = createSelector(
  stateSelector,
  (state) => state.loading
)
export const loadedSelector = createSelector(
  stateSelector,
  (state) => state.loaded
)

export const idSelector = (_, props) => props.id
export const personSelector = createSelector(
  peopleSelector,
  idSelector,
  (list, id) => list.find((person) => person.id === id)
)

/**
 * Action Creators
 * */

export function addPerson(person) {
  return {
    type: ADD_PERSON_REQUEST,
    payload: { person }
  }
}

export function fetchPeople() {
  return {
    type: FETCH_PEOPLE_REQUEST
  }
}

/**
 * Sagas
 **/

export function* fetchPeopleSaga() {
  try {
    if (yield select(loadingSelector)) {
      return
    }
    yield put({ type: FETCH_PEOPLE_START })
    const people = yield call(api.fetchPeople)
    yield put({
      type: FETCH_PEOPLE_SUCCESS,
      payload: people
    })
  } catch (error) {
    yield put({
      type: FETCH_PEOPLE_ERROR,
      error
    })
  }
}

export function* addPersonSaga(action) {
  const { person } = action.payload

  const id = yield call(api.createPerson, person)

  yield put({
    type: ADD_PERSON,
    payload: {
      person: { id, ...person }
    }
  })

  yield put(reset('person'))
}

export function* saga() {
  yield all([
    takeEvery(ADD_PERSON_REQUEST, addPersonSaga),
    takeEvery(FETCH_PEOPLE_REQUEST, fetchPeopleSaga)
  ])
}

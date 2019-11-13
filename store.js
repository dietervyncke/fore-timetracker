import { createStore, combineReducers } from 'redux';
import recordReducer from './reducers/recordReducer';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({
  records: recordReducer
});

const persistConfig = {
  key: 'root',
  storage: storage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);

// persistor.purge();
import { UPDATE_USER } from './types';

export const updateUser = user => {
    return {
        type: UPDATE_USER,
        payload: user
    }
};
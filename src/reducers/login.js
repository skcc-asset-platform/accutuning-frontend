import {
    LOGIN_USER,
    LOGIN_USER_SUCCESS,
    LOGIN_USER_FAILURE,
    LOGOUT_USER_SUCCESS,
    CHANGE_PASSWORD_SUCCESS,
    CHANGE_PASSWORD_FAILURE,
} from "../actions/login";

const initialState = {
    data: null,
    error: null,
    loading: false
};

export default (state = initialState, action) => {
    // console.log(action)
    switch (action.type) {
    case LOGIN_USER:
        return {
            ...state,
            loading: true
        };
    case LOGIN_USER_SUCCESS:
        if (action.payload && action.payload.token) {
            // console.log(action.payload)
            localStorage.setItem('jwt', action.payload.token)
            window.location = process.env.PUBLIC_URL
        }
        return {
            ...state,
            loading: false,
            error: null,
            data: action.payload
        };
    case LOGIN_USER_FAILURE:
        return {
            ...state,
            loading: false,
            error: action.payload
        };
    case LOGOUT_USER_SUCCESS:
        localStorage.setItem('jwt', null)
        return {
            ...state,
            loading: false,
            error: null,
            data: null,
        };
    case CHANGE_PASSWORD_FAILURE:
        console.log(action)
        return {
            ...state,
            loading: false,
            error: action.payload
        };    
    case CHANGE_PASSWORD_SUCCESS:
    default:
        return {
            ...state
        };
    }
};

import {
    // LOGIN_USER,
    // LOGIN_USER_SUCCESS,
    // LOGIN_USER_FAILURE,
    GET_CURRENT_USER,
    GET_CURRENT_USER_SUCCESS,
    GET_CURRENT_USER_FAILURE,
} from "../actions/user";

const initialState = {
    data: null,
    error: null,
    loading: false
};

export default (state = initialState, action) => {
    // console.log(action)
    switch (action.type) {
    // case LOGIN_USER:
    //     return {
    //         ...state,
    //         loading: true
    //     };
    // case LOGIN_USER_SUCCESS:
    //     return {
    //         ...state,
    //         loading: false,
    //         error: null,
    //         data: action.payload
    //     };
    // case LOGIN_USER_FAILURE:
    //     return {
    //         ...state,
    //         loading: false,
    //         error: action.payload
    //     };
    case GET_CURRENT_USER:
        return {
            ...state,
            loading: true
        };
    case GET_CURRENT_USER_SUCCESS:
        return {
            ...state,
            loading: false,
            error: null,
            data: action.payload
        };
    case GET_CURRENT_USER_FAILURE:
        return {
            ...state,
            loading: false,
            error: action.payload
        };
    default:
        return {
            ...state
        };
    }
};

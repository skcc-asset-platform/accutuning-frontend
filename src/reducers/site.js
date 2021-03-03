import {
    GET_SITE,
    GET_SITE_SUCCESS,
    GET_SITE_FAILURE,
} from "../actions/site";

const initialState = {
    data: null,
    error: null,
    loading: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
    case GET_SITE:
        return {
            ...state,
            loading: true
        };
    case GET_SITE_SUCCESS:
        return {
            ...state,
            loading: false,
            error: null,
            data: action.payload
        };
    case GET_SITE_FAILURE:
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

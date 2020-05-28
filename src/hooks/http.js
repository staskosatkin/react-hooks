import { useReducer, useCallback } from 'react';

const initialState = {
    loading: false,
    data: null,
    error: null,
    extra: null,
    indentifier: null
};

const httpReducer = (httpState, action) => {
    switch (action.type) {
        case 'SEND':
            return {loading: true, error: null, data: null, extra: null, indentifier: action.indentifier};
        case 'RESPONSE':
            return {...httpState, loading: false, data: action.responseData, extra: action.extra};
        case 'ERROR':
            return {loading: false, error: action.errorMessage};
        case 'CLEAR':
            return initialState;
        default:
            throw new Error('Should not be reached!');
    }
};

const useHttp = () => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

    const clear = () => {
        dispatchHttp({type: 'CLEAR'}, []);
    };

    const sendRequest = useCallback((url, method, body, extra, indentifier) => {
        dispatchHttp({ type: 'SEND', indentifier: indentifier});
        fetch(url, {
            method: method,
            body: body,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(responseData => {
            dispatchHttp({type: 'RESPONSE', responseData: responseData, extra: extra});
        }).catch(error => {
            dispatchHttp({type: 'ERROR', errorMessage: 'Something went wrong'});
        });
    }, []);

    return {
        isLoading: httpState.loading,
        data: httpState.data,
        error: httpState.error,
        sendRequest: sendRequest,
        reqExtra: httpState.extra,
        reqIndentifier: httpState.indentifier,
        clear: clear
    };
};

export default useHttp;
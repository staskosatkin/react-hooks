import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';

const ingredientReducer = (currentIngredients, action) => {
    switch (action.type) {
        case 'SET':
            return action.ingredients;
        case 'ADD':
            return [...currentIngredients, action.ingredient]
        case 'DELETE':
            return currentIngredients.filter(ingredient => ingredient.id !== action.id);
        default:
            throw new Error('Should not get there!');
    }
};

const Ingredients = () => {
    const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
    const { isLoading, error, data, reqExtra, reqIndentifier, sendRequest, clear } = useHttp();

    useEffect(() => {
        if (!isLoading && !error) {
            if (reqIndentifier === 'REMOVE_INGREDIENT') {
                dispatch({type: 'DELETE', id: reqExtra });
            } else if (data && reqIndentifier === 'ADD_INGREDIENT') {
                dispatch({type: 'ADD', ingredient: {id: data.name, ...reqExtra}});
            }
        }
    }, [data, error, isLoading, reqExtra, reqIndentifier]);

    const filteredIngredientsHandler = useCallback(ingredients => {
        // setUserIngredients(ingredients);
        dispatch({type: 'SET', ingredients: ingredients});
    }, []);

    const addIngredientHandler = useCallback(ingredient => {

        sendRequest(
            'https://react-hooks-c1709.firebaseio.com/ingredients.json',
            'POST',
            JSON.stringify(ingredient),
            ingredient,
            'ADD_INGREDIENT'
        );
    }, [sendRequest]);

    const removeIngredientHandler = useCallback(id => {
        sendRequest(
            `https://react-hooks-c1709.firebaseio.com/ingredients/${id}.json`,
            'DELETE',
            null,
            id,
            'REMOVE_INGREDIENT'
        );
    }, [sendRequest]);

    const ingredientList = useMemo(() => {
        return (
            <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
        );
    }, [userIngredients, removeIngredientHandler]);

    return (
        <div className="App">
            {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
            <IngredientForm 
                onAddIngredient={addIngredientHandler} 
                loading={isLoading} />

            <section>
                <Search onLoadIngredients={filteredIngredientsHandler} />
                {ingredientList}
            </section>
        </div>
    );
}

export default Ingredients;

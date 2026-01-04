import * as categoriesActions from './category.actions';

export interface AppState {
  categoriesState: CategoriesState;
}

export interface CategoriesState {
  categories: any[];
  error: string | null;
}

export const initialState: CategoriesState = {
  categories: [],
  error: null,
};

export function categoriesReducer(
  state: CategoriesState = initialState,
  action: any
): CategoriesState {
  switch (action.type) {
    case categoriesActions.INITIALIZECATEGORIES:
      let initCategories = action.payload || state.categories;
      let ressult: any = [];
      initCategories = initCategories.map((categories: any) =>
        Object.values(categories)
      );
      for (let key of Object.keys(initCategories)) {
        ressult.push(initCategories[key][0]);
      }

      // const initCategories = action.payload !== undefined ? action.payload : state.categories;
      return { ...state, categories: ressult };
    case categoriesActions.ADDCATEGORY:
      const category = action.payload;
      const categoryExists = state.categories.some((cat) => cat === category);

      return {
        ...state,
        categories: categoryExists
          ? state.categories
          : [...state.categories, category],
        error: 'This category already exists.',
      };

    case categoriesActions.CATEGORIES_SUCCESS:
      let result: any = [];
      const categories = action.payload;
      for (let key of Object.keys(categories)) {
        result.push(categories[key]);
      }
      return { ...state, categories: result };
    default:
      return state;
  }
}

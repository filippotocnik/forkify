import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

const state = {
  /* GLOBAL STATE
  - search object
  - current recipe object
  - shopping list object
  - liked recipes
  */
};

const controlSearch = async () => {
  // get query from the view
  const query = searchView.getInput();
  if (query) {
    // create new search obj and add to state
    state.search = new Search(query);
    // prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchResults);
    // search for recipes
    await state.search.getResults();
    // render results on UI
    clearLoader();
    searchView.renderResults(state.search.recipes);
  }
}

elements.searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  controlSearch();
});

elements.searchResultsPages.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.recipes, goToPage);
  }
})

/* ------------- */

const controlRecipe = async () => {
  // get id from url
  const id = window.location.hash.replace('#', '');
  if (id) {
    // prepare ui for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    if (state.search) {
      searchView.highlightSelected(id);
    }
    // creating new recipe obj
    state.recipe = new Recipe(id);
    try {
    // get recipe data
    await state.recipe.getRecipe();
    state.recipe.parseIngredients();
      // calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      // render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      console.log(error);
      alert('Error...')
    }
    
  }
};

window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

/* ------------- */

const controlList = () => {
  if (!state.list) {
    state.list = new List();
  }
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  })
}

elements.shoppingList.addEventListener('click', event => {
  const id = event.target.closest('.shopping__item').dataset.itemid;

  if (event.target.matches('.shopping__delete, .shopping__delete *')) {
    state.list.deleteItem(id);
    listView.deleteItem(id);
  } else if (event.target.matches('.shopping__count-value')) {
    const value = parseFloat(event.target.value, 10);
    state.list.updateCount(id, value);
  }
});

/* ------------- */

state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentId = state.recipe.id;
  if (!state.likes.isLiked(currentId)) {
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.image
    );
    likesView.toggleLikeBtn(true);
    likesView.renderLike(newLike);
  } else {
    state.likes.deleteLike(currentId);
    likesView.toggleLikeBtn(false);
    likesView.deleteLike(currentId);
  }
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
}

window.addEventListener('load', function restoreLikedRecipes() {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

/* ------------- */

elements.recipe.addEventListener('click', event => {
  if (event.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('decrease');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (event.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('increase');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (event.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
  } else if (event.target.matches('.recipe__love, .recipe__love *')) {
    controlLike();
  }
});
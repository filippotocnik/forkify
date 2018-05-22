import { elements } from "./base";
import { create } from "domain";

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
  elements.searchInput.value = '';
}

export const clearResults = () => {
  elements.searchResultList.innerHTML = '';
  elements.searchResultsPages.innerHTML = '';

}

export const highlightSelected = id => {
  const resultsArray = Array.from(document.querySelectorAll('.results__link'));
  resultsArray.forEach(el => {
    el.classList.remove('results__link--active');
  });
  document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');
};

export const limitRecipeTitle = (title, limit = 17) => {
  let newTitle = [];
  if (title.length > limit) {
    title.split(' ').reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);
    return `${newTitle.join(' ')}...`;
  }
  return title;
}

const renderRecipe = recipe => {
  const markup = `
  <li>
    <a class="results__link" href="#${recipe.recipe_id}">
      <figure class="results__fig">
          <img src="${recipe.image_url}" alt="${recipe.title}">
      </figure>
      <div class="results__data">
          <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
          <p class="results__author">${recipe.publisher}</p>
      </div>
  </a>
</li>
`;
elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

const createButton = (page, buttonType) => {
  return `
  
  <button class="btn-inline results__btn--${buttonType}" data-goto=${buttonType === 'prev' ? page - 1 : page + 1}>
    <span>Page ${buttonType === 'prev' ? page - 1 : page + 1}</span>  
    <svg class="search__icon">
          <use href="img/icons.svg#icon-triangle-${buttonType === 'prev' ? 'left' : 'right'}"></use>
      </svg>
  </button>
  `
}

const renderButtons = (page, numberOfResults, resultsPerPage) => {
  const pages = Math.ceil(numberOfResults / resultsPerPage);
  let button;
  if (page === 1 && pages > 1) {
    // button to go to next page only
    button = createButton(page, 'next');
  } else if (page < pages) {
    // both buttons
    button = `${createButton(page, 'prev')}
              ${createButton(page, 'next')}`;
  } else if (page === pages && pages > 1) {
    // button to go to previus page
    button = createButton(page, 'prev');
  }
  elements.searchResultsPages.insertAdjacentHTML('afterbegin', button);
}

export const renderResults = (recipes, page = 1, resultsPerPage = 10) => {
  // render results of current page
  const start = (page - 1) * resultsPerPage;
  const end = page * resultsPerPage;

  recipes.slice(start, end).forEach(renderRecipe);

  // render pagination buttons
  renderButtons(page, recipes.length, resultsPerPage);
};

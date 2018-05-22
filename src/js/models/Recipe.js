import axios from 'axios';
import { apiKey, proxy } from '../config';

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const result = await axios(`${proxy}http://food2fork.com/api/get?key=${apiKey}&rId=${this.id}`);
      this.title = result.data.recipe.title;
      this.author = result.data.recipe.publisher;
      this.image = result.data.recipe.image_url;
      this.url = result.data.recipe.source_url;
      this.ingredients = result.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
      alert('wroooong...')
    }
  }

  calcTime() {
    const numIngredients = this.ingredients.length;
    const periods = Math.ceil(numIngredients / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
    const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound']
    const units = [...unitsShort, 'g', 'kg'];

    const newIngredients = this.ingredients.map(el => {
      // uniform units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });
      // remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
      // parse ingredients into count, unit and ingredients
      const arrayIngredients = ingredient.split(' ');
      const unitIndex = arrayIngredients.findIndex(item => units.includes(item));

      let objIngredient; 
      if (unitIndex > -1) {
        // there is a unit
        const arrayCount = arrayIngredients.slice(0, unitIndex);
        let count;
        if (arrayCount.length === 1) {
          count = eval(arrayCount[0].replace('-', '+'));
        } else {
          count = eval(arrayCount.slice(0, unitIndex).join('+'));
        }

        objIngredient = {
          count,
          unit: arrayIngredients[unitIndex],
          ingredient: arrayIngredients.slice(unitIndex + 1).join(' ')
        }

      } else if (parseInt(arrayIngredients[0], 10)) {
        // there is no unit, first element is string
        objIngredient = {
          count: parseInt(arrayIngredients[0], 10),
          unit: '',
          ingredient: arrayIngredients.slice(1).join(' ')
        }
      } else if (unitIndex === -1) {
        // there is no unit end no number in first position
        objIngredient = {
          count: 1,
          unit: '',
          ingredient
        }
      }

      return objIngredient;
    });
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    const newServings = type === 'decrease' ? this.servings - 1 : this.servings + 1;
    
    this.ingredients.forEach(el => {
      el.count = el.count * (newServings / this.servings);
    });
    
    this.servings = newServings;
  }

}


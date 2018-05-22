import axios from 'axios';
import { apiKey, proxy } from '../config';

export default class Search {
  constructor (query) {
    this.query = query;
  }

  async getResults() {
    try {
      const result = await axios(`${proxy}http://food2fork.com/api/search?key=${apiKey}&q=${this.query}`);
      this.recipes = result.data.recipes;
    } catch (error) {
      alert(error);
    }
  }
}
export class Recipe {
  constructor(title, ingredients = [], steps = []) {
    this.title = title;
    this.ingredients = [...ingredients];
    this.steps = [...steps];
  }

  addIngredient(ingredient) {
    this.ingredients.push(ingredient);
  }

  removeIngredient(ingredient) {
    const index = this.ingredients.indexOf(ingredient);

    if (index !== -1) {
      this.ingredients.splice(index, 1);
    }
  }

  get ingredientCount() {
    return this.ingredients.length;
  }

  addStep(step) {
    this.steps.push(step);
  }

  removeStep(index) {
    if (Number.isInteger(index) && index >= 0 && index < this.steps.length) {
      this.steps.splice(index, 1);
    }
  }

  get stepCount() {
    return this.steps.length;
  }
}

function groupBy(recipes, getKey) {
  const groups = new Map();

  for (const recipe of recipes) {
    const key = getKey(recipe);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(recipe);
  }

  return groups;
}

export function groupRecipesByIngredientCount(recipes) {
  return groupBy(recipes, (recipe) => recipe.ingredients.length);
}

export function getUniqueIngredients(recipes) {
  return [...new Set(recipes.flatMap((recipe) => recipe.ingredients))];
}

export function findRecipesByIngredient(recipes, ingredient) {
  return recipes.filter((recipe) => recipe.ingredients.includes(ingredient));
}

export function groupRecipesByStepCount(recipes) {
  return groupBy(recipes, (recipe) => recipe.steps.length);
}

export function getRecipeTitles(recipes) {
  return recipes.map((recipe) => recipe.title);
}

export const getRecipesByIngredient = findRecipesByIngredient;
export const groupRecipesByStepsCount = groupRecipesByStepCount;

export class Recipe {
  constructor(title, ingredients = [], steps = []) {
    this.title = title;
    this.ingredients = Array.isArray(ingredients) ? [...ingredients] : [];
    this.steps = Array.isArray(steps) ? [...steps] : [];
  }

  get ingredientCount() {
    return this.ingredients.length;
  }

  get stepCount() {
    return this.steps.length;
  }

  addIngredient(ingredient) {
    if (ingredient && !this.ingredients.includes(ingredient)) {
      this.ingredients.push(ingredient);
    }
  }

  removeIngredient(ingredient) {
    this.ingredients = this.ingredients.filter((item) => item !== ingredient);
  }

  addStep(step) {
    if (step) {
      this.steps.push(step);
    }
  }

  removeStep(index) {
    if (index >= 0 && index < this.steps.length) {
      this.steps.splice(index, 1);
    }
  }

  asyncAddIngredient(ingredient) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.addIngredient(ingredient);
        resolve(this);
      }, 50);
    });
  }

  asyncRemoveIngredient(ingredient) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.removeIngredient(ingredient);
        resolve(this);
      }, 50);
    });
  }

  asyncAddStep(step) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.addStep(step);
        resolve(this);
      }, 50);
    });
  }

  asyncRemoveStep(index) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.removeStep(index);
        resolve(this);
      }, 50);
    });
  }
}

// 1. Группировка рецептов по количеству ингредиентов
export function groupRecipesByIngredientCount(recipes) {
  return recipes.reduce((acc, recipe) => {
    const count = recipe.ingredientCount;
    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(recipe);
    return acc;
  }, {});
}
export const groupByIngredientCount = groupRecipesByIngredientCount;

// 2. Уникальный список всех ингредиентов
export function getUniqueIngredients(recipes) {
  const all = recipes.flatMap((recipe) => recipe.ingredients);
  return Array.from(new Set(all));
}

// 3. Рецепты, содержащие заданный ингредиент
export function findRecipesByIngredient(recipes, ingredient) {
  return recipes.filter((recipe) =>
    recipe.ingredients.some(
      (item) => item.toLowerCase() === String(ingredient).toLowerCase(),
    ),
  );
}

// 4. Группировка рецептов по длине списка шагов
export function groupRecipesByStepCount(recipes) {
  return recipes.reduce((acc, recipe) => {
    const count = recipe.stepCount;
    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(recipe);
    return acc;
  }, {});
}
export const groupByStepCount = groupRecipesByStepCount;

// 5. Список всех названий рецептов
export function getRecipeTitles(recipes) {
  return recipes.map((recipe) => recipe.title);
}
export const getAllRecipeTitles = getRecipeTitles;

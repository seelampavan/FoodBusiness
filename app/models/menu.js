const db = require('../services/db');

class Menu {
  // Id of the menu item
  id;

  // Name of the menu item
  name;

  // Category of the menu item
  category;

  // Veg status of the menu item
  veg;

  // Ingredients of the menu item
  ingredients;

  // Benefits of the menu item
  benefits;

  // Calories of the menu item
  calories;

  // Description of the menu item
  description;

  // Image URL of the menu item
  item_img;

  // Created date of the menu item
  created_date;

  // Modified date of the menu item
  modified_date;
  
  constructor(name, category, veg, ingredients, benefits, calories, description, item_img, created_date, modified_date) {
    this.name = name;
    this.category = category;
    this.veg = veg;
    this.ingredients = ingredients;
    this.benefits = benefits;
    this.calories = calories;
    this.description = description;
    this.item_img = item_img;
    this.created_date = created_date;
    this.modified_date = modified_date;
  }

  // Create a new menu item
  async createMenuItem() {
    let sql = "INSERT INTO menu_item (name, category, veg, ingredients, benefits, calories, description, item_img, created_date, modified_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const result = await db.query(sql, [this.name, this.category, this.veg, this.ingredients, this.benefits, this.calories, this.description, this.item_img, this.created_date, this.modified_date]);
    this.id = result.insertId;
    return true;
  }

  // Read menu items
  static async getMenuItems() {
    let sql = "SELECT * FROM menu_item";
    const results = await db.query(sql);
    return results;
  }

  // Read a menu item by ID
  static async getMenuItemById(itemId) {
    let sql = "SELECT * FROM menu_item WHERE id = ?";
    const results = await db.query(sql, [itemId]);
    return results;
  }

  // Update a menu item
  async updateMenuItem() {
    let sql = "UPDATE menu_item SET name = ?, category = ?, veg = ?, ingredients = ?, benefits = ?, calories = ?, description = ?, item_img = ?, modified_date = ? WHERE id = ?";
    await db.query(sql, [this.name, this.category, this.veg, this.ingredients, this.benefits, this.calories, this.description, this.item_img, this.modified_date, this.id]);
    return true;
  }

  // Delete a menu item
  static async deleteMenuItem(itemId) {
    let sql = "DELETE FROM menu_item WHERE id = ?";
    await db.query(sql, [itemId]);
    return true;
  }
}

module.exports = {
  Menu
};

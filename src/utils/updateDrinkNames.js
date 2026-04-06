import { ref, onValue, update, push, set } from "firebase/database";
import { db } from "../lib/firebase.js";

/**
 * Utility script to update all drink product names to include "16oz"
 * This script identifies drinks and adds "16oz" to their names if not already present
 */

// List of drink categories that should have cup sizes
const DRINK_CATEGORIES = [
  'Coffee',
  'Drinks',
  'Beverages',
  'Hot Drinks',
  'Cold Drinks',
  'Espresso',
  'Latte',
  'Cappuccino',
  'Tea'
];

// Common drink keywords to identify drinks by name
const DRINK_KEYWORDS = [
  'coffee',
  'americano',
  'latte',
  'cappuccino',
  'espresso',
  'macchiato',
  'mocha',
  'frappuccino',
  'cloud', // Cloud series drinks (cloud macchiato, cloud latte, etc.)
  'tea',
  'chai',
  'smoothie',
  'shake',
  'juice',
  'drink',
  'beverage',
  'hot',
  'cold',
  'iced'
];

/**
 * Check if a product is likely a drink based on category or name
 */
function isDrinkProduct(product) {
  const category = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  
  // Check if category matches drink categories
  const isDrinkCategory = DRINK_CATEGORIES.some(drinkCat => 
    category.includes(drinkCat.toLowerCase())
  );
  
  // Check if name contains drink keywords
  const isDrinkName = DRINK_KEYWORDS.some(keyword => 
    name.includes(keyword.toLowerCase())
  );
  
  return isDrinkCategory || isDrinkName;
}

/**
 * Check if product name already has a size indicator
 */
function hasSize(productName) {
  const name = productName.toLowerCase();
  return name.includes('oz') || name.includes('ml') || name.includes('size');
}

/**
 * Add 16oz to product name if it doesn't already have a size
 */
function addSizeToName(productName) {
  if (hasSize(productName)) {
    return productName; // Already has size, don't modify
  }
  return `${productName} 16oz`;
}

/**
 * Main function to update drink names
 */
export async function updateDrinkNames() {
  return new Promise((resolve, reject) => {
    const productsRef = ref(db, "products");
    
    onValue(productsRef, async (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          console.log("No products found in database");
          resolve({ updated: 0, total: 0 });
          return;
        }

        const products = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        console.log(`Found ${products.length} total products`);

        // Find drinks that need updating
        const drinksToUpdate = products.filter(product => {
          const isDrink = isDrinkProduct(product);
          const needsSize = isDrink && !hasSize(product.name);
          
          if (isDrink) {
            console.log(`Drink found: "${product.name}" (Category: ${product.category}) - ${needsSize ? 'NEEDS UPDATE' : 'Already has size'}`);
          }
          
          return needsSize;
        });

        console.log(`Found ${drinksToUpdate.length} drinks that need size updates`);

        if (drinksToUpdate.length === 0) {
          console.log("No drinks need updating");
          resolve({ updated: 0, total: products.length });
          return;
        }

        // Prepare updates
        const updates = {};
        drinksToUpdate.forEach(product => {
          const newName = addSizeToName(product.name);
          updates[`products/${product.id}/name`] = newName;
          console.log(`Will update: "${product.name}" → "${newName}"`);
        });

        // Apply updates
        await update(ref(db), updates);
        
        console.log(`Successfully updated ${drinksToUpdate.length} drink names!`);
        resolve({ 
          updated: drinksToUpdate.length, 
          total: products.length,
          updatedProducts: drinksToUpdate.map(p => ({
            id: p.id,
            oldName: p.name,
            newName: addSizeToName(p.name),
            category: p.category
          }))
        });

      } catch (error) {
        console.error("Error updating drink names:", error);
        reject(error);
      }
    }, { onlyOnce: true });
  });
}

/**
 * Preview what changes would be made without actually updating
 */
export async function previewDrinkNameUpdates() {
  return new Promise((resolve, reject) => {
    const productsRef = ref(db, "products");
    
    onValue(productsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          console.log("No products found in database");
          resolve([]);
          return;
        }

        const products = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        // Find drinks that would be updated
        const drinksToUpdate = products
          .filter(product => isDrinkProduct(product) && !hasSize(product.name))
          .map(product => ({
            id: product.id,
            currentName: product.name,
            newName: addSizeToName(product.name),
            category: product.category,
            isDrink: true
          }));

        // Also show drinks that already have sizes
        const drinksWithSizes = products
          .filter(product => isDrinkProduct(product) && hasSize(product.name))
          .map(product => ({
            id: product.id,
            currentName: product.name,
            newName: product.name,
            category: product.category,
            isDrink: true,
            alreadyHasSize: true
          }));

        const allDrinks = [...drinksToUpdate, ...drinksWithSizes];
        
        console.log("=== DRINK NAME UPDATE PREVIEW ===");
        console.log(`Total products: ${products.length}`);
        console.log(`Total drinks found: ${allDrinks.length}`);
        console.log(`Drinks needing updates: ${drinksToUpdate.length}`);
        console.log(`Drinks already with sizes: ${drinksWithSizes.length}`);
        
        if (drinksToUpdate.length > 0) {
          console.log("\\n--- DRINKS TO BE UPDATED ---");
          drinksToUpdate.forEach(drink => {
            console.log(`"${drink.currentName}" → "${drink.newName}" (${drink.category})`);
          });
        }
        
        if (drinksWithSizes.length > 0) {
          console.log("\\n--- DRINKS ALREADY WITH SIZES ---");
          drinksWithSizes.forEach(drink => {
            console.log(`"${drink.currentName}" (${drink.category})`);
          });
        }

        resolve(allDrinks);

      } catch (error) {
        console.error("Error previewing drink name updates:", error);
        reject(error);
      }
    }, { onlyOnce: true });
  });
}

/**
 * Create 22oz versions of all 16oz drinks
 */
export async function duplicateDrinksTo22oz() {
  return new Promise((resolve, reject) => {
    const productsRef = ref(db, "products");
    
    onValue(productsRef, async (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          console.log("No products found in database");
          resolve({ created: 0, total: 0 });
          return;
        }

        const products = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        console.log(`Found ${products.length} total products`);

        // Find 16oz drinks to duplicate
        const drinks16oz = products.filter(product => {
          const isDrink = isDrinkProduct(product);
          const has16oz = product.name?.toLowerCase().includes('16oz');
          
          if (isDrink && has16oz) {
            console.log(`16oz drink found: "${product.name}" (Category: ${product.category})`);
          }
          
          return isDrink && has16oz;
        });

        console.log(`Found ${drinks16oz.length} drinks with 16oz to duplicate`);

        if (drinks16oz.length === 0) {
          console.log("No 16oz drinks found to duplicate");
          resolve({ created: 0, total: products.length });
          return;
        }

        // Check if 22oz versions already exist
        const existing22ozNames = new Set(
          products
            .filter(p => p.name?.toLowerCase().includes('22oz'))
            .map(p => p.name?.toLowerCase().replace('22oz', '16oz'))
        );

        const drinksToCreate = drinks16oz.filter(drink => {
          const potential22ozName = drink.name.toLowerCase().replace('16oz', '22oz');
          const baseName = drink.name.toLowerCase();
          const alreadyExists = existing22ozNames.has(baseName);
          
          if (alreadyExists) {
            console.log(`22oz version already exists for: "${drink.name}"`);
          }
          
          return !alreadyExists;
        });

        console.log(`Will create ${drinksToCreate.length} new 22oz drinks`);

        if (drinksToCreate.length === 0) {
          console.log("All 16oz drinks already have 22oz versions");
          resolve({ created: 0, total: products.length, skipped: drinks16oz.length });
          return;
        }

        // Create 22oz versions
        const createdProducts = [];
        for (const drink of drinksToCreate) {
          const newName = drink.name.replace(/16oz/gi, '22oz');
          
          // Calculate new price (22oz = 16oz price + 30 pesos)
          const newPrice = (drink.price || 0) + 30;
          
          const newProduct = {
            name: newName,
            price: newPrice,
            stockStatus: drink.stockStatus || 'in-stock',
            category: drink.category,
            imageUrl: drink.imageUrl || null,
          };

          const newProductRef = push(ref(db, "products"));
          await set(newProductRef, newProduct);
          
          createdProducts.push({
            id: newProductRef.key,
            originalName: drink.name,
            newName: newName,
            originalPrice: drink.price,
            newPrice: newPrice,
            category: drink.category
          });
          
          console.log(`Created: "${drink.name}" (₱${drink.price}) → "${newName}" (₱${newPrice})`);
        }
        
        console.log(`Successfully created ${createdProducts.length} new 22oz drinks!`);
        resolve({ 
          created: createdProducts.length, 
          total: products.length,
          createdProducts: createdProducts
        });

      } catch (error) {
        console.error("Error creating 22oz drinks:", error);
        reject(error);
      }
    }, { onlyOnce: true });
  });
}

/**
 * Preview what 22oz drinks would be created
 */
export async function preview22ozDuplication() {
  return new Promise((resolve, reject) => {
    const productsRef = ref(db, "products");
    
    onValue(productsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          console.log("No products found in database");
          resolve([]);
          return;
        }

        const products = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        // Find 16oz drinks
        const drinks16oz = products.filter(product => 
          isDrinkProduct(product) && product.name?.toLowerCase().includes('16oz')
        );

        // Find existing 22oz drinks
        const existing22ozNames = new Set(
          products
            .filter(p => p.name?.toLowerCase().includes('22oz'))
            .map(p => p.name?.toLowerCase().replace('22oz', '16oz'))
        );

        // Categorize drinks
        const drinksToCreate = drinks16oz
          .filter(drink => !existing22ozNames.has(drink.name.toLowerCase()))
          .map(drink => ({
            id: drink.id,
            originalName: drink.name,
            newName: drink.name.replace(/16oz/gi, '22oz'),
            originalPrice: drink.price,
            newPrice: (drink.price || 0) + 30,
            category: drink.category,
            willCreate: true
          }));

        const drinksAlreadyExist = drinks16oz
          .filter(drink => existing22ozNames.has(drink.name.toLowerCase()))
          .map(drink => ({
            id: drink.id,
            originalName: drink.name,
            newName: drink.name.replace(/16oz/gi, '22oz'),
            originalPrice: drink.price,
            newPrice: (drink.price || 0) + 30,
            category: drink.category,
            alreadyExists: true
          }));

        const allPreview = [...drinksToCreate, ...drinksAlreadyExist];
        
        console.log("=== 22OZ DUPLICATION PREVIEW ===");
        console.log(`Total 16oz drinks found: ${drinks16oz.length}`);
        console.log(`New 22oz drinks to create: ${drinksToCreate.length}`);
        console.log(`22oz versions already exist: ${drinksAlreadyExist.length}`);
        
        if (drinksToCreate.length > 0) {
          console.log("\n--- NEW 22OZ DRINKS TO CREATE ---");
          drinksToCreate.forEach(drink => {
            console.log(`"${drink.originalName}" (₱${drink.originalPrice}) → "${drink.newName}" (₱${drink.newPrice})`);
          });
        }
        
        if (drinksAlreadyExist.length > 0) {
          console.log("\n--- 22OZ VERSIONS ALREADY EXIST ---");
          drinksAlreadyExist.forEach(drink => {
            console.log(`"${drink.originalName}" → "${drink.newName}" (already exists)`);
          });
        }

        resolve(allPreview);

      } catch (error) {
        console.error("Error previewing 22oz duplication:", error);
        reject(error);
      }
    }, { onlyOnce: true });
  });
}

// Example usage:
// To preview changes: previewDrinkNameUpdates()
// To apply changes: updateDrinkNames()
// To preview 22oz duplication: preview22ozDuplication()
// To create 22oz drinks: duplicateDrinksTo22oz()
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const recipesContainer = document.getElementById('recipesContainer');
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    const favoritesBtn = document.getElementById('favoritesBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const addRecipeModal = document.getElementById('addRecipeModal');
    const recipeDetailModal = document.getElementById('recipeDetailModal');
    const recipeForm = document.getElementById('recipeForm');
    
    // Close modals when clicking X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            addRecipeModal.style.display = 'none';
            recipeDetailModal.style.display = 'none';
        });
    });
    
    // Open Add Recipe modal
    addRecipeBtn.addEventListener('click', () => {
        addRecipeModal.style.display = 'block';
    });
    
    // Handle recipe form submission
    recipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recipe = {
            name: document.getElementById('recipeName').value,
            image: document.getElementById('recipeImage').value,
            ingredients: document.getElementById('ingredients').value.split('\n').filter(item => item.trim() !== ''),
            instructions: document.getElementById('instructions').value.split('\n').filter(item => item.trim() !== ''),
            author: getCurrentUserId(), // You'll need to implement this
            createdAt: new Date()
        };
        
        try {
            await addRecipeToDatabase(recipe);
            addRecipeModal.style.display = 'none';
            recipeForm.reset();
            loadRecipes();
        } catch (error) {
            console.error('Error adding recipe:', error);
            alert('Failed to add recipe. Please try again.');
        }
    });
    
    // Load recipes when page loads
    loadRecipes();
    
    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        // Implement logout logic
        localStorage.removeItem('userToken');
        window.location.href = 'login.html';
    });
    
    // Favorites functionality
    favoritesBtn.addEventListener('click', () => {
        loadFavorites();
    });
    
    // Function to load recipes from database
    async function loadRecipes(filterFavorites = false) {
        try {
            const recipes = await fetchRecipesFromDatabase(filterFavorites);
            renderRecipes(recipes);
        } catch (error) {
            console.error('Error loading recipes:', error);
        }
    }
    
    // Function to render recipes
    function renderRecipes(recipes) {
        recipesContainer.innerHTML = '';
        
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.dataset.id = recipe._id;
            
            recipeCard.innerHTML = `
                <h3>${recipe.name}</h3>
                <div class="recipe-image">
                    <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.name}">
                </div>
                <div class="recipe-details">
                    <button class="view-btn">View Recipe</button>
                    <button class="fav-btn">${recipe.isFavorite ? '♥' : '♡'}</button>
                </div>
            `;
            
            recipesContainer.appendChild(recipeCard);
            
            // Add event listeners
            recipeCard.querySelector('.view-btn').addEventListener('click', () => showRecipeDetail(recipe));
            recipeCard.querySelector('.fav-btn').addEventListener('click', () => toggleFavorite(recipe._id));
        });
    }
    
    // Function to show recipe details
    function showRecipeDetail(recipe) {
        document.getElementById('detailRecipeName').textContent = recipe.name;
        document.getElementById('detailRecipeImage').src = recipe.image || 'placeholder.jpg';
        
        const ingredientsList = document.getElementById('detailIngredients');
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });
        
        const instructionsList = document.getElementById('detailInstructions');
        instructionsList.innerHTML = '';
        recipe.instructions.forEach(instruction => {
            const li = document.createElement('li');
            li.textContent = instruction;
            instructionsList.appendChild(li);
        });
        
        const favBtn = document.getElementById('detailFavBtn');
        favBtn.textContent = recipe.isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
        favBtn.onclick = () => {
            toggleFavorite(recipe._id);
            recipeDetailModal.style.display = 'none';
        };
        
        recipeDetailModal.style.display = 'block';
    }
    
    // Function to toggle favorite status
    async function toggleFavorite(recipeId) {
        try {
            await toggleFavoriteInDatabase(recipeId);
            loadRecipes();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }
    
    // Database functions (to be implemented with your actual database)
    async function fetchRecipesFromDatabase(filterFavorites = false) {
        // Replace with actual database fetch
        const response = await fetch('/api/recipes', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch recipes');
        
        let recipes = await response.json();
        
        if (filterFavorites) {
            const favResponse = await fetch('/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!favResponse.ok) throw new Error('Failed to fetch favorites');
            
            const favorites = await favResponse.json();
            const favoriteIds = favorites.map(fav => fav.recipeId);
            
            recipes = recipes.filter(recipe => favoriteIds.includes(recipe._id));
        }
        
        return recipes;
    }
    
    async function addRecipeToDatabase(recipe) {
        // Replace with actual database insert
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
            body: JSON.stringify(recipe)
        });
        
        if (!response.ok) throw new Error('Failed to add recipe');
        
        return await response.json();
    }
    
    async function toggleFavoriteInDatabase(recipeId) {
        // Replace with actual database update
        const response = await fetch(`/api/favorites/${recipeId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to toggle favorite');
    }
    
    function getCurrentUserId() {
        // Implement based on your auth system
        return localStorage.getItem('userId');
    }
    
    function loadFavorites() {
        loadRecipes(true);
    }
});
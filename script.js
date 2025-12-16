const beans = Array.from(document.querySelectorAll(".bean"));
const tags = Array.from(document.querySelectorAll(".tag"));
const cta = document.querySelector(".cta");
const searchInput = document.querySelector("#coffee-search");
const beanCount = document.querySelector(".bean-count");
const resultsContainer = document.querySelector("#results-container");
const resultsContent = document.querySelector("#results-content");
const resultsSummary = document.querySelector("#results-summary");
const clearAllBtn = document.querySelector("#clear-all-btn");
const cupContainer = document.querySelector("#cup-container");
const coffeeResults = document.querySelector("#coffee-results");
const coffeeList = document.querySelector("#coffee-list");
const resultsCount = document.querySelector("#results-count");

// Filter state
let selectedStrength = 0;
const selectedTags = new Set();
const selectedMachines = new Set();
const selectedCategories = new Set();
const selectedOrigins = new Set();
const selectedRoasting = new Set();
let minPrice = null;
let maxPrice = null;

const DEFAULT_BEAN_SRC = "images/bean-ikon.png";
const ACTIVE_BEAN_SRC = "images/bean-clicked.png";

// Update beans visual state
function updateBeans(value) {
    selectedStrength = value;
    beans.forEach((bean) => {
        const beanValue = Number(bean.dataset.value);
        const isActive = beanValue <= value;
        bean.classList.toggle("active", isActive);
        const img = bean.querySelector("img");
        if (img) {
            img.src = isActive ? ACTIVE_BEAN_SRC : DEFAULT_BEAN_SRC;
        }
    });
    if (beanCount) {
        beanCount.textContent = `${selectedStrength}/10`;
    }
    updateResults();
}

// Toggle tag selection
function toggleTag(tagButton) {
    const key = tagButton.dataset.tag;
    const isActive = selectedTags.has(key);
    if (isActive) {
        selectedTags.delete(key);
    } else {
        selectedTags.add(key);
    }
    tagButton.classList.toggle("active", !isActive);
    updateResults();
}

// Initialize beans
beans.forEach((bean) => {
    bean.addEventListener("click", () => updateBeans(Number(bean.dataset.value)));
});
updateBeans(0);

// Initialize tags
tags.forEach((tag) => {
    tag.addEventListener("click", () => toggleTag(tag));
});

// Expand/collapse filters
const moreFiltersLink = document.querySelector("#more-filters");
const expandedFilters = document.querySelector("#expanded-filters");

moreFiltersLink?.addEventListener("click", (e) => {
    e.preventDefault();
    const isExpanded = expandedFilters?.style.display !== "none";
    
    if (expandedFilters) {
        if (isExpanded) {
            expandedFilters.style.display = "none";
            moreFiltersLink.textContent = "Flere filtre ↓";
        } else {
            expandedFilters.style.display = "block";
            moreFiltersLink.textContent = "Flere filtre ↑";
        }
    }
});

// Handle filter list item clicks (machines, categories, origins)
const filterListItems = Array.from(document.querySelectorAll(".filter-list-item"));
filterListItems.forEach((item) => {
    item.addEventListener("click", () => {
        item.classList.toggle("active");
        const filterType = item.dataset.filterType;
        const value = item.dataset.value;
        
        if (filterType === "machine") {
            if (item.classList.contains("active")) {
                selectedMachines.add(value);
            } else {
                selectedMachines.delete(value);
            }
        } else if (filterType === "category") {
            if (item.classList.contains("active")) {
                selectedCategories.add(value);
            } else {
                selectedCategories.delete(value);
            }
        } else if (filterType === "origin") {
            if (item.classList.contains("active")) {
                selectedOrigins.add(value);
            } else {
                selectedOrigins.delete(value);
            }
        }
        updateResults();
    });
});

// Handle price inputs
const priceInputs = document.querySelectorAll(".price-input");
priceInputs.forEach((input) => {
    input.addEventListener("input", () => {
        const value = input.value ? Number(input.value) : null;
        if (input.name === "min-price") {
            minPrice = value;
        } else if (input.name === "max-price") {
            maxPrice = value;
        }
        updateResults();
    });
});

// Handle roasting checkboxes
const roastingCheckboxes = document.querySelectorAll('input[name="ristningsgrad"]');
roastingCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            selectedRoasting.add(checkbox.value);
        } else {
            selectedRoasting.delete(checkbox.value);
        }
        updateResults();
    });
});

// Update results display
function updateResults() {
    const hasAnyFilters = 
        selectedStrength > 0 ||
        selectedTags.size > 0 ||
        selectedMachines.size > 0 ||
        selectedCategories.size > 0 ||
        selectedOrigins.size > 0 ||
        selectedRoasting.size > 0 ||
        minPrice !== null ||
        maxPrice !== null ||
        (searchInput?.value.trim() || "").length > 0;

    if (!hasAnyFilters) {
        resultsContainer.style.display = "none";
        if (cupContainer) cupContainer.style.display = "flex";
        if (coffeeResults) coffeeResults.style.display = "none";
        return;
    }

    resultsContainer.style.display = "block";
    if (cupContainer) cupContainer.style.display = "none";
    
    let html = "";
    let summaryParts = [];

    // Search term
    if (searchInput?.value.trim()) {
        html += `<div class="result-item">
            <span class="result-label">Søgning:</span>
            <span class="result-value">"${searchInput.value.trim()}"</span>
            <button type="button" class="result-remove" data-clear="search">×</button>
        </div>`;
        summaryParts.push(`Søgning: "${searchInput.value.trim()}"`);
    }

    // Strength
    if (selectedStrength > 0) {
        html += `<div class="result-item">
            <span class="result-label">Styrke:</span>
            <span class="result-value">${selectedStrength}/10</span>
            <button type="button" class="result-remove" data-clear="strength">×</button>
        </div>`;
        summaryParts.push(`Styrke ${selectedStrength}/10`);
    }

    // Aromas
    if (selectedTags.size > 0) {
        const aromas = Array.from(selectedTags).map(t => t.charAt(0).toUpperCase() + t.slice(1));
        html += `<div class="result-item">
            <span class="result-label">Aroma:</span>
            <span class="result-value">${aromas.join(", ")}</span>
            <button type="button" class="result-remove" data-clear="aroma">×</button>
        </div>`;
        summaryParts.push(`Aroma: ${aromas.join(", ")}`);
    }

    // Machines
    if (selectedMachines.size > 0) {
        const machines = Array.from(selectedMachines);
        html += `<div class="result-item">
            <span class="result-label">Maskintype:</span>
            <span class="result-value">${machines.join(", ")}</span>
            <button type="button" class="result-remove" data-clear="machine">×</button>
        </div>`;
        summaryParts.push(`Maskintype: ${machines.join(", ")}`);
    }

    // Categories
    if (selectedCategories.size > 0) {
        const categories = Array.from(selectedCategories);
        html += `<div class="result-item">
            <span class="result-label">Kategori:</span>
            <span class="result-value">${categories.join(", ")}</span>
            <button type="button" class="result-remove" data-clear="category">×</button>
        </div>`;
        summaryParts.push(`Kategori: ${categories.join(", ")}`);
    }

    // Origins
    if (selectedOrigins.size > 0) {
        const origins = Array.from(selectedOrigins);
        html += `<div class="result-item">
            <span class="result-label">Oprindelsesland:</span>
            <span class="result-value">${origins.join(", ")}</span>
            <button type="button" class="result-remove" data-clear="origin">×</button>
        </div>`;
        summaryParts.push(`Oprindelsesland: ${origins.join(", ")}`);
    }

    // Roasting
    if (selectedRoasting.size > 0) {
        const roasting = Array.from(selectedRoasting).map(r => {
            const labels = {
                "lys": "Lys",
                "medium": "Medium",
                "mørk": "Mørk",
                "ekstra-mørk": "Ekstra mørk"
            };
            return labels[r] || r;
        });
        html += `<div class="result-item">
            <span class="result-label">Ristningsgrad:</span>
            <span class="result-value">${roasting.join(", ")}</span>
            <button type="button" class="result-remove" data-clear="roasting">×</button>
        </div>`;
        summaryParts.push(`Ristningsgrad: ${roasting.join(", ")}`);
    }

    // Price range
    if (minPrice !== null || maxPrice !== null) {
        const priceRange = [];
        if (minPrice !== null) priceRange.push(`Min: ${minPrice} kr`);
        if (maxPrice !== null) priceRange.push(`Max: ${maxPrice} kr`);
        html += `<div class="result-item">
            <span class="result-label">Pris:</span>
            <span class="result-value">${priceRange.join(" - ")}</span>
            <button type="button" class="result-remove" data-clear="price">×</button>
        </div>`;
        summaryParts.push(`Pris: ${priceRange.join(" - ")}`);
    }

    resultsContent.innerHTML = html;
    
    // Update summary
    const totalFilters = summaryParts.length;
    resultsSummary.innerHTML = `<p><strong>${totalFilters}</strong> ${totalFilters === 1 ? 'filter valgt' : 'filtre valgt'}</p>`;

    // Add event listeners to remove buttons
    const removeButtons = resultsContent.querySelectorAll(".result-remove");
    removeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const clearType = btn.dataset.clear;
            clearFilter(clearType);
        });
    });
}

// Clear specific filter
function clearFilter(type) {
    switch (type) {
        case "search":
            if (searchInput) searchInput.value = "";
            break;
        case "strength":
            updateBeans(0);
            break;
        case "aroma":
            selectedTags.forEach(tag => {
                const tagBtn = tags.find(t => t.dataset.tag === tag);
                if (tagBtn) {
                    tagBtn.classList.remove("active");
                }
            });
            selectedTags.clear();
            break;
        case "machine":
            selectedMachines.forEach(machine => {
                const item = filterListItems.find(i => 
                    i.dataset.filterType === "machine" && i.dataset.value === machine
                );
                if (item) item.classList.remove("active");
            });
            selectedMachines.clear();
            break;
        case "category":
            selectedCategories.forEach(category => {
                const item = filterListItems.find(i => 
                    i.dataset.filterType === "category" && i.dataset.value === category
                );
                if (item) item.classList.remove("active");
            });
            selectedCategories.clear();
            break;
        case "origin":
            selectedOrigins.forEach(origin => {
                const item = filterListItems.find(i => 
                    i.dataset.filterType === "origin" && i.dataset.value === origin
                );
                if (item) item.classList.remove("active");
            });
            selectedOrigins.clear();
            break;
        case "roasting":
            selectedRoasting.forEach(roasting => {
                const checkbox = Array.from(roastingCheckboxes).find(c => c.value === roasting);
                if (checkbox) checkbox.checked = false;
            });
            selectedRoasting.clear();
            break;
        case "price":
            minPrice = null;
            maxPrice = null;
            priceInputs.forEach(input => {
                input.value = "";
            });
            break;
    }
    updateResults();
}

// Clear all filters
clearAllBtn?.addEventListener("click", () => {
    // Clear search
    if (searchInput) searchInput.value = "";
    
    // Clear strength
    updateBeans(0);
    
        // Clear aromas
        selectedTags.forEach(tag => {
            const tagBtn = tags.find(t => t.dataset.tag === tag);
            if (tagBtn) tagBtn.classList.remove("active");
        });
        selectedTags.clear();
    
    // Clear machines
    filterListItems.forEach(item => {
        if (item.dataset.filterType === "machine") {
            item.classList.remove("active");
        }
    });
    selectedMachines.clear();
    
    // Clear categories
    filterListItems.forEach(item => {
        if (item.dataset.filterType === "category") {
            item.classList.remove("active");
        }
    });
    selectedCategories.clear();
    
    // Clear origins
    filterListItems.forEach(item => {
        if (item.dataset.filterType === "origin") {
            item.classList.remove("active");
        }
    });
    selectedOrigins.clear();
    
    // Clear roasting
    roastingCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedRoasting.clear();
    
    // Clear price
    minPrice = null;
    maxPrice = null;
    priceInputs.forEach(input => {
        input.value = "";
    });
    
    updateResults();
});

// Update results when search input changes
searchInput?.addEventListener("input", updateResults);

// Mock coffee data - in a real app, this would come from an API
const mockCoffees = [
    { name: "Colombia Supremo", origin: "Colombia", strength: 7, aroma: ["frugt", "karamel"], machine: "Nespresso", category: "Espresso", roasting: "medium", price: 89 },
    { name: "Ethiopian Yirgacheffe", origin: "Etiopien", strength: 5, aroma: ["frugt"], machine: "Filterkaffe", category: "Espresso", roasting: "lys", price: 95 },
    { name: "Guatemala Antigua", origin: "Guatemala", strength: 6, aroma: ["karamel", "mandel"], machine: "Hele bønner", category: "Espresso", roasting: "medium", price: 92 },
    { name: "Brazilian Santos", origin: "Brasilien", strength: 8, aroma: ["karamel", "mælk"], machine: "Nespresso", category: "Lungo", roasting: "mørk", price: 79 },
    { name: "Honduras Marcala", origin: "Honduras", strength: 6, aroma: ["frugt", "vanilje"], machine: "Filterkaffe", category: "Espresso", roasting: "medium", price: 88 },
    { name: "Vietnamese Robusta", origin: "Vietnam", strength: 9, aroma: ["karamel"], machine: "Filterkaffe", category: "Espresso", roasting: "mørk", price: 75 },
    { name: "Colombian Blend", origin: "Blend", strength: 7, aroma: ["karamel", "vanilje"], machine: "Nespresso", category: "Cappuccino", roasting: "medium", price: 85 },
    { name: "Ethiopian Blend", origin: "Blend", strength: 5, aroma: ["frugt"], machine: "Dolce Gusto", category: "Latte", roasting: "lys", price: 82 },
    { name: "Colombia Excelso", origin: "Colombia", strength: 6, aroma: ["karamel", "frugt"], machine: "Tassimo", category: "Lungo", roasting: "medium", price: 87 },
    { name: "Ethiopian Sidamo", origin: "Etiopien", strength: 4, aroma: ["frugt", "vanilje"], machine: "Filterkaffe", category: "Espresso", roasting: "lys", price: 98 },
    { name: "Guatemala Huehuetenango", origin: "Guatemala", strength: 7, aroma: ["mandel", "karamel"], machine: "Hele bønner", category: "Ristretto", roasting: "medium", price: 94 },
    { name: "Brazilian Cerrado", origin: "Brasilien", strength: 9, aroma: ["mælk", "karamel"], machine: "Nespresso", category: "Espresso", roasting: "mørk", price: 76 },
    { name: "Honduras Copán", origin: "Honduras", strength: 5, aroma: ["frugt", "mandel"], machine: "Senseo", category: "Lungo", roasting: "lys", price: 91 },
    { name: "Vietnamese Arabica", origin: "Vietnam", strength: 8, aroma: ["karamel"], machine: "Filterkaffe", category: "Espresso", roasting: "mørk", price: 73 },
    { name: "Colombia Huila", origin: "Colombia", strength: 6, aroma: ["frugt", "vanilje"], machine: "Dolce Gusto", category: "Cappuccino", roasting: "medium", price: 86 },
    { name: "Ethiopian Harrar", origin: "Etiopien", strength: 5, aroma: ["frugt", "mandel"], machine: "Hele bønner", category: "Espresso", roasting: "lys", price: 96 },
    { name: "Guatemala Cobán", origin: "Guatemala", strength: 7, aroma: ["karamel", "mælk"], machine: "Nespresso", category: "Macchiato", roasting: "medium", price: 90 },
    { name: "Brazilian Bourbon", origin: "Brasilien", strength: 8, aroma: ["karamel", "vanilje"], machine: "Tassimo", category: "Latte", roasting: "mørk", price: 81 },
    { name: "Honduras Comayagua", origin: "Honduras", strength: 6, aroma: ["frugt"], machine: "Filterkaffe", category: "Espresso", roasting: "medium", price: 89 },
    { name: "Vietnamese Da Lat", origin: "Vietnam", strength: 10, aroma: ["karamel", "mælk"], machine: "Nespresso", category: "Espresso", roasting: "ekstra-mørk", price: 72 },
    { name: "Premium Blend", origin: "Blend", strength: 7, aroma: ["karamel", "vanilje", "mandel"], machine: "Nespresso", category: "Cappuccino", roasting: "medium", price: 99 },
    { name: "Colombia Nariño", origin: "Colombia", strength: 5, aroma: ["frugt", "karamel"], machine: "Dolce Gusto", category: "Lungo", roasting: "lys", price: 93 },
    { name: "Ethiopian Limu", origin: "Etiopien", strength: 4, aroma: ["frugt", "vanilje"], machine: "Hele bønner", category: "Espresso", roasting: "lys", price: 97 },
    { name: "Guatemala Atitlán", origin: "Guatemala", strength: 6, aroma: ["mandel", "karamel"], machine: "Senseo", category: "Flat White", roasting: "medium", price: 88 },
    { name: "Brazilian Mogiana", origin: "Brasilien", strength: 9, aroma: ["mælk", "karamel"], machine: "Tassimo", category: "Espresso", roasting: "mørk", price: 78 },
    { name: "Honduras Opalaca", origin: "Honduras", strength: 5, aroma: ["frugt", "mandel"], machine: "Filterkaffe", category: "Americano", roasting: "lys", price: 92 },
    { name: "Vietnamese Cau Dat", origin: "Vietnam", strength: 8, aroma: ["karamel"], machine: "Nespresso", category: "Espresso", roasting: "mørk", price: 74 },
    { name: "Tropical Blend", origin: "Blend", strength: 6, aroma: ["frugt", "vanilje", "karamel"], machine: "Dolce Gusto", category: "Latte", roasting: "medium", price: 84 },
    { name: "Colombia Cauca", origin: "Colombia", strength: 7, aroma: ["karamel", "mandel"], machine: "Hele bønner", category: "Cappuccino", roasting: "medium", price: 91 },
    { name: "Ethiopian Kochere", origin: "Etiopien", strength: 5, aroma: ["frugt"], machine: "Filterkaffe", category: "Espresso", roasting: "lys", price: 94 },
    { name: "Guatemala Fraijanes", origin: "Guatemala", strength: 6, aroma: ["karamel", "mælk"], machine: "Nespresso", category: "Macchiato", roasting: "medium", price: 87 },
    { name: "Brazilian Sul de Minas", origin: "Brasilien", strength: 8, aroma: ["karamel", "vanilje"], machine: "Tassimo", category: "Lungo", roasting: "mørk", price: 80 },
    { name: "Honduras Montecillos", origin: "Honduras", strength: 6, aroma: ["frugt", "karamel"], machine: "Senseo", category: "Espresso", roasting: "medium", price: 90 },
    { name: "Vietnamese Buon Ma Thuot", origin: "Vietnam", strength: 9, aroma: ["karamel", "mælk"], machine: "Filterkaffe", category: "Espresso", roasting: "ekstra-mørk", price: 71 },
    { name: "Classic Blend", origin: "Blend", strength: 7, aroma: ["karamel", "mandel"], machine: "Nespresso", category: "Espresso", roasting: "medium", price: 83 },
    { name: "Colombia Tolima", origin: "Colombia", strength: 6, aroma: ["frugt", "vanilje"], machine: "Dolce Gusto", category: "Flat White", roasting: "medium", price: 85 },
    { name: "Ethiopian Guji", origin: "Etiopien", strength: 4, aroma: ["frugt", "mandel"], machine: "Hele bønner", category: "Espresso", roasting: "lys", price: 100 },
    { name: "Guatemala San Marcos", origin: "Guatemala", strength: 7, aroma: ["karamel", "vanilje"], machine: "Nespresso", category: "Cappuccino", roasting: "medium", price: 89 },
    { name: "Brazilian Chapada", origin: "Brasilien", strength: 8, aroma: ["mælk", "karamel"], machine: "Tassimo", category: "Latte", roasting: "mørk", price: 77 },
    { name: "Honduras El Paraiso", origin: "Honduras", strength: 5, aroma: ["frugt"], machine: "Filterkaffe", category: "Espresso", roasting: "lys", price: 93 },
    { name: "Vietnamese Trung Nguyen", origin: "Vietnam", strength: 10, aroma: ["karamel"], machine: "Nespresso", category: "Espresso", roasting: "ekstra-mørk", price: 70 },
    { name: "Espresso Blend", origin: "Blend", strength: 9, aroma: ["karamel", "mælk", "mandel"], machine: "Nespresso", category: "Espresso", roasting: "mørk", price: 88 },
    { name: "Colombia Risaralda", origin: "Colombia", strength: 6, aroma: ["frugt", "karamel"], machine: "Dolce Gusto", category: "Americano", roasting: "medium", price: 86 }
];

// Filter coffees based on selected filters
function filterCoffees() {
    let filtered = [...mockCoffees];
    
    // Filter by search term
    const searchTerm = searchInput?.value.trim().toLowerCase() || "";
    if (searchTerm) {
        filtered = filtered.filter(coffee => 
            coffee.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by strength
    if (selectedStrength > 0) {
        filtered = filtered.filter(coffee => 
            Math.abs(coffee.strength - selectedStrength) <= 2
        );
    }
    
    // Filter by aromas
    if (selectedTags.size > 0) {
        filtered = filtered.filter(coffee => 
            Array.from(selectedTags).some(tag => coffee.aroma.includes(tag))
        );
    }
    
    // Filter by machine
    if (selectedMachines.size > 0) {
        filtered = filtered.filter(coffee => 
            selectedMachines.has(coffee.machine)
        );
    }
    
    // Filter by category
    if (selectedCategories.size > 0) {
        filtered = filtered.filter(coffee => 
            selectedCategories.has(coffee.category)
        );
    }
    
    // Filter by origin
    if (selectedOrigins.size > 0) {
        filtered = filtered.filter(coffee => 
            selectedOrigins.has(coffee.origin)
        );
    }
    
    // Filter by roasting
    if (selectedRoasting.size > 0) {
        filtered = filtered.filter(coffee => 
            selectedRoasting.has(coffee.roasting)
        );
    }
    
    // Filter by price
    if (minPrice !== null) {
        filtered = filtered.filter(coffee => coffee.price >= minPrice);
    }
    if (maxPrice !== null) {
        filtered = filtered.filter(coffee => coffee.price <= maxPrice);
    }
    
    return filtered;
}

// Display coffee results
function displayCoffeeResults() {
    const coffees = filterCoffees();
    
    if (coffees.length === 0) {
        coffeeList.innerHTML = `
            <div class="no-results">
                <p>Ingen kaffer matcher dine filtre.</p>
                <p class="no-results-hint">Prøv at justere dine filtre for at se flere resultater.</p>
            </div>
        `;
        resultsCount.textContent = "0 resultater";
    } else {
        coffeeList.innerHTML = coffees.map(coffee => `
            <div class="coffee-item">
                <div class="coffee-info">
                    <h4 class="coffee-name">${coffee.name}</h4>
                    <div class="coffee-details">
                        <span class="coffee-detail-item">
                            <strong>Oprindelse:</strong> ${coffee.origin}
                        </span>
                        <span class="coffee-detail-item">
                            <strong>Styrke:</strong> ${coffee.strength}/10
                        </span>
                        <span class="coffee-detail-item">
                            <strong>Maskin:</strong> ${coffee.machine}
                        </span>
                        <span class="coffee-detail-item">
                            <strong>Kategori:</strong> ${coffee.category}
                        </span>
                        <span class="coffee-detail-item">
                            <strong>Ristning:</strong> ${coffee.roasting.charAt(0).toUpperCase() + coffee.roasting.slice(1)}
                        </span>
                        <span class="coffee-detail-item">
                            <strong>Aroma:</strong> ${coffee.aroma.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ")}
                        </span>
                    </div>
                </div>
                <div class="coffee-price">
                    <span class="price-amount">${coffee.price} kr</span>
                    <button type="button" class="add-to-cart-btn">Tilføj</button>
                </div>
            </div>
        `).join("");
        
        resultsCount.textContent = `${coffees.length} ${coffees.length === 1 ? 'resultat' : 'resultater'}`;
    }
    
    coffeeResults.style.display = "block";
    coffeeResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// CTA button - show coffee results
cta?.addEventListener("click", () => {
    const hasFilters = resultsContainer.style.display !== "none";
    
    if (!hasFilters) {
        alert("Vælg venligst mindst ét filter for at søge efter kaffe.");
        return;
    }
    
    // Display coffee results
    displayCoffeeResults();
});

// Initialize - check if there are any filters on load
updateResults();

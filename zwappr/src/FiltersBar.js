import filterImg from "../../assets/filterImg.png"

import furnitureImg from "../../assets/furniture.png";
import gamesImg from "../../assets/games.png";
import clothingImg from "../../assets/clothing.png";
import homeDecorImg from "../../assets/homeDecor.png";
import partySuppliesImg from "../../assets/partySupplies.png";
import camerasImg from "../../assets/cameras.png";
import campingImg from "../../assets/camping.png";
import cateringImg from "../../assets/catering.png";





function FiltersBar(){
    return (
        <div class="filter-bar-container">
            <CategoryList />
            <FilterButton />
        </div>
    );
}




function CategoryList() {
    const categories = [
        { name: "Furniture", image: furnitureImg },
        { name: "Games", image: gamesImg },
        { name: "Clothing", image: clothingImg },
        { name: "Home Decor", image: homeDecorImg },
        { name: "Party Supplies", image: partySuppliesImg },
        { name: "Cameras & Photography", image: camerasImg },
        { name: "Camping & Outdoors", image: campingImg },
        { name: "Catering Equipment", image: cateringImg },
    ];
    
    return (
        <div class="categories-list-container">
            {categories.map((category) => (
                <CategoryCard
                    name={category.name}
                    image={category.image}
                />
            ))}
        </div>
    );
}



function CategoryCard({ name, image }) {
    return (
        <button class="category-card">
            <img src={image} alt={name} />
            <span>{name}</span>
        </button>
    );
}

function FilterButton() {
    return (
        <button class="filter-button">
            <img src={filterImg} alt="Filter" />
            Filters
        </button>
    );
}

export default FiltersBar;

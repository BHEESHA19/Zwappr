import React from 'react';
import './TopSection.css';
import { Input } from '@chakra-ui/react';
import { Search } from 'lucide-react';

const categories = [
  'Furniture', 'Games', 'Clothing', 'Home Decor',
  'Party Supplies', 'Cameras & Photography', 'Camping & Outdoors'
];

function TopSection() {
  return (
    <div className="top-section">
      <p className="tagline">For the small things.</p>
      <div className="search-bar-wrapper">
        <input className="search-input" type="text" placeholder="Search items..." />
        <Search className="search-icon" size={20} />
      </div>

      <div className="category-row">
        {categories.map((cat, index) => (
          <div className="category-icon" key={index}>
            {/* Replace src below once you give actual icon filenames */}
            <img src={`./assets/${cat.toLowerCase().replace(/ & /g, '-').replace(/\s/g, '-')}.png`} alt={cat} />
            <span>{cat}</span>
          </div>
        ))}
        <button className="filter-btn">Filters</button>
      </div>
    </div>
  );
}

export default TopSection;

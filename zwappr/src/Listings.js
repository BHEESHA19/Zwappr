import saveButton from "../../assets/saveButton.png"
import thumbnail0 from "./thumbnail.png"


function Listings(){
    const listings = [
        {
            id: 0,
            thumbnail: thumbnail0,
            title: "Eames Lounge Chairs",
            price: "$75 CAD day",
            location: "Chinook, Calgary",
            dateAvailable: "Apr 1 - 8",
            owner: "bella_cho"
        },
        {
            id: 0,
            thumbnail: thumbnail0,
            title: "Eames Lounge Chairs",
            price: "$75 CAD day",
            location: "Chinook, Calgary",
            dateAvailable: "Apr 1 - 8",
            owner: "bella_cho"
        },
        {
            id: 0,
            thumbnail: thumbnail0,
            title: "Eames Lounge Chairs",
            price: "$75 CAD day",
            location: "Chinook, Calgary",
            dateAvailable: "Apr 1 - 8",
            owner: "bella_cho"
        },
        {
            id: 0,
            thumbnail: thumbnail0,
            title: "Eames Lounge Chairs",
            price: "$75 CAD day",
            location: "Chinook, Calgary",
            dateAvailable: "Apr 1 - 8",
            owner: "bella_cho"
        },
        {
            id: 0,
            thumbnail: thumbnail0,
            title: "Eames Lounge Chairs",
            price: "$75 CAD day",
            location: "Chinook, Calgary",
            dateAvailable: "Apr 1 - 8",
            owner: "bella_cho"
        },
        {
            id: 0,
            thumbnail: thumbnail0,
            title: "Eames Lounge Chairs",
            price: "$75 CAD day",
            location: "Chinook, Calgary",
            dateAvailable: "Apr 1 - 8",
            owner: "bella_cho"
        },
        {
            id: 0,
            thumbnail: thumbnail0,
            title: "Eames Lounge Chairs",
            price: "$75 CAD day",
            location: "Chinook, Calgary",
            dateAvailable: "Apr 1 - 8",
            owner: "bella_cho"
        },
        {
            id: 0,
            thumbnail: thumbnail0,
            title: "Eames Lounge Chairs",
            price: "$75 CAD day",
            location: "Chinook, Calgary",
            dateAvailable: "Apr 1 - 8",
            owner: "bella_cho"
        }
    ];

    return (
        <div class="listings-container">
            {listings.map((item) => (
                <Item
                    id={item.id} 
                    thumbnail={item.thumbnail}
                    title={item.title}
                    price={item.price}
                    location={item.location}
                    dateAvailable={item.dateAvailable}
                    owner={item.owner}
                />
            ))}
        </div>
    )
}



function Item({ id, thumbnail, title, price, location, dateAvailable, owner}){
    return (
        <div class="item-container">
            <div class="item-thumbnail" style={{backgroundImage: `url(${thumbnail})`}}>
                <button style={{backgroundImage: `url(${saveButton})`}}>
                </button>
            </div>
            <div class="item-description-container">
                <ul>
                    <li class="item-title">{title}</li>
                    <li>{location}</li>
                    <li>{dateAvailable}</li>
                    <li class="item-owner">{owner}</li>
                </ul>
                <p class="item-price">{price}</p>
            </div>
        </div>    
    )
}


export default Listings
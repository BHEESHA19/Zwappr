
import email from "../../assets/email.png"
import phone from "../../assets/phone.png"

function Item( {item} ){
    return (
        <div class="item-container">
            <p class="title">{item.title}</p>
            <div class="content">
                <ItemDisplay 
                    images={item.images}
                    owner={item.owner}
                    description={item.description}
                />
                <RentingOptions 
                    price={item.price}
                    securityDeposit={item.securityDeposit}
                    availability={item.availability}
                />
            </div>
        </div>
    );
}


function ItemDisplay( {images, owner, description }){
    return (
        <div class="item-display-container">
            <ImagePanel images={images} />
            <ItemInfo
                owner={owner}
                description={description}
            />
        </div>
    );
}

function ImagePanel( {images} ){
    return (
        <div class="image-display-container">
            <img src={images[0]} class="thumbnail"/>
            {images.slice(1, 5).map((image) => (
                <img src={image} alt="" class="grid-image" />
            ))}
        </div>
    );
}



function RentingOptions( {price, securityDeposit, availability }){
    return (
        <div class="renting-options">
            <p>{price}</p>
            <div class="rental-date-selector">
                <input type="date" />
                <input type="date" />
            </div>

            <button>Reserve</button>

            <table>
                <tr>
                    <td>{price} x 7 days</td>
                    <td>$000 CAD</td>
                </tr>
                <tr>
                    <td>Security Deposit</td>
                    <td>{securityDeposit}</td>
                </tr>
                <tr>
                    <td>Total</td>
                    <td>$000 CAD</td>
                </tr>
            </table>
        </div>
    );
}




function ItemInfo({owner, description}){
    return (
        <div class="item-info-container">
            <div class="owner-profile">
                <img src={owner.profilePicture} />
                {owner.name}
            </div>

            <p class="item-description">{description}</p>
            
            <div class="owner-contact">
                <img src={phone} />
                {owner.phoneNumber}
            </div>
            <div class="owner-contact">
                <img src={email} />
                {owner.emailAddress}
            </div>
        </div>
    );
}


export default Item;
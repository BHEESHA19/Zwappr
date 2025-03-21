const OwnerCard = (user) => (
    <div class="owner-container">
        <img className="owner-pfp" src={user.profile_image} />
        <div>
            {user.name}
            <div><img className="owner-stars" src={user.stars} /> {user.ratings} </div>
        </div>
    </div>
)


function ListingPage(item){
    return (
        <div className="listing-container">
            <img className="listing-main-img" src={item.image} />
            <span className='listing-title'>{item.title} </span>
            <span className='listing-price'>{item.price} </span>
            
            <div className="listing-btns">
                <div className="btn-container">
                    <button className="save-btn"></button>
                    <span>Save As</span>
                </div>
                <div className="btn-container">
                    <button className="req-btn"></button>
                    <span>Request Booking</span>
                </div>
            </div>

            <hr></hr>

            <span className="label">Description</span>
            <span>{item.description}</span>
                
            <hr></hr>

            <OwnerCard {...item.owner} />
            
        </div>
    );
}


export default ListingPage
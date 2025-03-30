import Header from "../components/listing/Header.js";
import Item from "../components/listing/Item.js"


    import loungeChair1 from "../components/listing/loungeChair1.png"
import defaultProfile from "../assets/defaultProfile.png"

const tempItem = {
    title: "Eames Lounge Chairs",
    images: [loungeChair1, loungeChair1, loungeChair1, loungeChair1, loungeChair1],
    price: "$75 CAD day",
    securityDeposit: "$50 CAD",
    availablity: "n/a",
    owner: { 
        profilePicture: defaultProfile, 
        name: "bella_cho", 
        phoneNumber: "(647)-554-7436", 
        emailAddress: "bella_cho1@gmail.com"
    },
    description: "I’ve been collecting Eames Chairs since 2016 and I thought I could make a quick buck by renting them out. If you need one for home staging, photoshoots and more, feel free to make a reservation and we’ll be in touch!"
}


function ListingPage(){
    return (
        <>
            <Header />
            <Item item={tempItem}/>
        </>
    );
}


export default ListingPage;
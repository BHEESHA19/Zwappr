import Header from "../components/home/Header.js"
import FiltersBar from "../components/home/FiltersBar.js"
import Listings from "../components/home/Listings.js"
import "../styles.css"


function HomePage(){
    return (
        <>
            <Header />
            <FiltersBar />
            <Listings />
            
        </>
    );
}


export default HomePage;
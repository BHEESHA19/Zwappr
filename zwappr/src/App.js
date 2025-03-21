import './styles/App.css';
import ListingPage from "./pages/ListingPage"
import temp_listing from "./assets/temp_listing.png"
import one_star from "./assets/one_star.png"
import default_pfp from "./assets/default_pfp.png"

const user = {
  profile_image: default_pfp,
  stars: one_star,
  ratings: "1.0 (10 reveiws)",
  name: "John Doe"
};

const listing = {
  image: temp_listing,
  title: "Used PS4",
  price: "$20/day",
  description: "PS4 with controller, hdmi, power cable, and games in good condition.",
  owner: user
};



function App() {
  return (
    <div className="App">
      <header className="App-header">
        ZWAPPR
      </header>

      <ListingPage {...listing}/>
    </div>
  );
}

export default App;

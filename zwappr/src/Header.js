
import Logo from "../Logo.js"
import ProfilePicture from "../ProfilePicture"
import backArrow from "../../assets/backArrow.png"
import defaultProfile from "../../assets/defaultProfile.png"
function Header(){
    return (
        <div class="header">
            <BackButton />
            <Logo />
            <ProfilePicture picture={defaultProfile} />
        </div>
    );
}


function BackButton() {
    return (
        <button class="back-button" style={{backgroundImage: `url(${backArrow})`}}></button>
    )
}

export default Header;
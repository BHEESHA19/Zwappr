


function ProfilePicture({ picture }) {
    return (
        <div class="profile-picture-container">
            <button>
                <img src={picture} />
            </button>
        </div>
    );
}

export default ProfilePicture;
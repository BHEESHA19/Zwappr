import React, { useEffect, useState } from 'react';
import { isLoggedIn, removeUserSession } from './AuthServices';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
    const [allListings, setAllListings] = useState([]);
    const [displayedListings, setDisplayedListings] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');




    useEffect(() => {
        getAllListings(); // Fetch movie cards on mount
    }, []);

  useEffect(() => {
    const form = document.querySelector('#upload-form');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const files = form.querySelector('input[name="files"]').files;
        for (const file of files) {
          formData.append('files', file);
        }

        try {
          const response = await fetch(`http://localhost:5001/uploadToCloudinary`, {
            method: 'POST',
            body: formData,
          });
          const result = await response.json();
          console.log(result);
          if (response.ok) {
            alert('Post Created Successfully!');
          } else {
            alert('Error creating post: ' + result.message);
          }
        } catch (error) {
          alert('Error creating post: ' + error.message);
        }
      });
    }

    // Cleanup the event listener when the component unmounts
    return () => {
      if (form) {
        form.removeEventListener('submit', () => {});
      }
    };
  }, []); // Empty dependency array ensures this runs only once after the component mounts


  const navigate = useNavigate();
  const handleLogout = () => {
    removeUserSession(); // Remove user session
    navigate('/'); // Redirect to the home page or login page
  };


  async function getAllListings (){
    try{
        const response = await fetch(`http://localhost:5001/getItems`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
        });

        const data = await response.json();
        console.log('Response is HERE:', data);

        if (response.ok) {
            console.log('All Listings retrieved:', data);
            
            // Update the state with the retrieved movie cards
            setAllListings(data.map(listing => ({ ...listing })));
            console.log('All Listings displayed here:', allListings);
            setDisplayedListings(data); 

        } else{
            console.error('Error retrieving movie card:', data.message);
            setError('Error retrieving movie cards :-(');
        }
    
    } catch (error) {
            console.log('An error getting cards occurred. Please try again.');
        }

}

  return (
    <div className="App">
      <h1>Create a new Post</h1>
      <form id="upload-form">
        <label>Title:</label>
        <input type="text" name="title" required />
        <br />

        <label>Category:</label>
        <input type="text" name="category" required />
        <br />

        <label>Description:</label>
        <textarea name="description" rows="5" cols="30" required></textarea>
        <br />

        <label>Price Per Day:</label>
        <input type="text" name="pricePerDay" required />
        <br />

        <label>Upload Files (Images/Videos)</label>
        <input type="file" name="files" multiple required />
        <br />

        <button type="submit">Create Post</button>
      </form>

      {isLoggedIn() && (<button onClick={handleLogout} className="logout_butt">Logout</button>)}
    </div>
  );
}

export default Home;
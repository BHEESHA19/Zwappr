import React, { useEffect, useState } from 'react';
import { isLoggedIn, removeUserSession } from './AuthServices';
import { Link, useNavigate } from 'react-router-dom';
import './home.css';
import { ChakraProvider, IconButton, Input, Select, Button, Alert,AlertIcon, AlertTitle, useDisclosure, Box, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from '@chakra-ui/react';
import { Avatar, AvatarBadge, AvatarGroup } from '@chakra-ui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getUser } from './AuthServices';
import { faThumbsDown, faThumbsUp, faCircleInfo, faPaperPlane, faCircleUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
} from '@chakra-ui/react'


function Home() {
    const [allListings, setAllListings] = useState([]);
    const [displayedListings, setDisplayedListings] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedListing, setSelectedListing] = useState(null);
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEnlargedOpen, onOpen: onEnlargedOpen, onClose: onEnlargedClose } = useDisclosure();
    const [itemDetails, setItemDetails] = useState({
      image_url: '',
      category: '',
      item_name: '',
      price_per_day: '',
      description: '',
      start_date: '',
      end_date: ''
  });

    const usery = getUser().username//sessionStorage.getItem('user')
    console.log(usery)


  
  
  
  //UseEffects////////////////////////////////////////////////////
    useEffect(() => {
        getAllListings(); // Fetch listings on mount
    }, []);

  

  const navigate = useNavigate();
  const handleLogout = () => {
    removeUserSession(); // Remove user session
    navigate('/'); // Redirect to the home page or login page
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === '') {
        setDisplayedListings(allListings);
    } else {
        const filteredListings = allListings.filter(listing =>
            listing.item_name && listing.item_name.toLowerCase().includes(query)
        );
        setDisplayedListings(filteredListings);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setItemDetails(prevDetails => ({
        ...prevDetails,
        [id]: value
    }));
  };

  const handleSubmit = async (e) => {};


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
      <div className='topbar'>
        <div className='titleandlogo'><img width="52" height="52" src="https://img.icons8.com/metro/52/swap.png" alt="swap"/><p id='title'>Zwappr</p></div>
        <div className='searchbar'><Input id='searchbar' focusBorderColor='black' placeholder='Search Listings...' value={searchQuery} onChange={handleSearch}/></div>
        <div className='profileicon'>
        <Popover >
            <PopoverTrigger>
                <Button  _hover={{ bg: '#3eaff6' }} marginTop='5px'backgroundColor=" rgb(80, 78, 78);"><FontAwesomeIcon size="2xl" style={{color: "white",}} icon={faCircleUser} /></Button>
            </PopoverTrigger>
            <PopoverContent width='50vw'backgroundColor=" rgb(80, 78, 78);">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader ><Avatar size='lg'name={usery} src='https://bit.ly/broken-link' /><p id='pruh'><b>Hello, {usery}</b></p><p>Welcome, Let's talk Film!</p></PopoverHeader>
                <PopoverBody>{isLoggedIn() && (<button onClick={handleLogout} className="logout_butt">Logout <FontAwesomeIcon size='sm' icon={faRightFromBracket} style={{color: "white",}} /></button>)}</PopoverBody>
            </PopoverContent>
        </Popover>
        <Popover >
            <PopoverTrigger>
                <Button _hover={{ bg: '#3eaff6' }} className="usecontrol"marginTop='5px'backgroundColor=" rgb(80, 78, 78);"><FontAwesomeIcon icon={faCircleInfo} size="2xl" style={{color: "white",}} /></Button>
            </PopoverTrigger>
            <PopoverContent width='50vw'backgroundColor=" rgb(80, 78, 78);">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Info</PopoverHeader>
                <PopoverBody>
                    <ul>
                        <li>Press the Add Listing button to post a listing.</li>
                        &nbsp;
                        <li>Click on each listing to see more.</li>
                    </ul>
                </PopoverBody>
            </PopoverContent>
        </Popover>
        </div>
      </div>


      <div className='buttons'>
      <Button id='newlisting' color='black' fontSize='14px' colorScheme='white;' onClick={onAddOpen}>+ Add New Listing</Button>
        <div id='filter'>Filter</div>
      </div>


      <div className ='listings'>
        {displayedListings.map((listing) => (
          <div key={listing.id} className='listing'>
            <img src={listing.image_url} alt={listing.title} />
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <p>Price: ${listing.price}</p>
          </div>
        ))}
      </div>





      <Modal id='listing_entry' isOpen={isAddOpen} onClose={onAddClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Add an Item for Rent!</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            
                                <Box id='i_name'>
                                    Item Name:<Input id='item_name' focusBorderColor='black' placeholder='e.g. Camera' value={itemDetails.item_name} onChange={handleChange} />
                                </Box>
                                <Box id='i_price'>
                                    Price Per Day:<Input id='item_price' focusBorderColor='black' placeholder='e.g. 1996' value={itemDetails.price_per_day} onChange={handleChange} />
                                </Box>
                                <Box id='i_category'>
                                    Category: 
                                    <Select id='i_category' focusBorderColor='black' iconSize='20px' className='item_filter' placeholder='None' value={itemDetails.category} onChange={handleChange}>
                                        <option value='Party Supplies'>Party Supplies</option>
                                        <option value='Camera Equipment'>Camera Equipment</option>
                                        <option value='Furniture'>Furniture</option>
                                        <option value='Games'>Games</option>
                                        <option value='Clothing'>Clothing</option>
                                        <option value='Home Decor'>Home Decor</option>
                                        <option value='Camping & Outdoors'>Camping & Outdoors</option>
                                        <option value='Catering Equipment'>Catering Equipment</option>
                                        <option value='Books'>Books</option>
                                        <option value='Other'>Other</option>
                                    </Select>
                                </Box>
                                
                                <Box id='i_img'>
                                    Image:<Input id='item_image' focusBorderColor='black' type='file' focusBorderColor='black' placeholder='' onChange={handleChange} />
                                </Box>
                                <Box id='i_description'>
                                    About:<Input id='description' focusBorderColor='black' placeholder='e.g. Say something about your listing...' value={itemDetails.description} onChange={handleChange} />
                                </Box>

                        
                            {error && (
                                <Alert status='error' mt={4}>
                                    <AlertIcon />
                                    <AlertTitle>{error}</AlertTitle>
                                </Alert>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='black' mr={3} onClick={onAddClose}>
                                Close
                            </Button>
                            <Button
                                id='submit_details'
                                variant='ghost'
                                onClick={handleSubmit}
                                isLoading={isLoading}
                                loadingText='Submitting'
                                spinner={<Spinner size="sm" />}
                            >
                                Submit
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>


    </div>
  );
}

export default Home;
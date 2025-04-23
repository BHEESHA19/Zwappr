import React, { useEffect, useState } from 'react';
import { isLoggedIn, removeUserSession } from './AuthServices';
import axios from 'axios';
import {DateSelector} from './DateSelector';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  const usery = getUser() || {};
  console.log(usery)
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
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('None');
    const toast = useToast();
    const [reservationDetails, setReservationDetails] = useState({
        start_date: null,
        end_date: null,
    });
    const [itemDetails, setItemDetails] = useState({
      username: '',
      email: '',
      image_url: '',
      location: '',
      category: '',
      item_name: '',
      price_per_day: '',
      description: '',
      start_date: null,
      end_date: null
  });

  
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file); // Store the selected file in state
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Validate the form fields
    if (typeof itemDetails.item_name === 'string' && !itemDetails.item_name.trim()) {
        setError('Please enter a name.');
        return;
    }

    if (!itemDetails.category || itemDetails.category === 'None') {
        setError('Please select a category.');
        return;
    }

    if (!itemDetails.location) {
      setError('Please select a location.');
      return;
  }

    if (!itemDetails.start_date) {
        setError('Please select a start date.');
        return;
    }

    if (!itemDetails.end_date) {
        setError('Please select an end date.');
        return;
    }

    if (new Date(itemDetails.start_date) > new Date(itemDetails.end_date)) {
        setError('Start date cannot be later than the end date.');
        return;
    }

    if (!selectedImage) {
        setError('Please select an image.');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        // Creating a FormData object to send the image
        const formData = new FormData();
        formData.append('media', selectedImage);

        // Send the image to the backend
        const response = await axios.post('http://localhost:5001/uploadToCloudinary', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Image uploaded successfully:', response.data.url);

        // Add the uploaded image URL to itemDetails
        const imageUrl = response.data.url;
        const updatedItemDetails = { ...itemDetails, image_url: imageUrl, username: usery.username, user_id: usery.user_id, email: usery.email };

        // Send `updatedItemDetails` to the backend to save the listing
        console.log('Final item details:', updatedItemDetails);

        const response2 = await fetch('http://localhost:5001/addListing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedItemDetails),
        });

        if (response2.ok) {
            console.log('Item details added to database successfully.');
            setMessage('Item added successfully!');
            onAddClose();//modal is closed here and success toast is displayed
            toast({
                title: 'Success',
                description: 'Your Listing has been added',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            getAllListings();
        } else {
            const errorData = await response2.json();
            console.error('Error adding item details:', errorData.message);
            setError('Failed to add item. Image size might be too large. Please try again.');
        }

        setIsLoading(false);
    } catch (error) {
        console.error('Error uploading item:', error);
        setError('Failed to upload item. Please try again.');
        setIsLoading(false);
    }

    setItemDetails({
        username: '',
        email: '',
        image_url: '',
        location: '',
        category: '',
        item_name: '',
        price_per_day: '',
        description: '',
        start_date: null,
        end_date: null
    });
};

const handleFilterChange = (e) => {
  const value = e.target.value;
  setSelectedFilter(value);
  handleFilter(value);
};

const handleFilter = (filter) => {
  let filteredListings = [...allListings];

  if (filter === 'Reserved Items') {
    // Filter listings where the current user's user_id matches the current_renter field
    filteredListings = allListings.filter(
      (listing) => listing.current_renter && listing.current_renter === usery.user_id
    );
    console.log('Reserved items:', filteredListings);
  } else if (filter !== 'None') {
    // Filter listings by category
    filteredListings = allListings.filter((listing) => listing.category === filter);
  }

  // Apply search query filter if applicable
  if (searchQuery !== '') {
    filteredListings = filteredListings.filter((listing) =>
      listing.item_name.toLowerCase().includes(searchQuery)
    );
  }

  setDisplayedListings(filteredListings);
};

const cancelReservation = async () => {
  setIsLoading(true);
  setError('');

  try {
    const reservationData = {
      item_id: selectedListing?.item_id,
      renter_id: usery.user_id,
    };

    const response = await fetch('http://localhost:5001/cancelReservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });

    if (response.ok) {
      console.log('Reservation cancelled successfully.');
      setMessage('Reservation cancelled successfully!');
      toast({
        title: 'Success',
        description: 'Your reservation has been cancelled.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEnlargedClose(); // Close the enlarged listing modal
      setSelectedListing(null); // Reset selected listing
      getAllListings(); // Refresh listings
    } else {
      const errorData = await response.json();
      console.error('Error cancelling reservation:', errorData.message);
      setError('Failed to cancel reservation. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to cancel reservation. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    setError('Failed to cancel reservation. Please try again.');
    toast({
      title: 'Error',
      description: 'Failed to cancel reservation. Please try again.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsLoading(false);
  }
}

const deleteListing = async () => {
  setIsLoading(true);
  setError('');

  try {
    const listingData = {
      item_id: selectedListing?.item_id,
      user_id: usery.user_id,
    };

    const response = await fetch('http://localhost:5001/removeListing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });

    if (response.ok) {
      console.log('Listing deleted successfully.');
      setMessage('Listing deleted successfully!');
      toast({
        title: 'Success',
        description: 'Your listing has been deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEnlargedClose(); // Close the enlarged listing modal
      setSelectedListing(null); // Reset selected listing
      getAllListings(); // Refresh listings
    } else {
      const errorData = await response.json();
      console.error('Error deleting listing:', errorData.message);
      setError('Failed to delete listing. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to delete listing. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (error) {
    console.error('Error deleting listing:', error);
    setError('Failed to delete listing. Please try again.');
    toast({
      title: 'Error',
      description: 'Failed to delete listing. Please try again.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsLoading(false);
  }
}

const enlargeListing = (listing) => {
  setSelectedListing(listing);
  onEnlargedOpen();
};

async function handleSubmitReservation() {
  console.log('Submitting reservation:');
  setIsLoading(true);
  setError('');

  // Validate the reservation dates
  if (!reservationDetails.start_date || !reservationDetails.end_date) {
    setError('Please select both start and end dates.');
    toast({
      title: 'Error',
      description: 'Please select both start and end dates.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    setIsLoading(false);
    return;
  }

  const selectedStartDate = new Date(reservationDetails.start_date);
  const selectedEndDate = new Date(reservationDetails.end_date);
  const listingStartDate = new Date(selectedListing?.start_date);
  const listingEndDate = new Date(selectedListing?.end_date);

  if (selectedStartDate < listingStartDate) {
    setError('Reservation start date cannot be before the listing start date.');
    toast({
      title: 'Error',
      description: 'Reservation start date cannot be before the listing start date.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    setIsLoading(false);
    return;
  }

  if (selectedEndDate > listingEndDate) {
    setError('Reservation end date cannot be after the listing end date.');
    toast({
      title: 'Error',
      description: 'Reservation end date cannot be after the listing end date.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    setIsLoading(false);
    return;
  }

  try {
    // Send reservation details to the backend
    const reservationData = {
      itemowner_id: selectedListing?.user_id,
      item_id: selectedListing?.item_id,
      renter_id: usery.user_id,//renter is the cuurent user
      reservation_start_date: reservationDetails.start_date,
      reservation_end_date: reservationDetails.end_date,
    };

    const response = await fetch('http://localhost:5001/addReservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });

    if (response.ok) {
      console.log('Reservation added successfully.');
      setMessage('Reservation added successfully!');
      toast({
        title: 'Success',
        description: 'Your reservation has been added.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEnlargedClose(); // Close the enlarged listing modal
      setReservationDetails({ start_date: null, end_date: null }); // Reset reservation details
      setSelectedListing(null); // Reset selected listing
      setDisplayedListings(allListings); // Reset displayed listings
      getAllListings(); // Refresh listings
    } else {
      const errorData = await response.json();
      console.error('Error adding reservation:', errorData.message);
      setError('Failed to add reservation. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to add reservation. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (error) {
    console.error('Error submitting reservation:', error);
    setError('Failed to submit reservation. Please try again.');
    toast({
      title: 'Error',
      description: 'Failed to submit reservation. Please try again.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsLoading(false);
  }
}



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
                <PopoverHeader>
                    <Avatar
                        size='lg'
                        name={usery?.username || 'Guest'} // Use 'Guest' if usery.username is undefined
                        src='https://bit.ly/broken-link'
                    />
                    <p id='pruh'><b>Hello, {usery?.username || 'Guest'}</b></p>
                    <p>Welcome!</p>
                </PopoverHeader>
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
        <div id='filter'>Filter
        <Select iconSize='14px' id='filter' placeholder='' onChange={handleFilterChange} bg="white" color="black" border="none">
            <option value='None'>None</option>
            <option value='Reserved Items'>Reserved items</option>
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

        </div>
      </div>


      <div className ='listings_box'>
        <div className='sub_listings_box'>
          {displayedListings.map((listing) => (
            <div key={listing.item_id} onClick={() => enlargeListing(listing)}className='listing'>
            
              <div id='listing_img'>
                <img src={listing.image_url} alt={listing.title} className='listing_image' id='listing_img'/>
              </div>
              <div id='listing_info'>
              <div id='i_name_and_price'><h3>{listing.item_name}</h3> <h3>{listing.price_per_day}</h3> </div>
              <p id='listing_location'>{listing.location}</p>
              <Avatar colorPalette='black' size='2xs'name={listing.username} src='https://bit.ly/broken-link' />&nbsp;<b>{listing.username}</b>


              </div>
              
            </div>
          ))}
        </div>
      </div>




      {/* Add Listing Modal */}
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
                                    Price Per Day ($):<Input id='price_per_day' focusBorderColor='black' placeholder='e.g. 50' value={itemDetails.price_per_day} onChange={handleChange} />
                                </Box>
                                <Box id='i_category'>
                                    Category: 
                                    <Select id='category' focusBorderColor='black' iconSize='20px' className='item_filter' placeholder='None' value={itemDetails.category} onChange={handleChange}>
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

                                <Box id='i_location'>
                                    Location: 
                                    <Select id='location' focusBorderColor='black' iconSize='20px' className='item_location' placeholder='None' value={itemDetails.location} onChange={handleChange}>
                                      <option value="">Select Dorm / Building</option>
                                      <option value="Cascade Hall">Cascade Hall</option>
                                      <option value="Aurora Hall">Aurora Hall</option>
                                      <option value="Olympus Hall">Olympus Hall</option>
                                      <option value="Yamnuska Hall">Yamnuska Hall</option>
                                      <option value="Global Village">Global Village</option>
                                      <option value="Kananaskis Hall">Kananaskis Hall</option>
                                      <option value="Rundle Hall">Rundle Hall</option>
                                      <option value="Crowsnest Hall">Crowsnest Hall</option>
                                      <option value="International House">International House</option>
                                      <option value="Varsity Courts">Varsity Courts</option>
                                    </Select>
                                </Box>
                                
                                <Box id="i_img">
                                    Image:
                                    <Input
                                        id="item_image"
                                        focusBorderColor="black"
                                        type="file"
                                        onChange={handleImageChange} // Capture the selected image into a useState
                                    />
                                </Box>
                                <Box id='i_description'>
                                    About:<Input id='description' focusBorderColor='black' placeholder='e.g. Say something about your listing...' value={itemDetails.description} onChange={handleChange} />
                                </Box>
                                <Box id='i_start_date'>
                                    Start Date:
                                    <DatePicker
                                        selected={itemDetails.start_date}
                                        onChange={(date) => setItemDetails(prevDetails => ({
                                            ...prevDetails,
                                            start_date: date.toISOString() // Save as ISO string
                                        }))}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select a start date"
                                        focusBorderColor='black'
                                    />
                                </Box>
                                <Box id='i_end_date'>
                                    End Date:
                                    <DatePicker
                                        selected={itemDetails.end_date}
                                        onChange={(date) => setItemDetails(prevDetails => ({
                                            ...prevDetails,
                                            end_date: date.toISOString() // Save as ISO string
                                        }))}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select an end date"
                                        focusBorderColor='black'
                                    />
                                </Box>

                        
                            {error && (
                                <Alert status='error' mt={4}>
                                    <AlertIcon />
                                    <AlertTitle>{error}</AlertTitle>
                                </Alert>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={onAddClose}>
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


      {/* Enlarged Listing Modal */}

      <Modal className='enlargedCard' isOpen={isEnlargedOpen} onClose={onEnlargedClose} size='lg'>
                    <ModalOverlay />
                    <ModalContent bg="white" color="black" overflowY='scroll' maxWidth='100%' maxHeight='80%'>
                        <ModalHeader display="flex" flexDirection="column" alignItems='center' textAlign="center"><div className='titleandlogo'><img width="52" height="52" src="https://img.icons8.com/metro/52/swap.png" alt="swap"/><p id='title'>Zwappr</p></div></ModalHeader>
                        <ModalCloseButton />
                        <ModalBody display="flex" flexDirection="row" alignItems="center" marginLeft="5%" marginRight="5%" height="fit-content" overflow-y="scroll" justifyContent="space-evenly">
                            <div id='left_side'>
                              <p id='listing_name'>{selectedListing?.item_name}</p>
                              <img src={selectedListing?.image_url} alt={selectedListing?.item_name} className='listing_image' id='enlarged_img'/>
                              <Avatar colorPalette='black' size='md'name={selectedListing?.username} src='https://bit.ly/broken-link' />&nbsp;<h2><b>{selectedListing?.username}</b></h2>
                              <p id='listing_description'>{selectedListing?.description}</p>
                              <p id='listing_email'><b>Email: {selectedListing?.email}</b></p>
                            </div>
                            <div id='right_side'>
                            <div id='reservation_details'>
                              <h2><b>${selectedListing?.price_per_day}</b>/day</h2>
                              <p id='listing_location'><b>Location:</b> {selectedListing?.location}</p>
                              <p id='listing_dates'>
                                <b>Available From:</b> {new Date(selectedListing?.start_date).toLocaleDateString('en-GB')} 
                                <b>To:</b> {new Date(selectedListing?.end_date).toLocaleDateString('en-GB')}
                              </p>
                              <div>
                                From:
                                <DatePicker
                                  selected={reservationDetails.start_date}
                                  onChange={(date) => setReservationDetails(prevDetails => ({
                                    ...prevDetails,
                                    start_date: date.toISOString() // Save as ISO string
                                  }))}
                                  dateFormat="yyyy-MM-dd"
                                  placeholderText="Select a start date"
                                  focusBorderColor='black'
                                />
                              </div>
                              <div>
                                To:
                                <DatePicker
                                  selected={reservationDetails.end_date}
                                  onChange={(date) => setReservationDetails(prevDetails => ({
                                    ...prevDetails,
                                    end_date: date.toISOString() // Save as ISO string
                                  }))}
                                  dateFormat="yyyy-MM-dd"
                                  placeholderText="Select an end date"
                                  focusBorderColor='black'
                                />
                              </div>

                              {/* submit_reservation element rendered only if current user is not the smae as owner of item */}
                              {selectedListing?.isBooked === false && usery.user_id !== selectedListing?.user_id && (
                                <div id='submit_reservation' className='reservation_options'>
                                  <Button
                                    id='submit_reservation'
                                    variant='ghost'
                                    onClick={() => handleSubmitReservation()}
                                    isLoading={isLoading}
                                    loadingText='Submitting'
                                    spinner={<Spinner size="sm" />}
                                  >
                                    Reserve
                                  </Button>
                                </div>
                              )}

                              {/* item_reserved element is displayed only if the isBooked field for the item is true */}
                              {selectedListing?.isBooked === true && (
                                <div id='item_reserved' className='reservation_options'>
                                  Item Currently Reserved
                                </div>
                              )}

                              {/* cancel_reservation element is displayed if the current user owns the selectedListing or if the current user is currently rennting the item*/}
                              {selectedListing?.isBooked === true && 
                                (usery.user_id === selectedListing?.current_renter || usery.user_id === selectedListing?.user_id) && (
                                <div id='cancel_reservation' className='reservation_options' onClick={cancelReservation}>
                                  Cancel Current Reservation
                                </div>
                              )}

                              {/* delete_listing element is displayed only if the current user owns the item */}
                              {usery.user_id === selectedListing?.user_id && (
                                <div id='delete_listing' className='reservation_options' onClick={deleteListing}>
                                  Delete Listing
                                </div>
                              )}
                            </div>

                            </div>
                        

                        </ModalBody>
                            
                        <ModalFooter>
                            <Button colorScheme="black" mr={3} onClick={onEnlargedClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>


    </div>
  );
}

export default Home;
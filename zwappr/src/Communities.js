import React, { useEffect, useState } from 'react';
import './Communities.css';
import { Button } from '@chakra-ui/react';

const Communities = () => {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('user_id');

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5001/getCommunityPosts');
      const data = await response.json();
      console.log("Fetched posts: ", data); // 🔍 Add this line
      setPosts(data);
      console.log('Fetched community posts:', data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };
  

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async () => {
    if (!message || !contactInfo) return;
    try {
      const response = await fetch('http://localhost:5001/createCommunityPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username: username,
          message: message,
          contact_info: contactInfo
        })
      });

      if (response.ok) {
        setSuccessMessage('Post created successfully!');
        setMessage('');
        setContactInfo('');
        fetchPosts();
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  return (
    <div className="community-page">
      <h1>Community Posts</h1>

      <div className="post-box">
        <textarea
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <input
          type="text"
          placeholder="Your contact info"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
        />
        <Button onClick={handleSubmit} colorScheme="blackAlpha">
          Post
        </Button>
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>

      <div className="posts-list">
        {posts
          .sort((a, b) => new Date(b.timestamp.S) - new Date(a.timestamp.S))
          .map((post) => (
            <div className="post" key={post.post_id.S}>
              <div className="user">👤 {post.username.S}</div>
              <div className="message">{post.message.S}</div>
              <div className="contact">📞 {post.contact_info.S}</div>
              <div className="timestamp">
                {new Date(post.timestamp.S).toLocaleString()}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Communities;

import React, { useState, useEffect } from 'react';
import { Button } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import './index.css';
import { isLoggedIn, setUserSession } from './AuthServices';
import { Link } from 'react-router-dom';

const LoginForm = () => {
    const [message, setMessage] = useState('');
  
    const handleLogin = async () => {
        console.log('Login button clicked');
      const username = document.querySelector('#login-username').value;
      const password = document.querySelector('#login-password').value;
  
      try {
        const response = await fetch(`http://localhost:5001/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });
  
        const data = await response.json();
        if (response.ok) {
          setUserSession(data.user, data.token); // Save user session
          setMessage('Login successful!');
          // Optionally, redirect or update state as needed
        } else {
          setMessage(data.message || 'Login failed. Please check your credentials.');
        }
      } catch (error) {
        setMessage('An error occurred. Please try again.');
      }
    };
  
    return (
      <div className='form_container'>
        <h2 className='fom_title'>Log In</h2>
        <input className='form_inpt' type="text" id="login-username" placeholder="Username" />
        <input className='form_inpt' type="password" id="login-password" placeholder="Password" />
        <Button _hover={{ bg: '#3eaff6' }} backgroundColor='black' color='white'className='fom_act' onClick={handleLogin}>Log In</Button>
        {message && <p>{message}</p>}
      </div>
    );
  };
  
  const RegisterForm = () => {
      const [message, setMessage] = useState('');
    
      const handleRegister = async () => {
        const username = document.querySelector('#register-username').value;
        const email = document.querySelector('#register-email').value;
        const password = document.querySelector('#register-password').value;
    
        try {
          const response = await fetch('http://localhost:5001/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
          });
    
          const data = await response.json();
          if (response.ok) {
            setMessage('Registration successful!');
            // Optionally, redirect or update state as needed
          } else {
            setMessage(data.message || 'Registration failed. Please try again.');
          }
        } catch (error) {
          setMessage('An error occurred. Please try again.');
        }
      };
    
      return (
        <div className='form_container'>
          <h2 className='fom_title'>Register</h2>
          <input className='form_inpt' type="text" id="register-username" placeholder="Username" />
          <input className='form_inpt' type="text" id="register-email" placeholder="Email" />
          <input className='form_inpt' type="password" id="register-password" placeholder="Password" />
          <Button _hover={{ bg: '#3eaff6' }} backgroundColor='black' color='white' className='fom_act' onClick={handleRegister}>Register</Button>
          {message && <p>{message}</p>}
        </div>
      );
  };

const Entry = () => {
  



    const [currentForm, setCurrentForm] = useState('login');
    // const navigate = useNavigate();


    const renderForm = () => {
        console.log('Current Form:', currentForm);
      switch (currentForm) {
        case 'register':
          return <RegisterForm />;
        default:
          return <LoginForm />;
      }
    };


    return (
        <div className='fullpage'>
         <div className='top_help'><nav className='navig'>
                    
                    
                    <b>Zwappr</b>
                    
                </nav>
          </div>
         
          
          {!isLoggedIn() && (
            <>
              <div className="form-toggle">
                <button className='form_butns' onClick={() => setCurrentForm('register')}>Register</button>&nbsp;
                <button className='form_butns' onClick={() => setCurrentForm('login')}>Login</button>
              </div>
              <div className="form-container">
                {renderForm()}
              </div>
            </>
          )}
          <div>
        
            
            <Link to="/Home" ><Button id='get_start'>Get Started &nbsp; <FontAwesomeIcon size='sm' icon={faRightFromBracket} style={{color: "white",}} /></Button></Link>
           

            
          </div>
        </div>
      );



}



  

export default Entry;

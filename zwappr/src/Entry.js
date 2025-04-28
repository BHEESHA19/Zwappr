import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUserSession } from './AuthServices';
import './Entry.css';

const Entry = () => {
  const [currentForm, setCurrentForm] = useState('login');
  const navigate = useNavigate();

  return (
    <div className="fullpage">
      <div className="form-container">
        {currentForm === 'login' ? (
          <LoginForm switchForm={() => setCurrentForm('register')} navigate={navigate} />
        ) : (
          <RegisterForm switchForm={() => setCurrentForm('login')} navigate={navigate} />
        )}
      </div>
    </div>
  );
};

const LoginForm = ({ switchForm, navigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserSession(data.user, data.token);
        navigate('/home');
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      setMessage('An error occurred. Try again.');
    }
  };

  return (
    <>
      <div className="form-title">Login to Zwappr</div>
      <input
        className="form-input"
        type="text"
        placeholder="Username or Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="form-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="form-btn" onClick={handleLogin}>Login</button>
      {message && <p>{message}</p>}
      <div className="toggle-link">
        Don't have an account? <span onClick={switchForm}>Sign up</span>
      </div>
    </>
  );
};

const RegisterForm = ({ switchForm, navigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          firstName, 
          lastName, 
          address 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserSession(data.user, data.token);
        navigate('/profile', { state: { user: data.user } });
      } else {
        setMessage(data.message || 'Registration failed.');
      }
    } catch (error) {
      setMessage('An error occurred. Try again.');
    }
  };

  return (
    <>
      <div className="form-title">Sign up for Zwappr</div>

      <input
        className="form-input"
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        className="form-input"
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <input
        className="form-input"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="form-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="form-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        className="form-input"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      >
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
      </select>

      <button className="form-btn" onClick={handleRegister}>Register</button>
      {message && <p>{message}</p>}

      <div className="toggle-link">
        Already have an account? <span onClick={switchForm}>Login</span>
      </div>
    </>
  );
};

export default Entry;

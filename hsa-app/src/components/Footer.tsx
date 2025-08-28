import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.section}>
            <h3>HSA Service</h3>
            <p>Your Health Savings Account partner</p>
          </div>
          
          <div style={styles.section}>
            <h3>Quick Links</h3>
            <ul style={styles.linkList}>
              <li>
                <Link to="/" style={styles.link}>Home</Link>
              </li>
              <li>
                <Link to="/dashboard" style={styles.link}>Dashboard</Link>
              </li>
              <li>
                <Link to="/testing" style={styles.link}>Submit a Transaction</Link>
              </li>
            </ul>
          </div>
          
          <div style={styles.section}>
            <h3>Contact</h3>
            <p>Email: support@hsaservice.com</p>
            <p>Phone: 1-800-HSA-HELP</p>
          </div>
        </div>
        
        <div style={styles.copyright}>
          &copy; {currentYear} HSA Service. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    padding: '2rem 0',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  content: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  section: {
    flex: '1',
    minWidth: '250px',
    margin: '0 1rem 1rem 0',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    transition: 'color 0.3s',
    ':hover': {
      color: '#3498db',
    },
  },
  copyright: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '1rem',
    textAlign: 'center' as 'center',
    fontSize: '0.9rem',
  },
};

export default Footer;

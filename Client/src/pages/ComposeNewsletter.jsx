import { useState } from 'react';
import axios from 'axios';

function ComposeNewsletter() {
  const [subject, setSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [error, setError] = useState(null);
  const [isNewsletterSent, setIsNewsletterSent] = useState(false); // Add state for success message

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/send-newsletter', { // Updated the API endpoint
        subject,
        newsletterContent,
      });

      if (response.status === 200) {
        // Handle a successful newsletter submission (e.g., show a success message)
        setIsNewsletterSent(true); // Set success message to true
      } else {
        setError('Newsletter sending failed. Please try again later.');
      }
    } catch (err) {
      setError('Newsletter sending failed. Please try again later.');
    }
  };

  return (
    <div>
      <h1>Compose Newsletter</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="subject">Subject:</label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <label htmlFor="newsletterContent">Newsletter Content (HTML):</label>
        <textarea
          id="newsletterContent"
          name="newsletterContent"
          required
          value={newsletterContent}
          onChange={(e) => setNewsletterContent(e.target.value)}
        ></textarea>

        <div id="email-error" style={{ color: 'red' }}>
          {error}
        </div>

        <input type="submit" value="Send Newsletter" />

        {isNewsletterSent && (
          <div style={{ color: 'green', marginTop: '10px' }}>
            Newsletter sent successfully!
          </div>
        )}
      </form>
    </div>
  );
}

export default ComposeNewsletter;

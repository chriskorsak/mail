document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // submit email form start
  document.querySelector('form').onsubmit = () => {
    //get values from form after submitting email
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
    //redirect to sent mailbox after sending email
    load_mailbox('sent');

    return false;
  }
  //submit email form end

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //fetch emails from api
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
  // 'emails' is an array of objects. each object is an 'email'
    for (let i = 0; i < emails.length; i++) {
      // extract values from emails object
      const sender = emails[i]['sender'];
      const subject = emails[i]['subject'];
      const time = emails[i]['timestamp'];
      
      const email = document.createElement('div');
      email.innerHTML = `${sender} ${subject} ${time}`;
      document.querySelector('#emails-view').append(email);
    }  
  });
}
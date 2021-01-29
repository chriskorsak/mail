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
  //clear out messages div if message had been loaded
  document.querySelector('#message-view').innerHTML = "";

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  //clear out messages div if message had been loaded
  document.querySelector('#message-view').innerHTML = "";

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
      // extract values from object in 'emails' array.
      const id = emails[i]['id'];
      const sender = emails[i]['sender'];
      const recipients = emails[i]['recipients'];
      const subject = emails[i]['subject'];
      const time = emails[i]['timestamp'];
      //'read' value is true or false (ex. has email been read yet?)
      const read = emails[i]['read'];
      // const archived = emails[i]['archived'];

      // create div element (email message listed in mailboxes)
      const email = document.createElement('div');
      email.classList.add("message");
      // add class if email has been read or email displayed in sent mailbox
      if (read || mailbox === 'sent') {
        email.classList.add("email-read");
      }

      // add click event handler to div (aka email)
      email.addEventListener('click', function() {
        // run viewEmail function when message clicked
        viewEmail(id);
      });
      
      // render different values based on the mailbox
      if (mailbox === 'sent') {
        email.innerHTML = `<span>${recipients}</span> <span>${subject}</span> <span>${time}<span>`;
      } else {  
        email.innerHTML = `<span>${sender}</span> <span>${subject}</span> <span>${time}<span>`;
      }

      // append email
      document.querySelector('#emails-view').append(email);
    }  
  });
}

function viewEmail(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // extract values from object in email array (sender, recipients, subject, timestamp, and body.)
    const sender = email['sender'];
    const recipients = email['recipients'];
    const subject = email['subject'];
    const time = email['timestamp'];
    const body = email['body'];
    const archived = email['archived'];

    // create archive button for email
    const archiveButton = document.createElement("button");
    archiveButton.classList.add('btn', 'btn-sm', 'btn-outline-primary');
    if (archived === false) {
      archiveButton.innerHTML = "Archive";
    } else {
      archiveButton.innerHTML = "Unarchive";
    }

    archiveButton.addEventListener('click', function() {
      // archive email when button clicked
      archiveEmail(id, archived);
    });

    // get div element and populate with buttons and values of email
    const message = document.querySelector('#message-view');
    message.innerHTML = `<p>${sender}</p> <p>${recipients}</p> <p>${subject}</p> <p>${time}<p> <p>${body}</p>`;
    message.prepend(archiveButton)
  });
  //mark the email as read using a put request
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  // Show message view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'block';
}

function archiveEmail (id, archived) {
  if (archived === false) {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    .then(function() {
      load_mailbox('inbox')
    })
  } else {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    .then(function() {
      load_mailbox('inbox')
    })
  }
}
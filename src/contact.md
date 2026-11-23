---
layout: layouts/base.njk
title: Contact Sock Guide
description: How to report an error in a guide, suggest a sock or a topic, or ask about advertising on Sock Guide.
---
# Contact Sock Guide

Questions, corrections and guide suggestions are welcome.

Spotted a wrong price or a changed specification? Have a sock question no guide here answers yet, or a category you would like us to cover next? Write to us — reader corrections are how these guides stay accurate.

Email: [hello@sockguide.com](mailto:hello@sockguide.com)

Or use the form below — it opens your email app with your message addressed and ready to send.

<form class="contact-form" id="contactForm" action="mailto:hello@sockguide.com?subject=Sock%20Guide%20%E2%80%94%20message%20from%20the%20Contact%20page" method="post" enctype="text/plain">
<label for="cfName">Your name</label>
<input type="text" id="cfName" name="name">
<label for="cfEmail">Your email</label>
<input type="email" id="cfEmail" name="email">
<label for="cfMessage">Message</label>
<textarea id="cfMessage" name="message"></textarea>
<button class="btn" type="submit">Send message</button>
</form>

<p class="form-note" hidden>Your email app should now open with your message ready — just press send there.</p>

<script>
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var name = document.getElementById('cfName').value.trim();
  var email = document.getElementById('cfEmail').value.trim();
  var message = document.getElementById('cfMessage').value.trim();
  var body = 'Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message;
  window.location.href = 'mailto:hello@sockguide.com?subject=' + encodeURIComponent('Sock Guide — message from the Contact page') + '&body=' + encodeURIComponent(body);
  var note = document.querySelector('.form-note');
  if (note) note.hidden = false;
});
</script>

---
layout: layouts/page.njk
title: Contact Sock Guide
description: How to report an error in a guide, suggest a sock or a topic, or ask about advertising on Sock Guide.
crumbHome: true
crumbText: "Contact"
pubDate: "Questions, corrections and guide suggestions are welcome."
---
Spotted a wrong price or a changed specification? Have a sock question no guide here answers yet, or a category you would like us to cover next? Write to us — reader corrections are how these guides stay accurate.

**Email:** [hello@sockguide.com](mailto:hello@sockguide.com)

Or use the form below — it opens your email app with your message addressed and ready to send.

<form class="contact-form" id="contactForm">
<label for="cfName">Your name<input type="text" id="cfName" name="name" autocomplete="name"></label>
<label for="cfEmail">Your email<input type="email" id="cfEmail" name="email" required autocomplete="email"></label>
<label for="cfMessage">Message<textarea id="cfMessage" name="message" required></textarea></label>
<div><button class="btn-black" type="submit">Send message</button></div>
</form>

<p class="news-done" id="contactDone" role="status">Your email app should now open with your message ready — just press send there.</p>

<script>
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var name = document.getElementById('cfName').value.trim();
  var email = document.getElementById('cfEmail').value.trim();
  var message = document.getElementById('cfMessage').value.trim();
  var body = 'Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message;
  window.location.href = 'mailto:hello@sockguide.com?subject=' + encodeURIComponent('Sock Guide — message from the Contact page') + '&body=' + encodeURIComponent(body);
  var note = document.getElementById('contactDone');
  if (note) note.classList.add('show');
});
</script>

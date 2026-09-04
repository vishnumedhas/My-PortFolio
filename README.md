# Vishnu Medhas — Portfolio

This site is a personalized version of a friend's portfolio template, filled in with your resume details (Java/Spring Boot skills, Dhee Coding Lab internship, Employee Management System & E-Commerce projects, education, etc.).

## Before you deploy — a few things to finish

1. **Contact form (EmailJS)**
   The "Send Message" button uses [EmailJS](https://www.emailjs.com) to email you form submissions. It won't work until you:
   - Create a free EmailJS account
   - Create an Email Service + Email Template
   - Replace `YOUR_EMAILJS_PUBLIC_KEY` in `index.html` and `contact.html`
   - Replace `YOUR_SERVICE_ID` and `YOUR_TEMPLATE_ID` in `script.js` (`sendEmail()` function)

   The **WhatsApp** button already works out of the box — it's set to your number (+91 6300823626).

2. **Project GitHub links**
   The two project cards currently link to your GitHub profile (`github.com/vishnumedhas`) since specific repo links weren't available. Once you push each project's code, update the `href` in the `.project-links` section of `index.html` to point at the exact repo (e.g. `https://github.com/vishnumedhas/employee-management-system`).

3. **Resume file**
   `Vishnu_Medhas_Resume.pdf` is your uploaded resume, already wired up to the "Download CV" button and nav "Resume" link. Replace this file (keeping the same filename) whenever you update your resume.

4. **More certificates**
   Only your Java Full Stack Developer virtual internship certificate (AICTE EduSkills) is linked so far, plus a placeholder for your in-progress Dhee Coding Lab course. Add more `badge-card` entries in the Certifications section of `index.html` as you complete more courses.

## What was changed from the original template

- All personal info (name, bio, education, experience, skills, projects, contact details, social links) replaced with yours, pulled from your resume PDF.
- Removed the friend's Firebase-based "admin / demo access request" system (`admin.html`, `admin.js`, `access.js`, `firebase-config.js`) since it was tied to his personal Firebase project and isn't something you need — project cards now link straight to GitHub.
- Replaced his photo with yours (`your-image.jpg`).
- Certificates/Achievements sections show your AICTE EduSkills Java Full Stack internship certificate plus what's on your resume (Full Stack Development course in progress, teamwork/leadership).

## Running locally

No build step needed — it's plain HTML/CSS/JS. Just open `index.html` in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying

Any static host works — GitHub Pages, Netlify, Vercel, etc. Just upload the whole folder (minus this README if you like).

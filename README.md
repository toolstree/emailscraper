[README.md](https://github.com/user-attachments/files/31750050/README.md)
# Email Extractor & Contact Organizer - Chrome Extension

This is a **store-compliant** alternative to the scraper in the screenshot.

### Features
- Extract emails from the current active tab (one click, no background scraping)
- Organize contacts by:
  - Age
  - Email
  - Gender (Male/Female/Other)
  - Married/Unmarried status (Married/Unmarried/Single/Divorced)
  - Country + City
- Search, filter, sort
- Add/edit contacts manually
- Import CSV / Export CSV

### CSV Format
`name,email,age,gender,marital,country,phone,city`

### Install for Dev / Upload to GitHub
1. Zip the folder contents (manifest.json, popup.html, popup.css, popup.js, background.js, icon128.png)
2. Push to GitHub repo
3. Load in Chrome: chrome://extensions -> Developer mode -> Load unpacked

### Why no Instagram follower scraping?
Chrome Web Store policy + Instagram ToS prohibit automated scraping of followers/following for emails. This version avoids bans and legal risk. If you own the data, import it via CSV.

License: MIT

# YelpCamp ⛺

A full-stack campground review app built as part of Colt Steele's Web Developer Bootcamp. Users can browse, create, review, and geolocate campgrounds.

**Live Demo:** [your-render-link.onrender.com](https://your-render-link.onrender.com) _(replace after deploy)_

[YelpCamp Banner](https://res.cloudinary.com/demo/image/upload/v1/yelpcamp-banner.png)

---

### Features

- **Campground CRUD** - Create, read, update, delete campgrounds
- **Authentication & Authorization** - Register / Login with Passport.js, only owners can edit/delete
- **Reviews & Ratings** - Leave reviews, average rating display
- **Image Uploads** - Multiple image upload to Cloudinary (no local file storage)
- **Maps** - Cluster map + individual campground map with Mapbox GL
- **Security** - Helmet, mongo sanitize, JOI validation, connect-mongo session store
- **Responsive UI** - Bootstrap 5

### Tech Stack

- **Runtime:** Node.js 20+ (ESM - `type: module`)
- **Server:** Express.js, method-override, ejs-mate
- **Database:** MongoDB Atlas + Mongoose
- **Images:** Cloudinary + Multer
- **Maps:** Mapbox SDK
- **Auth:** Passport, passport-local, express-session + connect-mongo
- **Deploy:** Render (web service) + Atlas (DB) - 100% free tier

### Quick Start

#### 1. Clone & Install

```bash
git clone https://github.com/yourusername/yelpcamp.git
cd yelpcamp
npm install
```

#### 2. Environment Variables

Create a `.env` file in root:

```env
DB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/yelpcamp?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
MAPBOX_TOKEN=your_mapbox_token
SECRET=your_session_secret
NODE_ENV=development
```

> See `.env.example` for template.

#### 3. Run Locally

```bash
# server.js runs the app locally (app.js exports app for Render/Vercel)
npm run dev   # nodemon server.js
# or
npm start     # node server.js
```

Visit `http://localhost:3000`

### Project Structure

```
.
├── app.js              # Express app setup (exports app, no listen)
├── server.js           # Local dev entry - app.listen()
├── api/
│   └── index.js        # Vercel entry (if deploying to Vercel)
├── models/
│   ├── campground.js
│   ├── review.js
│   └── user.js
├── routes/
│   ├── campgrounds.js
│   ├── reviews.js
│   └── users.js
├── views/
├── public/
├── middleware.js       # isLoggedIn, isAuthor, isReviewAuthor
├── utils/
└── vercel.json
```

**Why `app.js` + `server.js` split?** Render needs a long-running server, Vercel needs an exported handler. This split works for both.

### Deployment

#### Render (Recommended for portfolio)

- Build Command: `npm install`
- Start Command: `npm start`
- Add env vars in Render Dashboard > Environment
- Free tier: spins down after 15 min idle (~60s cold start) - normal for free tier

#### Vercel (Alternative)

This repo includes `api/index.js` and `vercel.json` rewrites for Vercel serverless.

### Security Notes

- `npm audit --production` = 0 vulnerabilities (dev audit may show `braces/chokidar` false-positive from nodemon - fixed via `overrides` to `chokidar@4`)
- No local file writes - all uploads go to Cloudinary (required for Render/Vercel ephemeral FS)

### Roadmap / What I Learned

- [x] ESM `import` syntax throughout (`import methodOverride from 'method-override'`)
- [x] Middleware pattern for auth (`isLoggedIn`, `isAuthor`)
- [x] JOI validation + error handling
- [ ] Star rating UI polish
- [ ] Pagination

### Author

**Deepak Pun** - Course project for portfolio showcase.

---

> Built while learning. Not affiliated with Yelp.

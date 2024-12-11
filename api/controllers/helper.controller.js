
import axios from "axios";

export const getImgFromExternal = async (req, res) => {
  const imageUrl = 'https://pic2.99.co/v3/3JTw8pg8ci8oFMqjAr3x5L?text=Henry+Tan&sampling=lanczos&version=1&height=600&width=800&mode=fill&quality=80&convert_if_png=true&is_watermark=True&signature=0822289cdc353adee9f5a42f92c9a5c981b009b5';
  console.log("url: ", imageUrl);
  axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'stream',
  })
    .then(response => {
      res.setHeader('Content-Type', 'image/jpeg'); // or the appropriate MIME type
      response.data.pipe(res);
    })
    .catch(err => res.status(500).send('Error fetching image'));
};

const appSettings = {
  aboutUs: {
    aboutUs: `
    <h1>About Us</h1>
    <p>Welcome to our real estate platform! We are dedicated to providing the best experience for buyers, sellers, and agents alike.</p>
    <h2>Our Mission</h2>
    <p>We aim to revolutionize the real estate market with cutting-edge technology, making it easier than ever to find your dream home.</p>
    <h3>Contact Us</h3>
    <p>If you have any questions, feel free to reach out to us at <strong>support@realestate.com</strong>.</p>
  `,
    website: "https://example.com",
  },
  privacyPolicy: {
    privacyPolicy: `<h1>Privacy Policy</h1>
<p>We at <strong>Your Company Name</strong> are committed to protecting your privacy. This policy outlines the information we collect, how we use it, and your rights.</p>

<h2>Information We Collect</h2>
<p>We may collect your name, contact details, property information, and browsing behavior to provide and improve our services.</p>

<h2>How We Use Your Information</h2>
<p>We use your data to facilitate transactions, send updates, and improve your experience. Your data is shared only with trusted partners or to comply with legal obligations.</p>

<h2>Your Rights</h2>
<p>You can access, update, or delete your data and opt out of marketing communications by contacting us.</p>

<h2>Contact Us</h2>
<p>For questions, email us at <strong>privacy@yourcompany.com</strong>.</p>
`,
  },
  userTerms: {
    userTerms: `<h1>Terms of Service</h1>
<p>By using <strong>Your Company Name</strong>, you agree to these terms. If you disagree, please discontinue use.</p>

<h2>Eligibility</h2>
<p>Users must be 18+ and legally able to enter into contracts.</p>

<h2>Use of Services</h2>
<p>You agree to use our platform lawfully and not engage in disruptive or fraudulent activities.</p>

<h2>Account Responsibility</h2>
<p>You are responsible for keeping your login details secure and notifying us of unauthorized access.</p>

<h2>Liability</h2>
<p>We are not liable for any damages arising from using our platform or relying on its content.</p>

<h2>Contact Us</h2>
<p>For queries, email us at <strong>support@yourcompany.com</strong>.</p>
`,
  },
  settings: {
    email: "que.quao126@gmail.com",
    language: "en",
  },
};

export const getAppSettings = async (req, res) => {
  res.json(appSettings.settings);
};

// Get about us
export const getAppSettingsAbout = async (req, res) => {
  res.json(appSettings.aboutUs);
};

// Get privacy policy
export const getAppSettingsPrivacy = async (req, res) => {
  res.json(appSettings.privacyPolicy);
};

// Get user terms
export const getAppSettingsUserterms = async (req, res) => {
  res.json(appSettings.userTerms);
};

const news = [
  {
    id: 1,
    title: 'Breaking News',
    imageName: 'news1.jpg',
    createdDate: new Date().toISOString(),
    content: 'This is a sample news content.',
  },
  {
    id: 2,
    title: 'Tech Updates',
    imageName: 'tech.jpg',
    createdDate: new Date().toISOString(),
    content: 'Latest trends in technology.',
  },
];

// Get all news
export const getNews = async (req, res) => {
  res.json(news);
};
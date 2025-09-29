const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
require('dotenv').config();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())

// Import routes
const adminRoute = require('./routes/admin.route');
const userRoute = require('./routes/user.route');
const trackOrderRoute = require('./routes/trackOrder.route');

// Use routes
app.use(`/${process.env.ADMIN_ROUTE_NAME || 'admin'}`, adminRoute);
app.use('/user', userRoute);
app.use('/track-order', trackOrderRoute);

const URI = process.env.URI
mongoose.connect(URI)
.then((con) =>{
  console.log('mongodb connected successfully');
}).catch((err) =>{
  console.log('error connecting to mongodb', err);
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const subscriptionRoutes = require('./routes/subscriptions');

dotenv.config({
  path:'./config.env'
});
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/subscriptions', subscriptionRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

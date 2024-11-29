//this code to test the format time

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));

// Helper function to convert time to 12-hour format
function convertTo12HourFormat(time) {
  // Check if time is already in 12-hour format
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }

  // Split 24-hour time
  const [hours, minutes] = time.split(':').map(Number);

  // Determine AM/PM
  const amPm = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  const convertedHours = hours % 12 || 12;

  // Format the time
  return `${convertedHours}:${minutes.toString().padStart(2, '0')} ${amPm}`;
}

// Define Schema
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  date: String,
  time: String,
});

// Create Model
const Item = mongoose.model('Item', itemSchema);

// API Endpoints
app.get('/items', async (req, res) => {
  const items = await Item.find();
  // Convert time to 12-hour format for all items
  const formattedItems = items.map(item => ({
    ...item.toObject(),
    time: convertTo12HourFormat(item.time)
  }));
  res.json(formattedItems);
});

app.post('/items', async (req, res) => {
  // Convert time to 12-hour format before saving
  const itemToSave = {
    ...req.body,
    time: convertTo12HourFormat(req.body.time)
  };
  const newItem = new Item(itemToSave);
  await newItem.save();
  res.json(newItem);
});

app.delete('/items/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: 'Item deleted' });
});

app.put('/items/:id', async (req, res) => {
  // Convert time to 12-hour format before updating
  const updatedItemData = {
    ...req.body,
    time: convertTo12HourFormat(req.body.time)
  };
  const updatedItem = await Item.findByIdAndUpdate(req.params.id, updatedItemData, { new: true });
  res.json(updatedItem);
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
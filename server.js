require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Booking = require('./models/Booking');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve React production build static files
app.use(express.static(path.join(__dirname, 'client', 'dist')));
// Serve static images and fullCalendar libraries from public if needed
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB (local or Atlas via MONGODB_URI in .env)
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
})
    .then(() => {
        console.log(`Connected to MongoDB: ${process.env.MONGODB_URI.split('@').pop() || 'local'}`);
    }).catch(err => {
        console.error('Failed to connect to MongoDB:', err.message);
        console.error('   Check your MONGODB_URI in .env file');
        process.exit(1);
    });

const facultyEmails = [
    'sonalipatil@somaiya.edu',
    'nandanaprabhu@somaiya.edu',
    'neelkamalsurve@somaiya.edu',
    'sangeetanagpure@somaiya.edu',
    'ravindradivekar@somaiya.edu',
    'sujatapathak@somaiya.edu',
    'kirankumarisinha@somaiya.edu',
    'erajohri@somaiya.edu',
    'purnimaahirao@somaiya.edu',
    'suchitrapatil@somaiya.edu',
    'sunayanavj@engg.somaiya.edu',
    'yogitaborse@somaiya.edu',
    'deeptipatole@somaiya.edu',
    'khushikhanchandani@somaiya.edu',
    'avanisakhapara@somaiya.edu',
    'ashwinidalvi@somaiya.edu',
    'sanjayvidhani@somaiya.edu',
    'diptipawade@somaiya.edu',
    'sagar.korde@somaiya.edu',
    'chirag.desai@somaiya.edu',
    'sonali.w@somaiya.edu',
    'pankaj.mishra@somaiya.edu',
    'venkataramanan@somaiya.edu',
    'vaibhav.chunekar@somaiya.edu',
    'anagha.raich@somaiya.edu',
    'snigdha.b@somaiya.edu',
    'l.sahu@somaiya.edu',
    'abhijeet.p@somaiya.edu',
    'sarika.d@somaiya.edu',
    'utkarshita.s@somaiya.edu'
];

// Setup Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true
});

// ─── JWT Auth Middleware ──────────────────────────────────────────────────────
// Protects routes: validates Bearer token, attaches req.user if valid
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'faculty') {
            return res.status(403).json({ message: 'Access denied. Faculty only.' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
};

// ─── API: Login ──────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
    const { email, passkey } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (facultyEmails.includes(normalizedEmail) && passkey === process.env.PASSKEY) {
        // Sign a JWT token valid for 8 hours
        const token = jwt.sign(
            { email: normalizedEmail, role: 'faculty' },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ success: true, role: 'faculty', email: normalizedEmail, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid faculty credentials.' });
    }
});

// ─── API: Book Slot (protected) ───────────────────────────────────────────────
app.post('/api/bookings/:year/:type/book', authMiddleware, async (req, res) => {
    const { year, type } = req.params;
    console.log(`Booking request from ${req.user.email} for ${year}/${type}`);

    try {
        const { facultyName, courseName, division, batch, date, startTime, endTime, venue, desc, emailAdd } = req.body;

        // Conflict check
        const existingBooking = await Booking.findOne({ date, venue });
        if (existingBooking && (startTime < existingBooking.endTime && endTime > existingBooking.startTime)) {
            return res.status(400).json({ message: 'Venue already booked for this date and time.' });
        }

        const booking = new Booking({
            facultyName, courseName, division, batch,
            date, startTime, endTime, venue, desc, emailAdd, year, type
        });
        await booking.save();

        // Send confirmation email if emailAdd provided
        if (emailAdd) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: emailAdd,
                subject: `Slot Booking Confirmation`,
                text: `Dear Faculty,\n\nYour slot has been successfully booked:\nType: ${type}\nCourse: ${courseName}\n${division ? 'Division: ' + division : ''}\n${batch ? 'Batch: ' + batch : ''}\nDate: ${date}\nTime: ${startTime} - ${endTime}\nVenue: ${venue}\n\nBest regards,\nAdmin Team`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) console.error('Error sending email:', error);
                else console.log('Email sent:', info.response);
            });
        }

        res.json({ message: 'Slot booked successfully!' });
    } catch (error) {
        console.error('Error booking slot:', error);
        res.status(500).json({ message: 'Error booking slot.' });
    }
});

// ─── API: Fetch Calendar Events (protected) ───────────────────────────────────
app.get('/api/bookings/:year/:type/calendar/events', async (req, res) => {
    const { year, type } = req.params;
    try {
        const events = await Booking.find({ year, type });
        const formattedData = events.map(slot => ({
            _id: slot._id,
            title: slot.facultyName,
            start: `${slot.date}T${slot.startTime}`,
            end: `${slot.date}T${slot.endTime}`,
            extendedProps: {
                courseName: slot.courseName,
                division: slot.division,
                batch: slot.batch,
                venue: slot.venue,
                desc: slot.desc
            },
            description: `${slot.courseName} - ${slot.venue} - ${slot.division || ''} - ${slot.desc || ''} ${slot.batch ? '/ ' + slot.batch : ''}`
        }));
        res.json(formattedData);
    } catch (err) {
        console.error("Error fetching events", err);
        res.status(500).send("Error fetching events");
    }
});

// ─── API: Fetch Slots for Editing (protected) ─────────────────────────────────
app.get('/api/bookings/:year/:type/edit/slots', authMiddleware, async (req, res) => {
    const { year, type } = req.params;
    try {
        const slots = await Booking.find({ year, type }).sort({ date: 1, startTime: 1 });
        res.json(slots);
    } catch (err) {
        console.error("Error fetching slots", err);
        res.status(500).send("Error fetching slots.");
    }
});

// ─── API: Update Slot (protected) ─────────────────────────────────────────────
app.put('/api/bookings/:year/:type/edit/slot/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, startTime, endTime, venue, desc } = req.body;
        await Booking.findByIdAndUpdate(id, { date, startTime, endTime, venue, desc });
        res.json({ message: 'Slot updated successfully' });
    } catch (err) {
        console.error("Error updating slot", err);
        res.status(500).send("Error updating slot");
    }
});

// ─── API: Delete Slot (protected) ─────────────────────────────────────────────
app.delete('/api/bookings/:year/:type/edit/slot/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await Booking.findByIdAndDelete(id);
        res.json({ message: 'Slot deleted successfully' });
    } catch (err) {
        console.error('Error deleting slot:', err);
        res.status(500).send("Error deleting slot");
    }
});

// Fallback all frontend routes to React SPA index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

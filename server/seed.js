require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Member = require('./models/Member');
const Loan = require('./models/Loan');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

const books = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    genre: 'Fiction',
    publisher: 'Scribner',
    publishedYear: 1925,
    totalCopies: 5,
    availableCopies: 3,
    description: 'A classic novel set in the Jazz Age about the mysterious millionaire Jay Gatsby.',
    coverColor: '#4f46e5',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    genre: 'Fiction',
    publisher: 'J. B. Lippincott & Co.',
    publishedYear: 1960,
    totalCopies: 4,
    availableCopies: 4,
    description: 'A novel about racial injustice and moral growth in the American South.',
    coverColor: '#059669',
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0-262-03384-8',
    genre: 'Technology',
    publisher: 'MIT Press',
    publishedYear: 2009,
    totalCopies: 6,
    availableCopies: 5,
    description: 'A comprehensive introduction to algorithms and data structures.',
    coverColor: '#d97706',
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '978-0-07-802215-9',
    genre: 'Technology',
    publisher: 'McGraw-Hill',
    publishedYear: 2010,
    totalCopies: 8,
    availableCopies: 6,
    description: 'A fundamental textbook covering database design, SQL, and system concepts.',
    coverColor: '#dc2626',
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '978-0-553-38016-3',
    genre: 'Science',
    publisher: 'Bantam Books',
    publishedYear: 1988,
    totalCopies: 3,
    availableCopies: 3,
    description: 'An exploration of cosmology and the nature of the universe for general readers.',
    coverColor: '#0891b2',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0-13-235088-4',
    genre: 'Technology',
    publisher: 'Prentice Hall',
    publishedYear: 2008,
    totalCopies: 5,
    availableCopies: 4,
    description: 'A handbook of agile software craftsmanship and best practices.',
    coverColor: '#7c3aed',
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0-06-231609-7',
    genre: 'History',
    publisher: 'Harper',
    publishedYear: 2011,
    totalCopies: 4,
    availableCopies: 2,
    description: 'A survey of the history of humankind from the Stone Age to the 21st century.',
    coverColor: '#ea580c',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '978-0-374-27563-1',
    genre: 'Non-Fiction',
    publisher: 'Farrar, Straus and Giroux',
    publishedYear: 2011,
    totalCopies: 3,
    availableCopies: 3,
    description: 'Explores the two systems that drive how we think and make decisions.',
    coverColor: '#0f766e',
  },
];

const members = [
  {
    name: 'Aryan Sharma',
    email: 'aryan.sharma@college.edu',
    phone: '9876543210',
    address: '12 MG Road, Bangalore',
    membershipType: 'Student',
    status: 'Active',
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@college.edu',
    phone: '9123456789',
    address: '45 Anna Salai, Chennai',
    membershipType: 'Student',
    status: 'Active',
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@college.edu',
    phone: '9988776655',
    address: 'Faculty Quarters, Block C',
    membershipType: 'Faculty',
    status: 'Active',
  },
  {
    name: 'Sanya Mehra',
    email: 'sanya.mehra@college.edu',
    phone: '8765432109',
    address: '78 Civil Lines, Delhi',
    membershipType: 'Student',
    status: 'Active',
  },
  {
    name: 'Mohammed Farooq',
    email: 'mfarooq@college.edu',
    phone: '9654321087',
    address: '23 Banjara Hills, Hyderabad',
    membershipType: 'Staff',
    status: 'Active',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Book.deleteMany({});
    await Member.deleteMany({});
    await Loan.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert books
    const insertedBooks = await Book.insertMany(books);
    console.log(`📚 Inserted ${insertedBooks.length} books`);

    // Insert members (one by one to trigger pre-save middleware)
    const insertedMembers = [];
    for (const m of members) {
      const member = new Member(m);
      await member.save();
      insertedMembers.push(member);
    }
    console.log(`👤 Inserted ${insertedMembers.length} members`);

    // Create sample loans
    const now = new Date();
    const pastDue = new Date(now);
    pastDue.setDate(pastDue.getDate() - 5); // 5 days ago (overdue)

    const futureDue = new Date(now);
    futureDue.setDate(futureDue.getDate() + 7); // 7 days from now

    const loans = [
      {
        book: insertedBooks[0]._id,
        member: insertedMembers[0]._id,
        issueDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        dueDate: pastDue,
        status: 'Overdue',
      },
      {
        book: insertedBooks[2]._id,
        member: insertedMembers[1]._id,
        issueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        dueDate: futureDue,
        status: 'Active',
      },
      {
        book: insertedBooks[6]._id,
        member: insertedMembers[3]._id,
        issueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        returnDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        status: 'Returned',
        fine: 0,
      },
    ];

    // Adjust book available copies for active/overdue loans
    await Book.findByIdAndUpdate(insertedBooks[0]._id, { $inc: { availableCopies: -1 } });
    await Book.findByIdAndUpdate(insertedBooks[2]._id, { $inc: { availableCopies: -1 } });

    await Loan.insertMany(loans);
    console.log(`📋 Inserted ${loans.length} sample loans`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('   You can now start the server and explore the application.');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();

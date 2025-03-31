import Book  from '../models/book';
import BookInstance, { IBookInstance }  from '../models/bookinstance';
import express from 'express';

const router = express.Router();

/**
 * sanitize input to prevent XSS attacks
 * @param input 
 * @returns input with HTML special characters escaped
 */
function escapeHTML(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * @route GET /book_dtls
 * @group resource - the details of a book
 * @param {string} id.query - the book id
 * @returns an object with the book title string, author name string, and an array of bookInstances
 * @returns 404 - if the book is not found
 * @returns 500 - if there is an error in the database
 */
router.get('/', async (req, res) => {
  const id = req.query.id as string;
  const sanitizedId = escapeHTML(id.trim());
  try {
    const [book, copies] = await Promise.all([
      Book.getBook(id),
      BookInstance.getBookDetails(id)
    ]);

    if (!book) {
      res.status(404).send(`Book ${sanitizedId} not found`);
      return;
    }

    res.send({
      title: book.title,
      author: book.author.name,
      copies: copies
    });
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).send(`Error fetching book ${sanitizedId}`);
  }
});

export default router;
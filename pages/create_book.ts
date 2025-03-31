import { Request, Response } from 'express';
import Book from '../models/book';
import express from 'express';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';

const router = express.Router();

/**
 * Middleware specific to this router
 * The function is called for every request to this router
 * It parses the body and makes it available under req.body
 */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

const limiter = rateLimit({
  windowMs: 5 * 1000,
  max: 3, 
  message: 'Server is busy, please try again later.',
});


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
 * @route POST /newbook
 * @returns a newly created book for an existing author and genre in the database
 * @returns 500 error if book creation failed
 */
router.post('/', limiter, async (req: Request, res: Response) => {
  const { familyName, firstName, genreName, bookTitle } = req.body;
  if (familyName && firstName && genreName && bookTitle) {
    try {
      const book = new Book({});
      const savedBook = await book.saveBookOfExistingAuthorAndGenre(familyName, firstName, genreName, bookTitle);
      res.status(200).send(savedBook);
    } catch (err: unknown) {
      const sanitizedError = escapeHTML((err as Error).message.trim());
      res.status(500).send('Error creating book: ' + sanitizedError);
    }
  } else {
    res.send('Invalid Inputs');
  }
});

export default router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getAllBooks,
  getBookById,
  getFeaturedBooks,
  getBestsellers,
  getNewArrivals,
  getFlashDeals,
  getBooksByCategory,
  uploadBookImage,
  generateDescription,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/book.controller");
const { protect, authorize } = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed.",
        ),
      );
    }
  },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "Image size exceeds 4MB limit" });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  next();
};

// Public routes
router.get("/", getAllBooks);
router.get("/featured", getFeaturedBooks);
router.get("/bestsellers", getBestsellers);
router.get("/new-arrivals", getNewArrivals);
router.get("/flash/deals", getFlashDeals);
router.get("/category/:category", getBooksByCategory);
router.get("/:id", getBookById);

// Protected admin routes
router.post("/generate-description", protect, authorize("admin"), generateDescription);
router.post(
  "/upload-image",
  protect,
  authorize("admin"),
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  },
  uploadBookImage,
);
router.post("/", protect, authorize("admin"), createBook);
router.put("/:id", protect, authorize("admin"), updateBook);
router.delete("/:id", protect, authorize("admin"), deleteBook);

module.exports = router;

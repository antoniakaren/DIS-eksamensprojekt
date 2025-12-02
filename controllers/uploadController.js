// controllers/uploadController.js
import multer from "multer";
import cloudinaryModule from "cloudinary";
import fs from "fs/promises";
import { User } from "../models/userModel.js";
import { Post } from "../models/postModel.js";
import { sendPostCreatedEmail } from "../controllers/mailController.js";

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary setup
const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});

// --------- CONTROLLER FUNKTIONER ---------

export async function handleUpload(req, res) {
  try {
    // Sørg for at brugeren er logget ind
    const userID = req.session.userID;
    if (!userID) {
      return res.status(401).redirect("/users/login");
    }

    const user = await User.findUserID(userID);
    if (!user) {
      return res.status(401).redirect("/users/login");
    }

    const { text } = req.body;
    let imageUrl = null;

    if (req.file) {
      const tmpFilePath = `./public/images/${Date.now()}-${req.file.originalname}`;

      // Gem midlertidig fil fra buffer til disk
      await fs.writeFile(tmpFilePath, req.file.buffer);

      // Upload til Cloudinary
      const result = await cloudinary.uploader.upload(tmpFilePath, {
        folder: "eksamensprojekt-feed",
        resource_type: "auto",
      });

      imageUrl = result.secure_url;

      // Slet midlertidig fil fra serveren
      await fs.unlink(tmpFilePath);
    }

    const date = new Date().toLocaleString();
    await Post.create(user.userID, text, imageUrl, date);


    await sendPostCreatedEmail(user, text);

    res.redirect("/feed");
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Fejl under upload.");
  }
}

// Multer-middleware til at håndtere <input type="file" name="image">
export const uploadMiddleware = upload.single("image");

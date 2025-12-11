// controllers/uploadController.js
import multer from "multer";
import cloudinaryModule from "cloudinary";
import fs from "fs/promises"; // fs/promises giver os mulighed for at skrive og slette midlertidige filer
import { User } from "../models/userModel.js";
import { Post } from "../models/postModel.js";
import { sendPostCreatedEmail } from "../controllers/mailController.js";

// Multer setup
const storage = multer.memoryStorage(); //memory-storage gør at filen først ligger i RAM, inden vi selv gemmer den
const upload = multer({ storage });

// Cloudinary setup: burges til at gemme billeder eksternt i skyen
const cloudinary = cloudinaryModule.v2;

//opæstter miljøvariabler, så API-nøgler ikke ligger i koden
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});

//CONTROLLER FUNKTIONER
//Funktion til håndtering af opslagsuploads - varificerer samtidigt at brugeren er logget ind 
export async function handleUpload(req, res) {
  try {
    // Sørg for at brugeren er logget ind via session
    const userID = req.session.userID;
    if (!userID) {
      return res.status(401).redirect("/users/login");
    }
    //find brugeren i databasen
    const user = await User.findUserID(userID);
    if (!user) {
      return res.status(401).redirect("/users/login");
    }
    //teksten fra opslaget
    const { text } = req.body;
    let imageUrl = null;
    
    //hvis der er vedhæftet et billede håndteres det her
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

    //selve oplsaget oprettes i databasen 
    const date = new Date().toLocaleString();
    await Post.create(user.userID, text, imageUrl, date);

    //sender email-notifikation til brugeren
    await sendPostCreatedEmail(user, text);

    //brugeren sendes tilbage til feed-siden
    res.redirect("/feed");
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Fejl under upload.");
  }
}

// Multer-middleware til at håndtere <input type="file" name="image">
export const uploadMiddleware = upload.single("image");

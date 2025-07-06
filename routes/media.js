const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const database = require("../config/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const db = database.getDatabase();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/media/";
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 5GB = 5 * 1024 * 1024 * 1024 = 5368709120 bytes
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE, // 5GB limit
        files: 50 // Maximum 50 files
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv|flv|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only images and videos are allowed (JPEG, JPG, PNG, GIF, MP4, AVI, MOV, WMV, FLV, WEBM)"));
        }
    }
});

// Middleware to check video duration
function checkVideoDuration(req, res, next) {
    const files = req.files; // Uploaded files
    const videoFiles = files.filter(file => file.mimetype.startsWith("video/"));

    if (videoFiles.length === 0) {
        return next(); // If there are no videos, proceed
    }

    const durationPromises = videoFiles.map(file => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(__dirname, 'uploads/media', file.filename);
            exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, (error, stdout) => {
                if (error) {
                    return reject(error);
                }
                const duration = parseFloat(stdout);
                if (duration > 3600) { // 1 hour = 3600 seconds
                    return reject(new Error(`Video ${file.originalname} exceeds 1 hour limit`));
                }
                resolve();
            });
        });
    });

    Promise.all(durationPromises)
        .then(() => next())
        .catch(err => res.status(400).send(err.message));
}

// Dashboard page
router.get("/dashboard", requireAuth, (req, res) => {
    db.all("SELECT * FROM media WHERE user_id = ? ORDER BY upload_date DESC", 
           [req.session.userId], (err, media) => {
        if (err) {
            return res.render("dashboard", { 
                username: req.session.username, 
                media: [], 
                error: "Error loading media files" 
            });
        }
        res.render("dashboard", { 
            username: req.session.username, 
            media: media || [], 
            error: null 
        });
    });
});

// Upload endpoint for multiple files
router.post("/upload", requireAuth, (req, res) => {
    upload.array("mediaFiles", 50)(req, res, async (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.redirect(`/dashboard?error=${err.message}`);
            } else {
                // An unknown error occurred when uploading.
                console.error("Upload error:", err);
                return res.redirect("/dashboard?error=Upload failed, please try again");
            }
        }

        if (!req.files || req.files.length === 0) {
            return res.redirect("/dashboard?error=No files uploaded");
        }

        try {
            const processedFiles = [];

            for (const file of req.files) {
                let thumbnailPath = null;
                const isImage = file.mimetype.startsWith("image/");
                const isVideo = file.mimetype.startsWith("video/");

                // Generate thumbnail
                if (isImage) {
                    thumbnailPath = `uploads/thumbnails/thumb_${file.filename}`;
                    await sharp(file.path)
                        .resize(200, 200, { fit: "cover" })
                        .jpeg({ quality: 80 })
                        .toFile(thumbnailPath);
                } else if (isVideo) {
                    thumbnailPath = `uploads/thumbnails/video_thumb_${path.parse(file.filename).name}.jpg`;
                    await generateVideoThumbnail(file.path, thumbnailPath);
                }

                // Save to database
                const fileData = {
                    userId: req.session.userId,
                    filename: file.filename,
                    originalName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    thumbnailPath: thumbnailPath
                };

                processedFiles.push(fileData);
            }

            // Insert all processed files into the database
            const insertPromises = processedFiles.map(fileData => {
                return new Promise((resolve, reject) => {
                    db.run(`
                        INSERT INTO media (user_id, filename, original_name, file_type, file_size, thumbnail_path)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [
                        fileData.userId,
                        fileData.filename,
                        fileData.originalName,
                        fileData.fileType,
                        fileData.fileSize,
                        fileData.thumbnailPath
                    ], (err) => {
                        if (err) {
                            console.error("Database error:", err);
                            return reject(err);
                        }
                        resolve();
                    });
                });
            });

            await Promise.all(insertPromises);
            res.redirect("/dashboard?success=Files uploaded successfully");

        } catch (error) {
            console.error("Upload error:", error);
            res.redirect("/dashboard?error=Upload failed, please try again");
        }
    });
});

// Function to generate video thumbnail using FFmpeg
function generateVideoThumbnail(videoPath, thumbnailPath) {
    return new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 "${thumbnailPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error generating video thumbnail:', error);
                return reject(error);
            }
            resolve();
        });
    });
}

// Serve media files (protected)
router.get("/media/:filename", requireAuth, (req, res) => {
    const filename = req.params.filename;
    
    // Verify the file belongs to the current user
    db.get("SELECT * FROM media WHERE filename = ? AND user_id = ?", 
           [filename, req.session.userId], (err, media) => {
        if (err || !media) {
            return res.status(404).send("File not found");
        }
        
        const filePath = path.join(__dirname, "../uploads/media", filename);
        res.sendFile(path.resolve(filePath));
    });
});

// Serve thumbnails (protected)
router.get("/thumbnail/:filename", requireAuth, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/thumbnails", filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(path.resolve(filePath));
    } else {
        res.status(404).send("Thumbnail not found");
    }
});

// Delete media
router.post("/delete/:id", requireAuth, (req, res) => {
    const mediaId = req.params.id;
    
    db.get("SELECT * FROM media WHERE id = ? AND user_id = ?", 
           [mediaId, req.session.userId], (err, media) => {
        if (err || !media) {
            return res.redirect("/dashboard?error=File not found");
        }
        
        // Delete files
        const mediaPath = path.join(__dirname, "../uploads/media", media.filename);
        const thumbnailPath = path.join(__dirname, "../", media.thumbnail_path);
        
        try {
            if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
            if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
        } catch (error) {
            console.error("Error deleting files:", error);
        }
        
        // Delete from database
        db.run("DELETE FROM media WHERE id = ?", [mediaId], (err) => {
            if (err) {
                return res.redirect("/dashboard?error=Database error");
            }
            res.redirect("/dashboard?success=File deleted successfully");
        });
    });
});

module.exports = router;

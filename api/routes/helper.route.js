import express from "express";
import {
    getImgFromExternal,
    getAppSettings,
    getAppSettingsAbout,
    getAppSettingsPrivacy,
    getAppSettingsUserterms,
    getNews,
} from "../controllers/helper.controller.js";

const router = express.Router();

router.get("/proxy", getImgFromExternal);
router.get("/appsettings", getAppSettings);
router.get("/appsettings/aboutus", getAppSettingsAbout);
router.get("/appsettings/privacypolicy", getAppSettingsPrivacy);
router.get("/appsettings/userterms", getAppSettingsUserterms);
router.get("/news", getNews);



export default router;

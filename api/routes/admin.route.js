import express from "express";
import {
    loadDbOfCommRent,
    loadDbOfCommSale,
    loadDbOfResiRent,
    loadDbOfResiSale,
    searchOnDB,
    getCommRentFromDB,
    getCommSaleFromDB,
    getResiRentFromDB,
    getResiSaleFromDB,
    getDetailByID,
    getDashboardImgs, 
    getSearchConsts,
    setFavorite, 
    searchFavorite, 
    deleteList,
    profileSave,
    roleChange,
    getDBCount,
    deleteFavorite,
    changeSalesPerson,
    pwdChange,
    getSalesPerson,
    updateItem,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../utils/varifyUser.js";
const router = express.Router();

router.post("/upload_comm_rent", loadDbOfCommRent);
router.post("/upload_comm_sale", loadDbOfCommSale);
router.post("/upload_resi_rent", loadDbOfResiRent);
router.post("/upload_resi_sale", loadDbOfResiSale);
router.post("/search", searchOnDB);
router.get("/getCommRent", getCommRentFromDB);
router.get("/getCommSale", getCommSaleFromDB);
router.get("/getResiRent", getResiRentFromDB);
router.get("/getResiSale", getResiSaleFromDB);
router.put("/updateItem/:idb/:id", updateItem);


router.get("/getDetail/:idb/:id", verifyToken, getDetailByID);
router.get("/bgImgs/:id", getDashboardImgs);
router.get("/getSearchConsts", getSearchConsts);
router.post("/setFavorite", setFavorite);
router.post("/searchFavorite", searchFavorite);
router.post("/deleteList", deleteList);
router.post("/deleteFavorite", deleteFavorite);

router.post("/profileSave", profileSave);
router.post("/roleChange", roleChange);
router.get("/getDBCount", getDBCount);
router.post("/changeSalesPerson", changeSalesPerson);
router.get("/getSalesPerson", getSalesPerson);
router.post("/pwdChange", pwdChange);

router.get("/test", (req, res) => {
    res.send("Success of Admin Test API");
  });
export default router;

import express from "express";
import {
    loadDbOfCommRent,
    loadDbOfCommSale,
    loadDbOfResiRent,
    loadDbOfResiSale,
    searchOnDB,
    searchOnDB_mobile_test,
    getCommRentFromDB,
    getCommSaleFromDB,
    getResiRentFromDB,
    getResiSaleFromDB,
    getDetailByID,
    getDashboardImgs, 
    getSearchConsts,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/upload_comm_rent", loadDbOfCommRent);
router.post("/upload_comm_sale", loadDbOfCommSale);
router.post("/upload_resi_rent", loadDbOfResiRent);
router.post("/upload_resi_sale", loadDbOfResiSale);
router.post("/search", searchOnDB);
router.post("/search_mobile_test", searchOnDB_mobile_test);

router.get("/getCommRent", getCommRentFromDB);
router.get("/getCommSale", getCommSaleFromDB);
router.get("/getResiRent", getResiRentFromDB);
router.get("/getResiSale", getResiSaleFromDB);

router.get("/getDetail/:idb/:id", getDetailByID);
router.get("/bgImgs/:id", getDashboardImgs);
router.get("/getSearchConsts", getSearchConsts);

router.get("/test", (req, res) => {
    res.send("Success of Admin Test API");
  });
export default router;

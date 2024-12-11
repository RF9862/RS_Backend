import path from "path"; // For correct path resolution
import CommRent from "../models/commercial_rent.models.js";
import CommSale from "../models/commercial_sale.models.js";
import ResiRent from "../models/residential_rent.models.js";
import ResiSale from "../models/residential_sale.models.js";
import { throwError } from "../utils/error.js";
import Favorite from "../models/favorite.models.js";
import axios from "axios";
import XLSX from "xlsx";
import User from "../models/user.models.js";
import SalesPerson from "../models/salesPerson.models.js";

//
const dbs = [CommRent, CommSale, ResiRent, ResiSale];
const districts = {
  D01: ["Boat Quay", "Raffles Place", "Marina"],
  D02: ["Chinatown", "Tanjong Pagar"],
  D03: ["Alexandra", "Commonwealth"],
  D04: ["Harbourfront", "Telok Blangah"],
  D05: ["Buona Vista", "West Coast", "Clementi New Town"],
  D06: ["City Hall", "Clarke Quay"],
  D07: ["Beach Road", "Bugis", "Rochor"],
  D08: ["Farrer Park", "Serangoon Rd"],
  D09: ["Orchard", "River Valley"],
  D10: ["Tanglin", "Holland", "Bukit Timah"],
  D11: ["Newton", "Novena"],
  D12: ["Balestier", "Toa Payoh"],
  D13: ["Macpherson", "Potong Pasir"],
  D14: ["Eunos", "Geylang", "Paya Lebar"],
  D15: ["East Coast", "Marine Parade"],
  D16: ["Bedok", "Upper East Coast"],
  D17: ["Changi Airport", "Changi Village"],
  D18: ["Pasir Ris", "Tampines"],
  D19: ["Hougang", "Punggol", "Sengkang"],
  D20: ["Ang Mo Kio", "Bishan", "Thomson"],
  D21: ["Clementi Park", "Upper Bukit Timah"],
  D22: ["Boon Lay", "Jurong", "Tuas"],
  D23: ["Dairy Farm", "Bukit Panjang", "Choa Chu Kang"],
  D24: ["Lim Chu Kang", "Tengah"],
  D25: ["Admiralty", "Woodlands"],
  D26: ["Mandai", "Upper Thomson"],
  D27: ["Sembawang", "Yishun"],
  D28: ["Seletar", "Yio Chu Kang"],
};
// Define column mappings for different files
const columnMappings = {
  Commercial_Rent: {
    name: "name",
    property_type: "property_type",
    district: "district",
    address: "address",
    price: "price",
    furnishing: "furnishing",
    area_size: "area_size",
    amenities_list: "amenities_list",
    images_list: "images_list",
    description: "description",
    dev_name: "dev_name",
    agent_name: "agent_name",
    agent_photo: "agent_photo",
    agent_phone: "agent_phone",
    agent_email: "agent_email",
    link: "link",
  },
  Commercial_Sale: {
    name: "name",
    property_type: "property_type",
    district: "district",
    address: "address",
    price: "price",
    furnishing: "furnishing",
    area_size: "area_size",
    tenanted: "tenanted",
    amenities_list: "amenities_list",
    images_list: "images_list",
    description: "description",
    dev_name: "dev_name",
    agent_name: "agent_name",
    agent_photo: "agent_photo",
    agent_phone: "agent_phone",
    agent_email: "agent_email",
    link: "link",
  },
  Residential_Rent: {
    name: "name",
    property_type: "property_type",
    district: "district",
    address: "address",
    price: "price",
    area_size: "area_size",
    floor_level: "floor_level",
    furnishing: "furnishing",
    facing: "facing",
    built_year: "built_year",
    tenure: "tenure",
    mrt: "mrt",
    beds: "beds",
    bathrooms: "bathrooms",
    dev_name: "dev_name",
    unit_types: "unit_types",
    total_units: "total_units",
    neighbourhood: "neighbourhood",
    amenities_list: "amenities_list",
    images_list: "images_list",
    description: "description",
    agent_name: "agent_name",
    agent_photo: "agent_photo",
    agent_phone: "agent_phone",
    link: "link",
  },
  Residential_Sale: {
    name: "name",
    property_type: "property_type",
    district: "district",
    address: "address",
    price: "price",
    area_size: "area_size",
    floor_level: "floor_level",
    furnishing: "furnishing",
    facing: "facing",
    built_year: "built_year",
    tenure: "tenure",
    mrt: "mrt",
    beds: "beds",
    bathrooms: "bathrooms",
    dev_name: "dev_name",
    unit_types: "unit_types",
    total_units: "total_units",
    neighbourhood: "neighbourhood",
    amenities_list: "amenities_list",
    images_list: "images_list",
    description: "description",
    agent_name: "agent_name",
    agent_photo: "agent_photo",
    agent_phone: "agent_phone",
    link: "link",
  },

  // Add more mappings for other files as needed
};

function getDistrict(A) {
  try {
    // Check if A contains a parenthesis, extract the value inside the parenthesis if it does
    const match = A.match(/\((D\d{2})\)/);
    if (match) {
      return match[1]; // Return the district code inside the parentheses
    }

    // Check if A is already in the format Dxx (district code)
    if (A.match(/^D\d{2}$/)) {
      return A; // Return the district code as is
    }

    // Check if A is in the list of district locations
    for (const districtCode in districts) {
      if (districts[districtCode].includes(A)) {
        return districtCode; // Return the corresponding district code
      }
    }
  } catch (error) {
    return "Unknown district";
  }
  // Handle the case where A does not match a district code or location
  return "Unknown district";
}
// ====== Load Database from XLSX
/////////////
export const loadDbOfCommRent = async (req, res, next) => {
  try {
    const comm_rent_files = [process.env.COMMERCIAL_RENT];
    const savedEntries = [];
    console.log(comm_rent_files);
    for (const fileName of comm_rent_files) {
      try {
        // Define the path to the file directly
        console.log("Processing file:", fileName);
        const workbook = await (async () => {
          const response_xlsx = await axios.get(fileName, {
              responseType: 'arraybuffer', // Handle binary data
          });
          // Read the XLSX file
          return XLSX.read(response_xlsx.data, { type: 'buffer' });
        })();
        const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
        const worksheet = workbook.Sheets[sheetName];
        console.log("here");
        // Parse the data into JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        // Determine the file key and column mapping

        const fileKey = fileName.split("/").pop().split(".").shift();

        if (!columnMappings[fileKey]) {
          throw new Error(`No column mapping found for this file: ${fileName}`);
        }

        const columnMapping = columnMappings[fileKey];

        // Validate and save unique entries
        for (const entry of jsonData) {
          try {
            const {
              [columnMapping.name]: name,
              [columnMapping.property_type]: property_type,
              [columnMapping.district]: district,
              [columnMapping.address]: address,
              [columnMapping.price]: price,
              [columnMapping.furnishing]: furnishing,
              [columnMapping.area_size]: area_size,
              [columnMapping.amenities_list]: amenities_list,
              [columnMapping.images_list]: images_list,
              [columnMapping.description]: description,
              [columnMapping.dev_name]: dev_name,
              [columnMapping.agent_name]: agent_name,
              [columnMapping.agent_photo]: agent_photo,
              [columnMapping.agent_phone]: agent_phone,
              [columnMapping.agent_email]: agent_email,
              [columnMapping.link]: link,
            } = entry;

            // Ensure required fields are present
            // if (
            //   !name ||
            //   !property_type ||
            //   !district ||
            //   !address ||
            //   !price ||
            //   !furnishing ||
            //   !area_size ||
            //   !amenities_list ||
            //   !images_list ||
            //   !description ||
            //   !dev_name ||
            //   !agent_name ||
            //   !agent_photo ||
            //   !agent_phone ||
            //   !agent_email ||
            //   !link
            // ) {
            //   throw new Error(
            //     `Missing required fields in entry: ${JSON.stringify(entry)}`
            //   );
            // }
            // Convert images_list and amenities_list to arrays
            const imagesArray =
              typeof images_list === "string"
                ? images_list.split(",").map((s) => s.trim())
                : images_list;
            if (imagesArray.length > 0) {
              imagesArray[0] = imagesArray[0].slice(1);
              imagesArray[imagesArray.length - 1] = imagesArray[0].slice(0, -1);
            }
            const amenitiesArray =
              typeof amenities_list === "string"
                ? amenities_list.split(",").map((s) => s.trim())
                : amenities_list;
            if (amenitiesArray.length > 0) {
              amenitiesArray[0] = amenitiesArray[0].slice(1);
              amenitiesArray[amenitiesArray.length - 1] =
                amenitiesArray[0].slice(0, -1);
            }

            // Check for duplicates
            const duplicate = await CommRent.findOne({ name, price, link });
            if (duplicate) {
              console.log(`Duplicate entry found: ${name}, ${link}. Skipping.`);
              continue; // Skip saving this entry
            }
            // Create and save a new document
            const newCommRent = new CommRent({
              name,
              property_type,
              district,
              address,
              price,
              furnishing,
              area_size,
              amenities_list: amenitiesArray,
              images_list: imagesArray,
              description,
              dev_name,
              agent_name,
              agent_photo,
              agent_phone,
              agent_email,
              link,
            });
            console.log("processing");
            const savedEntry = await newCommRent.save();
            savedEntries.push(savedEntry);
          } catch (innerError) {
            console.error("Error processing entry:");
          }
        }
      } catch (fileError) {
        console.error("Error processing file:");
      }
    }

    // Respond with the saved entries
    res.status(201).json({
      message: "Unique data successfully loaded into the database.",
      data: savedEntries,
    });
  } catch (error) {
    console.error("Error in loadDbOfCommRent:", error.message);
    next(error); // Pass error to global error handler
  }
};

/////////////
export const loadDbOfCommSale = async (req, res, next) => {
  try {
    const comm_rent_files = [process.env.COMMERCIAL_SALE];
    const savedEntries = [];
    // let workbook;

    for (const fileName of comm_rent_files) {
      try {
        // Define the path to the file directly
        console.log("Processing file:", fileName);
        // if (process.env.NODE_ENV === "local") {
        //   workbook = XLSX.read(fileName);
        // } else {
        //   const response_xlsx = await axios.get(fileName, {
        //       responseType: 'arraybuffer', // Handle binary data
        //   });        
        //   // Read the XLSX file
        //   workbook = XLSX.read(response_xlsx.data, { type: 'buffer' });          
        // }
        const workbook = await (async () => {
          const response_xlsx = await axios.get(fileName, {
              responseType: 'arraybuffer', // Handle binary data
          });
          // Read the XLSX file
          return XLSX.read(response_xlsx.data, { type: 'buffer' });
        })();
    
        const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Parse the data into JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        // Determine the file key and column mapping
        const fileKey = fileName.split("/").pop().split(".").shift();
        if (!columnMappings[fileKey]) {
          throw new Error(`No column mapping found for this file: ${fileName}`);
        }

        const columnMapping = columnMappings[fileKey];

        // Validate and save unique entries
        for (const entry of jsonData) {
          try {
            const {
              [columnMapping.name]: name,
              [columnMapping.property_type]: property_type,
              [columnMapping.district]: district,
              [columnMapping.address]: address,
              [columnMapping.price]: price,
              [columnMapping.furnishing]: furnishing,
              [columnMapping.area_size]: area_size,
              [columnMapping.tenanted]: tenanted,
              [columnMapping.amenities_list]: amenities_list,
              [columnMapping.images_list]: images_list,
              [columnMapping.description]: description,
              [columnMapping.dev_name]: dev_name,
              [columnMapping.agent_name]: agent_name,
              [columnMapping.agent_photo]: agent_photo,
              [columnMapping.agent_phone]: agent_phone,
              [columnMapping.agent_email]: agent_email,
              [columnMapping.link]: link,
            } = entry;

            // Ensure required fields are present
            // if (
            //   !name ||
            //   !property_type ||
            //   !district ||
            //   !address ||
            //   !price ||
            //   !furnishing ||
            //   !area_size ||
            //   !amenities_list ||
            //   !images_list ||
            //   !description ||
            //   !dev_name ||
            //   !agent_name ||
            //   !agent_photo ||
            //   !agent_phone ||
            //   !agent_email ||
            //   !link
            // ) {
            //   throw new Error(
            //     `Missing required fields in entry: ${JSON.stringify(entry)}`
            //   );
            // }
            // Convert images_list and amenities_list to arrays
            const imagesArray =
              typeof images_list === "string"
                ? images_list.split(",").map((s) => s.trim())
                : images_list;
            if (imagesArray.length > 0) {
              imagesArray[0] = imagesArray[0].slice(1);
              imagesArray[imagesArray.length - 1] = imagesArray[0].slice(0, -1);
            }
            const amenitiesArray =
              typeof amenities_list === "string"
                ? amenities_list.split(",").map((s) => s.trim())
                : amenities_list;
            if (amenitiesArray.length > 0) {
              amenitiesArray[0] = amenitiesArray[0].slice(1);
              amenitiesArray[amenitiesArray.length - 1] =
                amenitiesArray[0].slice(0, -1);
            }

            // Check for duplicates
            const duplicate = await CommSale.findOne({ name, price, link });
            if (duplicate) {
              console.log(`Duplicate entry found: ${name}, ${link}. Skipping.`);
              continue; // Skip saving this entry
            }
            // Create and save a new document
            const newCommRent = new CommSale({
              name,
              property_type,
              district,
              address,
              price,
              furnishing,
              area_size,
              tenanted,
              amenities_list: amenitiesArray,
              images_list: imagesArray,
              description,
              dev_name,
              agent_name,
              agent_photo,
              agent_phone,
              agent_email,
              link,
            });
            console.log("processing");
            const savedEntry = await newCommRent.save();
            savedEntries.push(savedEntry);
          } catch (innerError) {
            console.error("Error processing entry:");
          }
        }
      } catch (fileError) {
        console.error("Error processing file:");
      }
    }

    // Respond with the saved entries
    console.log("000000");
    res.status(201).json({
      message: "Unique data successfully loaded into the database.",
      data: savedEntries,
    });
  } catch (error) {
    console.error("Error in loadDbOfCommRent:", error.message);
    next(error); // Pass error to global error handler
  }
};

/////////////
export const loadDbOfResiRent = async (req, res, next) => {
  try {
    const comm_rent_files = [process.env.RESIDENTIAL_RENT];
    const savedEntries = [];

    for (const fileName of comm_rent_files) {
      try {
        // Define the path to the file directly
        console.log("Processing file:", fileName);

        const workbook = await (async () => {
          const response_xlsx = await axios.get(fileName, {
              responseType: 'arraybuffer', // Handle binary data
          });
          // Read the XLSX file
          return XLSX.read(response_xlsx.data, { type: 'buffer' });
        })();
        const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Parse the data into JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        // Determine the file key and column mapping
        const fileKey = fileName.split("/").pop().split(".").shift();
        if (!columnMappings[fileKey]) {
          throw new Error(`No column mapping found for this file: ${fileName}`);
        }

        const columnMapping = columnMappings[fileKey];

        // Validate and save unique entries
        for (const entry of jsonData) {
          try {
            const {
              [columnMapping.name]: name,
              [columnMapping.property_type]: property_type,
              [columnMapping.district]: district,
              [columnMapping.address]: address,
              [columnMapping.price]: price,
              [columnMapping.area_size]: area_size,
              [columnMapping.floor_level]: floor_level,
              [columnMapping.furnishing]: furnishing,
              [columnMapping.facing]: facing,
              [columnMapping.built_year]: built_year,
              [columnMapping.tenure]: tenure,
              [columnMapping.mrt]: mrt,
              [columnMapping.beds]: beds,
              [columnMapping.bathrooms]: bathrooms,
              [columnMapping.dev_name]: dev_name,
              [columnMapping.unit_types]: unit_types,
              [columnMapping.total_units]: total_units,
              [columnMapping.neighbourhood]: neighbourhood,
              [columnMapping.amenities_list]: amenities_list,
              [columnMapping.images_list]: images_list,
              [columnMapping.description]: description,

              [columnMapping.agent_name]: agent_name,
              [columnMapping.agent_photo]: agent_photo,
              [columnMapping.agent_phone]: agent_phone,
              [columnMapping.link]: link,
            } = entry;

            // Ensure required fields are present
            // if (
            //   !name ||
            //   !district ||
            //   !address ||
            //   !description ||
            //   !floor_level ||
            //   !facing ||
            //   !built_year ||
            //   !dev_name ||
            //   !unit_types ||
            //   !total_units ||
            //   !neighbourhood ||
            //   !price ||
            //   !agent_name ||
            //   !agent_photo ||
            //   !agent_phone ||
            //   !area_size ||
            //   !property_type ||
            //   !images_list ||
            //   !link ||
            //   !amenities_list
            // ) {
            //   throw new Error(
            //     `Missing required fields in entry: ${JSON.stringify(entry)}`
            //   );
            // }
            // Convert images_list and amenities_list to arrays
            const imagesArray =
              typeof images_list === "string"
                ? images_list.split(",").map((s) => s.trim())
                : images_list;
            if (imagesArray.length > 0) {
              imagesArray[0] = imagesArray[0].slice(1);
              imagesArray[imagesArray.length - 1] = imagesArray[0].slice(0, -1);
            }
            const amenitiesArray =
              typeof amenities_list === "string"
                ? amenities_list.split(",").map((s) => s.trim())
                : amenities_list;
            if (amenitiesArray.length > 0) {
              amenitiesArray[0] = amenitiesArray[0].slice(1);
              amenitiesArray[amenitiesArray.length - 1] =
                amenitiesArray[0].slice(0, -1);
            }

            // Check for duplicates
            const duplicate = await ResiRent.findOne({
              name,
              price,
              beds,
              bathrooms,
              link,
            });
            if (duplicate) {
              console.log(`Duplicate entry found: ${name}, ${link}. Skipping.`);
              continue; // Skip saving this entry
            }

            // Create and save a new document
            const newCommRent = new ResiRent({
              name,
              property_type,
              district,
              address,
              price,
              area_size,
              floor_level,
              furnishing,
              facing,
              built_year,
              tenure,
              mrt,
              beds,
              bathrooms,
              dev_name,
              unit_types,
              total_units,
              neighbourhood,
              amenities_list: amenitiesArray,
              images_list: imagesArray,
              description,
              agent_name,
              agent_photo,
              agent_phone,
              link,
            });
            const savedEntry = await newCommRent.save();
            console.log("processing");
            savedEntries.push(savedEntry);
          } catch (innerError) {
            console.error("Error processing entry:");
          }
        }
      } catch (fileError) {
        console.error("Error processing file:");
      }
    }

    // Respond with the saved entries
    res.status(201).json({
      message: "Unique data successfully loaded into the database.",
      data: savedEntries,
    });
  } catch (error) {
    console.error("Error in loadDbOfCommRent:", error.message);
    next(error); // Pass error to global error handler
  }
};
export const loadDbOfResiSale = async (req, res, next) => {
  try {
    const comm_rent_files = [process.env.RESIDENTIAL_SALE];
    const savedEntries = [];

    for (const fileName of comm_rent_files) {
      try {
        // Define the path to the file directly
        console.log("Processing file:", fileName);

        const workbook = await (async () => {
          const response_xlsx = await axios.get(fileName, {
              responseType: 'arraybuffer', // Handle binary data
          });
          // Read the XLSX file
          return XLSX.read(response_xlsx.data, { type: 'buffer' });
        })();
        const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Parse the data into JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        // Determine the file key and column mapping
        const fileKey = fileName.split("/").pop().split(".").shift();
        if (!columnMappings[fileKey]) {
          throw new Error(`No column mapping found for this file: ${fileName}`);
        }

        const columnMapping = columnMappings[fileKey];

        // Validate and save unique entries
        for (const entry of jsonData) {
          try {
            const {
              [columnMapping.name]: name,
              [columnMapping.property_type]: property_type,
              [columnMapping.district]: district,
              [columnMapping.address]: address,
              [columnMapping.price]: price,
              [columnMapping.area_size]: area_size,
              [columnMapping.floor_level]: floor_level,
              [columnMapping.furnishing]: furnishing,
              [columnMapping.facing]: facing,
              [columnMapping.built_year]: built_year,
              [columnMapping.tenure]: tenure,
              [columnMapping.mrt]: mrt,
              [columnMapping.beds]: beds,
              [columnMapping.bathrooms]: bathrooms,
              [columnMapping.dev_name]: dev_name,
              [columnMapping.unit_types]: unit_types,
              [columnMapping.total_units]: total_units,
              [columnMapping.neighbourhood]: neighbourhood,
              [columnMapping.amenities_list]: amenities_list,
              [columnMapping.images_list]: images_list,
              [columnMapping.description]: description,
              [columnMapping.agent_name]: agent_name,
              [columnMapping.agent_photo]: agent_photo,
              [columnMapping.agent_phone]: agent_phone,
              [columnMapping.link]: link,
            } = entry;
            // console.log(1);
            // Ensure required fields are present
            // if (
            //   !name ||
            //   !district ||
            //   !address ||
            //   !description ||
            //   !floor_level ||
            //   !facing ||
            //   !built_year ||
            //   !dev_name ||
            //   !unit_types ||
            //   !total_units ||
            //   !neighbourhood ||
            //   !price ||
            //   !agent_name ||
            //   !agent_photo ||
            //   !agent_phone ||
            //   !area_size ||
            //   !property_type ||
            //   !images_list ||
            //   !link ||
            //   !amenities_list
            // )
            // {
            //   throw new Error(
            //     `Missing required fields in entry: ${JSON.stringify(entry)}`
            //   );
            // }

            // Convert images_list and amenities_list to arrays
            const imagesArray =
              typeof images_list === "string"
                ? images_list.split(",").map((s) => s.trim())
                : images_list;
            if (imagesArray.length > 0) {
              imagesArray[0] = imagesArray[0].slice(1);
              imagesArray[imagesArray.length - 1] = imagesArray[0].slice(0, -1);
            }
            const amenitiesArray =
              typeof amenities_list === "string"
                ? amenities_list.split(",").map((s) => s.trim())
                : amenities_list;
            if (amenitiesArray.length > 0) {
              amenitiesArray[0] = amenitiesArray[0].slice(1);
              amenitiesArray[amenitiesArray.length - 1] =
                amenitiesArray[0].slice(0, -1);
            }

            // Check for duplicates
            const duplicate = await ResiSale.findOne({
              name,
              price,
              beds,
              bathrooms,
              link,
            });
            if (duplicate) {
              console.log("Duplicate entry found: ${name}, ${link}. Skipping.");
              continue; // Skip saving this entry
            }
            // Create and save a new document
            const newCommRent = new ResiSale({
              name,
              property_type,
              district,
              address,
              price,
              area_size,
              floor_level,
              furnishing,
              facing,
              built_year,
              tenure,
              mrt,
              beds,
              bathrooms,
              dev_name,
              unit_types,
              total_units,
              neighbourhood,
              amenities_list: amenitiesArray,
              images_list: imagesArray,
              description,
              agent_name,
              agent_photo,
              agent_phone,
              link,
            });
            console.log("processing");
            const savedEntry = await newCommRent.save();
            savedEntries.push(savedEntry);
          } catch (innerError) {
            console.error("Error processing entry:");
          }
        }
      } catch (fileError) {
        console.error("Error processing file:");
      }
    }

    // Respond with the saved entries
    res.status(201).json({
      message: "Unique data successfully loaded into the database.",
      data: savedEntries,
    });
  } catch (error) {
    console.error("Error in loadDbOfCommRent:", error.message);
    next(error); // Pass error to global error handler
  }
};

// Controller function to fetch data
export const getCommRentFromDB = async (req, res) => {
  try {
    const data = await CommRent.find(); // Fetch all documents from the collection
    res.status(200).json(data.slice(0, 6));
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};

export const getCommSaleFromDB = async (req, res) => {
  try {
    const data = await CommSale.find(); // Fetch all documents from the collection
    res.status(200).json(data.slice(0, 6));
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};

export const getResiRentFromDB = async (req, res) => {
  try {
    const data = await ResiRent.find(); // Fetch all documents from the collection
    res.status(200).json(data.slice(0, 6));
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};
export const getResiSaleFromDB = async (req, res) => {
  try {
    const data = await ResiSale.find(); // Fetch all documents from the collection
    res.status(200).json(data.slice(0, 6));
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};
export const getDBCount = async (req, res) => {
  try {
    const count = await CommSale.find().countDocuments();
    const count1 = await CommRent.find().countDocuments();
    const count2 = await ResiSale.find().countDocuments();
    const count3 = await ResiRent.find().countDocuments();
    res.json({ count: count, count1: count1, count2: count2, count3: count3 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};
export const searchFavorite = async (req, res) => {
  const { list_id, user_id, cate, currentPage, itemsPerPage } = req.body;
  const newFavorite = new Favorite({
    user_id: user_id,
    list_id: list_id,
    cate: cate,
    currentPage: currentPage,
    itemsPerPage: itemsPerPage,
  });
  const skip = (parseInt(currentPage) - 1) * parseInt(itemsPerPage);
  const limit = parseInt(itemsPerPage);
  try {
    const properties = await dbs[cate].aggregate([
      {
        $match: {
          _id: {
            $in: await Favorite.distinct("list_id", { user_id: user_id }),
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    console.log(user_id);
    const count = await dbs[cate].aggregate([
      {
        $match: {
          _id: {
            $in: await Favorite.distinct("list_id", { user_id: user_id }),
          },
        },
      },
      {
        $count: "count", // This stage counts the number of documents that passed the match stage
      },
    ]);

    res.json({ row: properties, count: count });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).send("Server Error");
  }
};
export const setFavorite = async (req, res) => {
  const { list_id, user_id, cate } = req.body;
  const newFavorite = new Favorite({
    user_id: user_id,
    list_id: list_id,
    cate: cate,
  });

  try {
    await newFavorite.save();
    res.json({ message: "successfully favorited" });
  } catch (error) {
    res.json({ message: error });
  }
};

export const deleteList = async (req, res) => {
  const { list_id, user_id, cate } = req.body;

  try {
    // Deleting from the main database
    const listResult = await dbs[cate].deleteOne({ _id: list_id });
    if (listResult.deletedCount === 0) {
      return res.status(404).json({ message: "List not found" });
    }

    // Deleting from the favorites
    const favoriteResult = await Favorite.deleteOne({ list_id: list_id, user_id: user_id });
    if (favoriteResult.deletedCount === 0) {
      console.warn("No corresponding favorite entry found to delete.");
    }

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting list:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


export const deleteFavorite = async (req, res) => {
  const { list_id, user_id, cate } = req.body;

  try {
    const result = await Favorite.deleteOne({ list_id: list_id, user_id: user_id });

    if (result.deletedCount === 0) {
      // No document was deleted
      return res.status(404).json({ message: "Favorite item not found" });
    }

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


export const searchOnDB = async (req, res) => {
  const {
    db_index,
    nameKeys,
    addressKeys,
    devNameKeys,
    tenureKeys,
    selectedFurnishing,
    selectedSubMrts,
    selectedSubAmenities,
    selectedSubProperties,
    minPrice,
    maxPrice,
    district,
    minAreaVal,
    maxAreaVal,
    BedsNums,
    BathsNums,
    currentPage,
    itemsPerPage,
  } = req.body;
  
  // Build query
  const query = [];
  // if (keywords) query.name = { $regex: keywords, $options: "i" }
  
  if (selectedSubProperties.length > 0) {
    query.push({ property_type: { $in: selectedSubProperties } });
  }
  
  if (selectedSubMrts.length > 0) {
    query.push({ mrt: { $in: selectedSubMrts } });
  }
  
  if (selectedSubAmenities.length > 0) {
    query.push({ amenities_list: { $in: selectedSubAmenities } });
  }

  if (district.length > 0) {
    query.push({ district: { $in: district } });
  }
  if (BedsNums.length > 0) {
    query.push({ beds: { $in: BedsNums } });
  }
  if (BathsNums.length > 0) {
    query.push({ bathrooms: { $in: BathsNums } });
  }
  if (selectedFurnishing.length > 0) {
    query.push({ furnishing: { $in: selectedFurnishing } });
  }

  if (nameKeys) query.push({ name: { $regex: nameKeys, $options: "i" } });
  if (addressKeys)
    query.push({ address: { $regex: addressKeys, $options: "i" } });
  if (devNameKeys)
    query.push({ dev_name: { $regex: devNameKeys, $options: "i" } });
  if (tenureKeys) query.push({ tenure: { $regex: tenureKeys, $options: "i" } });
    
  if (minPrice) query.push({ price: { $gte: minPrice } });
  if (maxPrice) query.push({ price: { $lte: maxPrice } });
  if (minAreaVal) query.push({ area_size: { $gte: minAreaVal } });
  if (maxAreaVal) query.push({ area_size: { $lte: maxAreaVal } });

  const skip = (parseInt(currentPage) - 1) * parseInt(itemsPerPage);
  const limit = parseInt(itemsPerPage);

  try {
    const newquery = query.length > 0 ? { $and: query } : {};

    const properties = await dbs[db_index]
      .find(newquery)
      .skip(skip)
      .limit(limit);
    const count = await dbs[db_index].find(newquery).countDocuments();
    console.log("newquery", newquery);
    res.json({ row: properties, count: count });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).send("Server Error");
  }
};

// Endpoint to fetch details by ID
export const getDetailByID = async (req, res) => {
  try {
    const idb = req.params.idb;
    const id = req.params.id;

    // Fetch the requested detail by ID from the specific database
    const detail = await dbs[idb].findById(id);
    if (!detail) {
      return res.status(404).json({ error: "Detail not found" });
    }

    // Fetch the requesting user and salespersons
    const requestUser = await User.findById(req.user.id);

    let permission;
    // Process response based on the user's role
    if (requestUser.role === 5) {
      const salesPersonInfo = await SalesPerson.findOne({ dbIndex: idb });
      const salesPerson = await User.findById(salesPersonInfo.userID);    
      permission = 2;
      res.status(202).json({ detail, salesPerson , permission });
    } else if (requestUser.role === 2) {
      const adminUser = await User.findOne({role:5});    
      permission = 1;
      res.status(201).json({ detail, adminUser , permission });
    } else if (requestUser.role === 0) {
      const salesPersonInfo = await SalesPerson.findOne({ dbIndex: idb });
      const salesPerson = await User.findById(salesPersonInfo.userID);          
      permission = 0;
      // Exclude agent_name and agent_phone for role 0
      const { agent_name, agent_phone, agent_photo, ...detailWithoutAgentInfo } = detail._doc;
      res.status(200).json({ detail: detailWithoutAgentInfo, salesPerson, permission });
    } else {
      // Handle cases where the user's role doesn't match the above conditions
      res.status(403).json({ error: "Access denied" });
    }
  } catch (error) {
    console.error("Error fetching detail:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getDashboardImgs = async (req, res) => {
  const id = req.params.id;
  // Provide the path to your image file
  const imagePath = `${process.env.BG_IMG_PATH}/${id}.jpg`;
  res.sendFile(imagePath, (err) => {
      if (err) {
          console.error('Error sending the file:', err);
          res.status(500).send('Error occurred while sending the image');
      }
  });
};

export const getSearchConsts = async (req, res) => {
  const Property_types = {
    "PropertyTypesCol": [
      {
        "Retail": ["Shop", "Medical", "Food & Beverage", "Office", "Grade A", "Shophouse", "Others"],
        "Industrial": ["General Industrial", "Warehouse", "Showroom", "Dormitory", "e-Business", "Food & Beverage", "Childcare", "Industrial Office", "Shop", "Factory"],
        "Land": ["Land Only", "Land with Building"]
      },
      {
        "Landed": ["Detached House", "Semi-Detached House", "Corner Terrace", "Bungalow", "Good Class Bungalow", "Shophouse", "Land Only", "Townhouse", "Conservation House", "Cluster House"],
        "Condo": ["Condominimum", "Apartment", "Walk-up", "Cluster House", "Executive Condo"], 
        "HDB": ["HDB", "HDB 2 Rooms", "HDB 3 Rooms", "HDB 4 Rooms", "HDB 5 Rooms", "HDB Executive", "Corner Terrace", "Terraced House"]
      }
    ],
    "District": [{ value: "D01", label: "D01 (Boat Quay / Raffles Place / Marina)" },
      { value: "D02", label: "D02 (Chinatown / Tanjong Pagar)" },
      { value: "D03", label: "D03 (Alexandra / Commonwealth)" },
      { value: "D04", label: "D04 (Harbourfront / Telok Blangah)" },
      { value: "D05", label: "D05 (Buona Vista / West Coast / Clementi New Town)" },
      { value: "D06", label: "D06 (City Hall / Clarke Quay)" },
      { value: "D07", label: "D07 (Beach Road / Bugis / Rochor)" },
      { value: "D08", label: "D08 (Farrer Park / Serangoon Rd)" },
      { value: "D09", label: "D09 (Orchard / River Valley)" },
      { value: "D10", label: "D10 (Tanglin / Holland / Bukit Timah)" },
      { value: "D11", label: "D11 (Newton / Novena)" },
      { value: "D12", label: "D12 (Balestier / Toa Payoh)" },
      { value: "D13", label: "D13 (Macpherson / Potong Pasir)" },
      { value: "D14", label: "D14 (Eunos / Geylang / Paya Lebar)" },
      { value: "D15", label: "D15 (East Coast / Marine Parade)" },
      { value: "D16", label: "D16 (Bedok / Upper East Coast)" },
      { value: "D17", label: "D17 (Changi Airport / Changi Village)" },
      { value: "D18", label: "D18 (Pasir Ris / Tampines)" },
      { value: "D19", label: "D19 (Hougang / Punggol / Sengkang)" },
      { value: "D20", label: "D20 (Ang Mo Kio / Bishan / Thomson)" },
      { value: "D21", label: "D21 (Clementi Park / Upper Bukit Timah)" },
      { value: "D22", label: "D22 (Boon Lay / Jurong / Tuas)" },
      { value: "D23", label: "D23 (Dairy Farm / Bukit Panjang / Choa Chu Kang)" },
      { value: "D24", label: "D24 (Lim Chu Kang / Tengah)" },
      { value: "D25", label: "D25 (Admiralty / Woodlands)" },
      { value: "D26", label: "D26 (Mandai / Upper Thomson)" },
      { value: "D27", label: "D27 (Sembawang / Yishun)" },
      { value: "D28", label: "D28 (Seletar / Yio Chu Kang)" }],
    "Amenities": [
      { value: "Vacuum Cleaner", label: "Vacuum Cleaner" },
      { value: "Function Room", label: "Function Room" },
      { value: "Cooker Hob/Hood", label: "Cooker Hob/Hood" },
      { value: "Putting Green", label: "Putting Green" },
      { value: "Fountain", label: "Fountain" },
      { value: "Infinity Pool", label: "Infinity Pool" },
      { value: "IT Support", label: "IT Support" },
      { value: "Steam Room", label: "Steam Room" },
      { value: "Driving Range", label: "Driving Range" },
      { value: "Cat 5 Cabling", label: "Cat 5 Cabling" },
      { value: "Loading Bay", label: "Loading Bay" },
      { value: "Multi-purpose Hall", label: "Multi-purpose Hall" },
      { value: "Aerobic Pool", label: "Aerobic Pool" },
      { value: "Meeting rooms", label: "Meeting rooms" },
      { value: "Squash court", label: "Squash court" },
      { value: "Meeting Rooms", label: "Meeting Rooms" },
      { value: "Mini-mart", label: "Mini-mart" },
      { value: "Billiards Room", label: "Billiards Room" },
      { value: "Large Floor Plate", label: "Large Floor Plate" },
      { value: "Cable TV", label: "Cable TV" },
      { value: "Community Plaza", label: "Community Plaza" },
      { value: "Barbeque Pits", label: "Barbeque Pits" },
      { value: "Library", label: "Library" },
      { value: "Steam bath", label: "Steam bath" },
      { value: "Hammocks", label: "Hammocks" },
      { value: "Air Conditioning", label: "Air Conditioning" },
      { value: "Top Floor", label: "Top Floor" },
      { value: "Dining Room Furniture", label: "Dining Room Furniture" },
      { value: "Clubhouse", label: "Clubhouse" },
      { value: "Water Channel", label: "Water Channel" },
      { value: "Study Room", label: "Study Room" },
      { value: "Children's Playground", label: "Children's Playground" },
      { value: "Terrace", label: "Terrace" },
      { value: "Column Free", label: "Column Free" },
      { value: "Jacuzzi", label: "Jacuzzi" },
      { value: "Main entrance", label: "Main entrance" },
      { value: "Original Condition", label: "Original Condition" },
      { value: "Mini Golf Range", label: "Mini Golf Range" },
      { value: "Air-Conditioning", label: "Air-Conditioning" },
      { value: "15m Core-to-Window", label: "15m Core-to-Window" },
      { value: "Concierge", label: "Concierge" },
      { value: "Attached Bathroom", label: "Attached Bathroom" },
      { value: "Raised Access Floor", label: "Raised Access Floor" },
      { value: "Playground", label: "Playground" },
      { value: "Car Parking", label: "Car Parking" },
      { value: "High Floor", label: "High Floor" },
      { value: "Pavilion", label: "Pavilion" },
      { value: "Maid Room", label: "Maid Room" },
      { value: "Large Floor Plates", label: "Large Floor Plates" },
      { value: "Karaoke", label: "Karaoke" },
      { value: "Security", label: "Security" },
      { value: "Yoga Corner", label: "Yoga Corner" },
      { value: "Mini golf range", label: "Mini golf range" },
      { value: "Sofa", label: "Sofa" },
      { value: "Colonial Building", label: "Colonial Building" },
      { value: "Dryer", label: "Dryer" },
      { value: "DVD Player", label: "DVD Player" },
      { value: "TV", label: "TV" },
      { value: "Dual Key", label: "Dual Key" },
      { value: "Penthouse", label: "Penthouse" },
      { value: "Raised Floor", label: "Raised Floor" },
      { value: "Walk In Closet", label: "Walk In Closet" },
      { value: "Jet Pool", label: "Jet Pool" },
      { value: "Own Generator", label: "Own Generator" },
      { value: "ISDN", label: "ISDN" },
      { value: "BBQ", label: "BBQ" },
      { value: "Lap pool", label: "Lap pool" },
      { value: "Bed", label: "Bed" },
      { value: "Washing Machine", label: "Washing Machine" },
      { value: "Sky Terrace", label: "Sky Terrace" },
      { value: "Backup Generator", label: "Backup Generator" },
      { value: "Lift lobby", label: "Lift lobby" },
      { value: "City View", label: "City View" },
      { value: "Sculpture", label: "Sculpture" },
      { value: "Bomb Shelter", label: "Bomb Shelter" },
      { value: "Own Chiller Plant", label: "Own Chiller Plant" },
      { value: "Leisure pool", label: "Leisure pool" },
      { value: "Sauna", label: "Sauna" },
      { value: "Fibre Ready", label: "Fibre Ready" },
      { value: "Pool View", label: "Pool View" },
      { value: "Spa Pool", label: "Spa Pool" },
      { value: "Rooftop Pool", label: "Rooftop Pool" },
      { value: "Fridge", label: "Fridge" },
      { value: "Community Garden", label: "Community Garden" },
      { value: "Squash Court", label: "Squash Court" },
      { value: "Television", label: "Television" },
      { value: "High Ceiling", label: "High Ceiling" },
      { value: "Basketball Court", label: "Basketball Court" },
      { value: "Adventure Park", label: "Adventure Park" },
      { value: "Turnstile System", label: "Turnstile System" },
      { value: "Sky Lounge", label: "Sky Lounge" },
      { value: "Dual Power", label: "Dual Power" },
      { value: "Wireless Internet", label: "Wireless Internet" },
      { value: "Own Generator Facility", label: "Own Generator Facility" },
      { value: "Jogging Track", label: "Jogging Track" },
      { value: "Jogging track", label: "Jogging track" },
      { value: "Bathtub", label: "Bathtub" },
      { value: "Videoconferencing", label: "Videoconferencing" },
      { value: "Broadband Internet", label: "Broadband Internet" },
      { value: "Games Room", label: "Games Room" },
      { value: "Secretarial Services", label: "Secretarial Services" },
      { value: "Bowling Alley", label: "Bowling Alley" },
      { value: "Security Access Control", label: "Security Access Control" },
      { value: "Living Room Furniture", label: "Living Room Furniture" },
      { value: "Hydrotherapy Pool", label: "Hydrotherapy Pool" },
      { value: "Garage", label: "Garage" },
      { value: "Fitness corner", label: "Fitness corner" },
      { value: "SCV/SMATV System", label: "SCV/SMATV System" },
      { value: "Spa pool", label: "Spa pool" },
      { value: "Maidsroom", label: "Maidsroom" },
      { value: "Waterfall", label: "Waterfall" },
      { value: "Audio System", label: "Audio System" },
      { value: "AV Equipment", label: "AV Equipment" },
      { value: "Amphitheatre", label: "Amphitheatre" },
      { value: "Cat 5/6 Cabling", label: "Cat 5/6 Cabling" },
      { value: "Private Garden", label: "Private Garden" },
      { value: "Function room", label: "Function room" },
      { value: "Private Pool", label: "Private Pool" },
      { value: "Retail Shops", label: "Retail Shops" },
      { value: "Wading pool", label: "Wading pool" },
      { value: "Covered car park", label: "Covered car park" },
      { value: "Water Trap", label: "Water Trap" },
      { value: "Basketball court", label: "Basketball court" },
      { value: "Low Floor", label: "Low Floor" },
      { value: "Tennis Court", label: "Tennis Court" },
      { value: "Renovated", label: "Renovated" },
      { value: "Gymnasium room", label: "Gymnasium room" },
      { value: "Lounge", label: "Lounge" },
      { value: "Swimming pool", label: "Swimming pool" },
      { value: "Wine and Cigar Room", label: "Wine and Cigar Room" },
      { value: "Outdoor Dining", label: "Outdoor Dining" },
      { value: "Ground Floor", label: "Ground Floor" },
      { value: "Dual Telecom Risers", label: "Dual Telecom Risers" },
      { value: "Stove", label: "Stove" },
      { value: "Grease Trap", label: "Grease Trap" },
      { value: "Restrooms", label: "Restrooms" },
      { value: "24 hours security", label: "24 hours security" },
      { value: "Utility Room", label: "Utility Room" },
      { value: "Reflexology Path", label: "Reflexology Path" },
      { value: "Greenery View", label: "Greenery View" },
      { value: "Lap Pool", label: "Lap Pool" },
      { value: "SVC/SMATV System", label: "SVC/SMATV System" },
      { value: "Washer", label: "Washer" },
      { value: "Handicap-friendly", label: "Handicap-friendly" },
      { value: "Aircon", label: "Aircon" },
      { value: "Oven / Microwave", label: "Oven / Microwave" },
      { value: "Poolside Lounge", label: "Poolside Lounge" },
      { value: "Cafes", label: "Cafes" },
      { value: "Sea View", label: "Sea View" },
      { value: "Corner Unit", label: "Corner Unit" },
      { value: "Underwater Fitness Station", label: "Underwater Fitness Station" },
      { value: "Iron / Ironing Board", label: "Iron / Ironing Board" },
      { value: "Duplex / Maisonette", label: "Duplex / Maisonette" },
      { value: "Water Heater", label: "Water Heater" },
      { value: "Kitchen Utensils", label: "Kitchen Utensils" },
      { value: "Bombshelter", label: "Bombshelter" },
      { value: "Bridge", label: "Bridge" },
      { value: "Swimming Pool", label: "Swimming Pool" },
      { value: "Tennis courts", label: "Tennis courts" },
      { value: "Multi-purpose hall", label: "Multi-purpose hall" },
      { value: "Drop Off Point", label: "Drop Off Point" },
      { value: "24-Hour Access", label: "24-Hour Access" },
      { value: "Multi-Storey Car Park", label: "Multi-Storey Car Park" },
      { value: "450 Lux Lighting", label: "450 Lux Lighting" },
      { value: "Wading Pool", label: "Wading Pool" },
      { value: "Park / Greenery View", label: "Park / Greenery View" },
      { value: "Fun Pool", label: "Fun Pool" },
      { value: "CCTV Security", label: "CCTV Security" },
      { value: "Hairdryer", label: "Hairdryer" },
      { value: "Dual Power Source", label: "Dual Power Source" },
      { value: "Fitness Corner", label: "Fitness Corner" },
      { value: "Reception Services", label: "Reception Services" },
      { value: "Meeting Room", label: "Meeting Room" },
      { value: "Dishwasher", label: "Dishwasher" },
      { value: "Spa Pavilion", label: "Spa Pavilion" },
      { value: "Swimming Pool View", label: "Swimming Pool View" },
      { value: "Timber Deck", label: "Timber Deck" },
      { value: "Server Room", label: "Server Room" },
      { value: "Badminton Court", label: "Badminton Court" },
      { value: "Internet Connection", label: "Internet Connection" },
      { value: "Lake View", label: "Lake View" },
      { value: "Walk-in-wardrobe", label: "Walk-in-wardrobe" },
      { value: "Outdoor Patio", label: "Outdoor Patio" },
      { value: "Pantry", label: "Pantry" },
      { value: "Oven", label: "Oven" },
      { value: "Pond", label: "Pond" },
      { value: "Pavillion", label: "Pavillion" },
      { value: "Loft", label: "Loft" },
      { value: "Balcony", label: "Balcony" },
      { value: "Chilled Water Supply", label: "Chilled Water Supply" },
      { value: "Fun pool", label: "Fun pool" },
      { value: "Handicap Friendly", label: "Handicap Friendly" },
      { value: "Security Access", label: "Security Access" },
      { value: "Basement car park", label: "Basement car park" },
      { value: "Open Terrace", label: "Open Terrace" },
      { value: "Mini-Mart", label: "Mini-Mart" },
      { value: "Mid Floor", label: "Mid Floor" },
      { value: "Intercom", label: "Intercom" },
      { value: "Kitchen", label: "Kitchen" },
      { value: "Launderette", label: "Launderette" },
      { value: "Roof Terrace", label: "Roof Terrace" },
      { value: "24 hr Access", label: "24 hr Access" },
      { value: "Turnstile", label: "Turnstile" },
      { value: "Water Feature", label: "Water Feature" },
      { value: "Bath Room", label: "Bath Room" },
      { value: "Broadband", label: "Broadband" },
      { value: "Closet", label: "Closet" },
      { value: "Pool Deck", label: "Pool Deck" },
      { value: "Patio / PES", label: "Patio / PES" },
      { value: "Meeting room", label: "Meeting room" },
      { value: "Point Block", label: "Point Block" },
      { value: "Viewing Deck", label: "Viewing Deck" },
      { value: "Gym", label: "Gym" },
      { value: "Couch", label: "Couch" },
      { value: "Dual Telecoms Risers", label: "Dual Telecoms Risers" },
      { value: "CCTV", label: "CCTV" },
      { value: "Parking", label: "Parking" },
      { value: "Car Park", label: "Car Park" },
      { value: "Aircon Facilities", label: "Aircon Facilities" },
      { value: "Badminton hall", label: "Badminton hall" },
      { value: "Eateries", label: "Eateries" }            
    ],
    "Furnishing": [
      { value: "Partially Fitted", label: "Partially Fitted" },
      { value: "Bare", label: "Bare" },
      { value: "Fully", label: "Fully" },
      { value: "Fully Fitted", label: "Fully Fitted" },
      { value: "Unfurnished", label: "Unfurnished" },
      { value: "Partial", label: "Partial" }
    ],
    "Mrt": [
      { value: "Sengkang MRT", label: "Sengkang MRT" },
      { value: "Yishun MRT", label: "Yishun MRT" },
      { value: "Hillview MRT", label: "Hillview MRT" },
      { value: "Oasis LRT", label: "Oasis LRT" },
      { value: "MacPherson MRT", label: "MacPherson MRT" },
      { value: "Yio Chu Kang MRT", label: "Yio Chu Kang MRT" },
      { value: "Bras Basah MRT", label: "Bras Basah MRT" },
      { value: "Lavender MRT", label: "Lavender MRT" },
      { value: "Bukit Batok MRT", label: "Bukit Batok MRT" },
      { value: "Ang Mo Kio MRT", label: "Ang Mo Kio MRT" },
      { value: "Mount Pleasant MRT", label: "Mount Pleasant MRT" },
      { value: "Prince Edward MRT", label: "Prince Edward MRT" },
      { value: "Elias MRT", label: "Elias MRT" },
      { value: "Turf City MRT", label: "Turf City MRT" },
      { value: "Farrer Park MRT", label: "Farrer Park MRT" },
      { value: "Bahar Junction MRT", label: "Bahar Junction MRT" },
      { value: "Kranji MRT", label: "Kranji MRT" },
      { value: "Mattar MRT", label: "Mattar MRT" },
      { value: "BUkit Batok MRT", label: "BUkit Batok MRT" },
      { value: "Harbourfront MRT", label: "Harbourfront MRT" },
      { value: "Segar LRT", label: "Segar LRT" },
      { value: "Braddell MRT", label: "Braddell MRT" },
      { value: "Phoenix LRT", label: "Phoenix LRT" },
      { value: "Marsiling MRT", label: "Marsiling MRT" },
      { value: "Jurong Lake District MRT", label: "Jurong Lake District MRT" },
      { value: "Jelapang LRT", label: "Jelapang LRT" },
      { value: "Tengah Park MRT", label: "Tengah Park MRT" },
      { value: "Gek Poh MRT", label: "Gek Poh MRT" },
      { value: "Bedok North MRT", label: "Bedok North MRT" },
      { value: "Kallang MRT", label: "Kallang MRT" },
      { value: "One-North MRT", label: "One-North MRT" },
      { value: "Kovan MRT", label: "Kovan MRT" },
      { value: "Little India MRT", label: "Little India MRT" },
      { value: "Clarke Quay MRT", label: "Clarke Quay MRT" },
      { value: "Shenton Way MRT", label: "Shenton Way MRT" },
      { value: "Pandan Reservoir MRT", label: "Pandan Reservoir MRT" },
      { value: "Buangkok MRT", label: "Buangkok MRT" },
      { value: "Sungei Bedok MRT", label: "Sungei Bedok MRT" },
      { value: "Bartley MRT", label: "Bartley MRT" },
      { value: "Tampines North MRT", label: "Tampines North MRT" },
      { value: "Dover MRT", label: "Dover MRT" },
      { value: "Jalan Besar MRT", label: "Jalan Besar MRT" },
      { value: "Great World MRT", label: "Great World MRT" },
      { value: "Mayflower MRT", label: "Mayflower MRT" },
      { value: "Novena MRT", label: "Novena MRT" },
      { value: "Bukit Batok West MRT", label: "Bukit Batok West MRT" },
      { value: "Toa Payoh MRT", label: "Toa Payoh MRT" },
      { value: "Farrer Road MRT", label: "Farrer Road MRT" },
      { value: "Clementi MRT", label: "Clementi MRT" },
      { value: "Redhill MRT", label: "Redhill MRT" },
      { value: "Tavistock MRT", label: "Tavistock MRT" },
      { value: "Admiralty MRT", label: "Admiralty MRT" },
      { value: "Orchard Boulevard MRT", label: "Orchard Boulevard MRT" },
      { value: "Serangoon North MRT", label: "Serangoon North MRT" },
      { value: "Bangkit LRT", label: "Bangkit LRT" },
      { value: "Nibong LRT", label: "Nibong LRT" },
      { value: "King Albert Park MRT", label: "King Albert Park MRT" },
      { value: "Rochor MRT", label: "Rochor MRT" },
      { value: "Simei MRT", label: "Simei MRT" },
      { value: "Fort Canning MRT", label: "Fort Canning MRT" },
      { value: "HarbourFront MRT", label: "HarbourFront MRT" },
      { value: "Boon Lay MRT", label: "Boon Lay MRT" },
      { value: "Hong Kah MRT", label: "Hong Kah MRT" },
      { value: "Cheng Lim LRT", label: "Cheng Lim LRT" },
      { value: "South View LRT", label: "South View LRT" },
      { value: "Haw Par Villa MRT", label: "Haw Par Villa MRT" },
      { value: "Labrador Park MRT", label: "Labrador Park MRT" },
      { value: "Potong Pasir MRT", label: "Potong Pasir MRT" },
      { value: "Compassvale LRT", label: "Compassvale LRT" },
      { value: "Dakota MRT", label: "Dakota MRT" },
      { value: "Orchard MRT", label: "Orchard MRT" },
      { value: "Hume MRT", label: "Hume MRT" },
      { value: "Changi Airport MRT", label: "Changi Airport MRT" },
      { value: "Choa Chu Kang MRT", label: "Choa Chu Kang MRT" },
      { value: "Holland Village MRT", label: "Holland Village MRT" },
      { value: "Havelock MRT", label: "Havelock MRT" },
      { value: "Chinatown MRT", label: "Chinatown MRT" },
      { value: "Downtown MRT", label: "Downtown MRT" },
      { value: "Senja LRT", label: "Senja LRT" },
      { value: "Stevens MRT", label: "Stevens MRT" },
      { value: "Tiong Bahru MRT", label: "Tiong Bahru MRT" },
      { value: "Loyang MRT", label: "Loyang MRT" },
      { value: "Beauty World MRT", label: "Beauty World MRT" },
      { value: "Teck Ghee MRT", label: "Teck Ghee MRT" },
      { value: "Cove LRT", label: "Cove LRT" },
      { value: "Siglap MRT", label: "Siglap MRT" },
      { value: "Yew Tee MRT", label: "Yew Tee MRT" },
      { value: "Samudera LRT", label: "Samudera LRT" },
      { value: "Defu MRT", label: "Defu MRT" },
      { value: "Soo Teck LRT", label: "Soo Teck LRT" },
      { value: "Bedok South MRT", label: "Bedok South MRT" },
      { value: "Petir LRT", label: "Petir LRT" },
      { value: "Teck Whye LRT", label: "Teck Whye LRT" },
      { value: "Punggol MRT", label: "Punggol MRT" },
      { value: "Tongkang LRT", label: "Tongkang LRT" },
      { value: "Fernvale LRT", label: "Fernvale LRT" },
      { value: "Telok Ayer MRT", label: "Telok Ayer MRT" },
      { value: "Napier MRT", label: "Napier MRT" },
      { value: "Marine Terrace MRT", label: "Marine Terrace MRT" },
      { value: "Upper Changi MRT", label: "Upper Changi MRT" },
      { value: "Tanjong Katong MRT", label: "Tanjong Katong MRT" },
      { value: "Fajar LRT", label: "Fajar LRT" },
      { value: "Esplanade MRT", label: "Esplanade MRT" },
      { value: "Somerset MRT", label: "Somerset MRT" },
      { value: "City Hall MRT", label: "City Hall MRT" },
      { value: "Katong Park MRT", label: "Katong Park MRT" },
      { value: "Tampines MRT", label: "Tampines MRT" },
      { value: "Outram Park MRT", label: "Outram Park MRT" },
      { value: "Kupang LRT", label: "Kupang LRT" },
      { value: "Bencoolen MRT", label: "Bencoolen MRT" },
      { value: "Ten Mile Junction LRT", label: "Ten Mile Junction LRT" },
      { value: "Commonwealth MRT", label: "Commonwealth MRT" },
      { value: "Queenstown MRT", label: "Queenstown MRT" },
      { value: "Tengah Plantation MRT", label: "Tengah Plantation MRT" },
      { value: "Nicoll Highway MRT", label: "Nicoll Highway MRT" },
      { value: "Tanah Merah MRT", label: "Tanah Merah MRT" },
      { value: "Bishan MRT", label: "Bishan MRT" },
      { value: "Khatib MRT", label: "Khatib MRT" },
      { value: "Marymount MRT", label: "Marymount MRT" },
      { value: "Sixth Avenue MRT", label: "Sixth Avenue MRT" },
      { value: "Geylang Bahru MRT", label: "Geylang Bahru MRT" },
      { value: "Bayshore MRT", label: "Bayshore MRT" },
      { value: "Upper Thomson MRT", label: "Upper Thomson MRT" },
      { value: "Coral Edge LRT", label: "Coral Edge LRT" },
      { value: "Boon Keng MRT", label: "Boon Keng MRT" },
      { value: "Marine Parade MRT", label: "Marine Parade MRT" },
      { value: "Woodlands South MRT", label: "Woodlands South MRT" },
      { value: "Bedok Reservoir MRT", label: "Bedok Reservoir MRT" },
      { value: "Tampines East MRT", label: "Tampines East MRT" },
      { value: "Lentor MRT", label: "Lentor MRT" },
      { value: "Damai LRT", label: "Damai LRT" },
      { value: "Renjong LRT", label: "Renjong LRT" },
      { value: "Layar LRT", label: "Layar LRT" },
      { value: "Maju MRT", label: "Maju MRT" },
      { value: "Jurong East MRT", label: "Jurong East MRT" },
      { value: "Buona Vista MRT", label: "Buona Vista MRT" },
      { value: "Cantonment MRT", label: "Cantonment MRT" },
      { value: "Hougang MRT", label: "Hougang MRT" },
      { value: "Macpherson MRT", label: "Macpherson MRT" },
      { value: "Kadaloor LRT", label: "Kadaloor LRT" },
      { value: "Pasir Ris MRT", label: "Pasir Ris MRT" },
      { value: "Tanjong Rhu MRT", label: "Tanjong Rhu MRT" },
      { value: "Kent Ridge MRT", label: "Kent Ridge MRT" },
      { value: "Bukit Panjang MRT", label: "Bukit Panjang MRT" },
      { value: "Rumbia LRT", label: "Rumbia LRT" },
      { value: "Mountbatten MRT", label: "Mountbatten MRT" },
      { value: "Kangkar LRT", label: "Kangkar LRT" },
      { value: "Pioneer MRT", label: "Pioneer MRT" },
      { value: "Ubi MRT", label: "Ubi MRT" },
      { value: "Marina Bay MRT", label: "Marina Bay MRT" },
      { value: "Thanggam LRT", label: "Thanggam LRT" },
      { value: "Imbiah MRT", label: "Imbiah MRT" },
      { value: "Canberra MRT", label: "Canberra MRT" },
      { value: "Riviera LRT", label: "Riviera LRT" },
      { value: "Tampines West MRT", label: "Tampines West MRT" },
      { value: "Kembangan MRT", label: "Kembangan MRT" },
      { value: "Woodleigh MRT", label: "Woodleigh MRT" },
      { value: "Woodlands North MRT", label: "Woodlands North MRT" },
      { value: "Lakeside MRT", label: "Lakeside MRT" },
      { value: "Tawas MRT", label: "Tawas MRT" },
      { value: "Bendemeer MRT", label: "Bendemeer MRT" },
      { value: "Ranggung LRT", label: "Ranggung LRT" },
      { value: "Bright Hill MRT", label: "Bright Hill MRT" },
      { value: "Keppel MRT", label: "Keppel MRT" },
      { value: "Sumang LRT", label: "Sumang LRT" },
      { value: "Punggol Point LRT", label: "Punggol Point LRT" },
      { value: "Tan Kah Kee MRT", label: "Tan Kah Kee MRT" },
      { value: "Lorong Chuan MRT", label: "Lorong Chuan MRT" },
      { value: "Bukit Gombak MRT", label: "Bukit Gombak MRT" },
      { value: "Keat Hong LRT", label: "Keat Hong LRT" },
      { value: "West Coast MRT", label: "West Coast MRT" },
      { value: "Paya Lebar MRT", label: "Paya Lebar MRT" },
      { value: "Serangoon MRT", label: "Serangoon MRT" },
      { value: "Telok Blangah MRT", label: "Telok Blangah MRT" },
      { value: "Toh Guan MRT", label: "Toh Guan MRT" },
      { value: "Aljunied MRT", label: "Aljunied MRT" },
      { value: "Springleaf MRT", label: "Springleaf MRT" },
      { value: "Chinese Garden MRT", label: "Chinese Garden MRT" },
      { value: "Meridian LRT", label: "Meridian LRT" },
      { value: "Cashew MRT", label: "Cashew MRT" },
      { value: "Jurong West MRT", label: "Jurong West MRT" },
      { value: "Kaki Bukit MRT", label: "Kaki Bukit MRT" },
      { value: "Newton MRT", label: "Newton MRT" },
      { value: "Dhoby Ghaut MRT", label: "Dhoby Ghaut MRT" },
      { value: "Botanic Gardens MRT", label: "Botanic Gardens MRT" },
      { value: "Eunos MRT", label: "Eunos MRT" },
      { value: "Maxwell MRT", label: "Maxwell MRT" },
      { value: "Tai Seng MRT", label: "Tai Seng MRT" },
      { value: "Farmway LRT", label: "Farmway LRT" },
      { value: "Sembawang MRT", label: "Sembawang MRT" },
      { value: "Bugis MRT", label: "Bugis MRT" },
      { value: "Bedok MRT", label: "Bedok MRT" },
      { value: "Pasir Ris East MRT", label: "Pasir Ris East MRT" },
      { value: "Pending LRT", label: "Pending LRT" },
      { value: "Bakau LRT", label: "Bakau LRT" },
      { value: "Pasir Panjang MRT", label: "Pasir Panjang MRT" },
      { value: "Corporation MRT", label: "Corporation MRT" },
      { value: "Choa Chu Kang West MRT", label: "Choa Chu Kang West MRT" },
      { value: "Caldecott MRT", label: "Caldecott MRT" },
      { value: "Woodlands MRT", label: "Woodlands MRT" },
      { value: "Tanjong Pagar MRT", label: "Tanjong Pagar MRT" },
      { value: "Peng Kang Hill MRT", label: "Peng Kang Hill MRT" }
    ],
  };

  try {
    // const data = await PropTypeCol.find(); // Fetch all documents from the collection
    res.status(200).json(Property_types);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};


export const profileSave = async (req, res, next) => {
  const { username, email, id } = req.body;
  const updatedData = {
    username: username,
    email: email,
  };
  try {
    await User.updateOne({ _id: id }, { $set: updatedData });
    res.json("update successfully");
  } catch (error) {
    console.error("Error fetching detail:", error);
    res.status(500).json({ error: "Internal Server Error11111" });
  }
};
export const roleChange = async (req, res, next) => {

  const { id, role } = req.body;
  const updatedData = {
    role: role,
  };
  try {
    await User.updateOne({ _id: id }, { $set: updatedData });
    res.json("update successfully");
  } catch (error) {
    console.error("Error fetching detail:", error);
    res.status(500).json({ error: "Internal Server Error11111" });
  }
};
export const pwdChange = async (req, res, next) => {
  const { old_pwd, new_pwd, confirm_pwd, id } = req.body;
  if (new_pwd != confirm_pwd)
    res.status(500).json({ error: "mismatching password" });

  const duplicate = await User.findOne({
    $or: [
      { _id: id }, // Assuming your user model has a username field
      { password: bcrypt.hashSync(new_pwd, 10) },
    ],
  });
  if (!duplicate) res.status(500).json({ error: "mismatching password" });

  const updatedData = {
    password: bcrypt.hashSync(new_pwd, 10),
  };
  try {
    await User.updateOne({ _id: id }, { $set: updatedData });
    res.json("update successfully");
  } catch (error) {
    console.error("Error fetching detail:", error);
    res.status(500).json({ error: "Internal Server Error11111" });
  }
};


export const changeSalesPerson = async (req, res, next) => {
  const { dbIndex, userID, userName } = req.body;
  try {
    await SalesPerson.updateOne({ dbIndex: dbIndex }, { $set: { userID: userID, userName: userName } });
    res.json("update successfully");
  } catch (error) {
    console.error("Error fetching detail:", error);
    res.status(500).json({ error: "Internal Server Error11111" });
  }
};

export const getSalesPerson = async (req, res, next) => {
  try {
    // Fetch all salespersons from the database
    const salesPersons = await SalesPerson.find();
    res.status(200).json(salesPersons); // Send the data as JSON
  } catch (error) {
    console.error('Error fetching salespersons:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


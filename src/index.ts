import express,{Application,Request,Response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import { PORT } from './config/config';
import mongoConnect from './db/db';
import productRoute from './routes/product';
import orderRoute from './routes/Order';
import ProductModel from './models/Product';

dotenv.config();

const app:Application = express();

mongoConnect();

// Seed/Update products database
async function seedProducts() {
  try {
    // 1. Geodnet MobileCM (Triple-band) -> 61,999
    await ProductModel.findOneAndUpdate(
      { productId: "1" },
      {
        name: "Geodnet MobileCM (Triple-band)",
        description: "The GEODNET mission is to gather dense real-time geospatial data from the Earth and her Atmosphere using a new class of roof-mounted Space Weather stations.‍ You will earn GEOD tokens for installing this.‍",
        price: "61,999",
      },
      { upsert: true, new: true }
    );
    // 2. MGW310 Multi-Platform Station -> 1,20,000
    await ProductModel.findOneAndUpdate(
      { productId: "2" },
      {
        name: "MGW310 Multi-Platform Station - GEODNET & Wingbits Compatible",
        description: "Track your health metrics, workouts, and notifications with our waterproof, feature-packed smart fitness watch with 7-day battery life.",
        price: "1,20,000",
      },
      { upsert: true, new: true }
    );
    // 3. Wingbits WB200 -> 59,999
    await ProductModel.findOneAndUpdate(
      { productId: "7" },
      {
        name: "Wingbits WB200",
        description: "The Wingbits WB200 is a high-performance ADS-B tracking station designed to track aircraft and feed flight data to the decentralized Wingbits network. Earn WING tokens for providing coverage.",
        price: "59,999",
      },
      { upsert: true, new: true }
    );
    console.log("Database products seeded/updated successfully!");
  } catch (error) {
    console.error("Error seeding products database:", error);
  }
}
seedProducts();

const corsOptions={
    origin: process.env.NODE_ENV === 'dev' 
        ? 'http://localhost:5173' 
        : ['https://blockstore.in', 'https://www.blockstore.in'],
    methods:['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-VERIFY', 'X-MERCHANT-ID'],
    credentials:true
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({
    extended:false
}));

app.use("/api",productRoute);
app.use("/api/order", orderRoute);

app.get("/",(_req:Request,res:Response)=>{
    res.json({
        msg:"Application Running"
    })
    return;
})

app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`)
})


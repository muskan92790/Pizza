import mongoose from "mongoose"

 export const connectDB = async ( ) => {
    await mongoose.connect('mongodb+srv://greatstack:9279060173@cluster0.aeecj.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}
    
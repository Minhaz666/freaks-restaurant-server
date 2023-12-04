const express = require('express')
const app = express()
const cors= require('cors')
const port = process.env.PORT ||5000
require('dotenv').config()

app.use(cors())
app.use(express.json())

//connection mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clusterfirst.7ajn2mv.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // database connection
    const database = client.db("freaksDb");
    const menuCollection = database.collection("menu");
    const reviewsCollection = database.collection("reviews");
    const cartCollection = database.collection("carts");

// for get
    app.get('/menu',async (req,res)=>{
        
        const result= await  menuCollection.find().toArray()
        res.send(result)

    })

    app.get('/reviews',async (req,res)=>{
        
        const result= await  reviewsCollection.find().toArray()
        res.send(result)

    })

    app.get('/carts', async(req,res)=>{
      const result= await cartCollection.find().toArray()
      res.send(result)
    })
   
    // for post
    app.post('/carts', async (req,res)=>{
      const item=req.body;
      const result=await cartCollection.insertOne(item);
      res.send(result)
    })


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// app.get('/', (req, res) => {
//   res.send('boss aitase')
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



//freaks-restaurant
//NMGucKxJIuql2tMO
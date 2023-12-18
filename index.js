const express = require('express')
const app = express()
const cors= require('cors')
const port = process.env.PORT ||5000
require('dotenv').config()
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())

const verifyToken=(req,res,next)=>{
const authorization=req.headers.authorization;
// console.log(authorization);
if(!authorization){
  return res.status(402).send({error:true,message:'unauthorized'})
}

const token=authorization.split(' ')[1]

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
  if(err){
    return res.status(401).send({error:true,message:'unauthorized'})
  }
  req.decoded=decoded;
  next()
});
}

//connection mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const usersCollection = database.collection("users");

// for get
    app.get('/menu',async (req,res)=>{
        
        const result= await  menuCollection.find().toArray()
        res.send(result)

    })

    app.get('/reviews',async (req,res)=>{
        
        const result= await  reviewsCollection.find().toArray();
        res.send(result)

    })

    
    //for practice old style
    // app.get('/carts/:id',async (req,res)=>{
    //     const email=req.params.id;
    //     console.log(email)
    //     const query={email:email}
    //     const result= await  cartCollection.find(query).toArray()
    //     res.send(result)

    // })

    
    app.get('/carts', verifyToken ,async(req,res)=>{
      const email=req.query.email
      // console.log(email)
      if(!email)
      {
        res.send([]);
      }

      const decodedEmail=req.decoded.email;
      console.log(decodedEmail);
      if(decodedEmail!==email)
      {
        return res.status(403).send({error:true,message:'access forbidden'})
      }

      const query={email:email}
      const result= await cartCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/users',async(req,res)=>{
      const result=await usersCollection.find().toArray();
      res.send(result)
    })
   
    
    // ****for post*****

    app.post('/jwt',(req,res)=>{
      const user=req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      // console.log(user,token)
      res.send({token});
    })

    app.post('/carts', async (req,res)=>{
      const item=req.body;
      const result=await cartCollection.insertOne(item);
      res.send(result)
    })

    app.post('/users',async (req,res)=>{
      const user=req.body;
      // console.log(item)
      const query={email:user.email};
      const existing=await usersCollection.findOne(query);
      if(existing){
        return ;
      }
      const result=await usersCollection.insertOne(user)
      res.send(result)
    })

    // for update

    app.patch('/users/admin',async (req,res)=>{
      const id=req.query.user;
      // console.log(id)
      const filter={_id : new ObjectId(id)}
      const updateDoc = {
        $set: {
          role: `admin`
        },
      };
      const result=await usersCollection.updateOne(filter,updateDoc)
      res.send(result)
    })

    // ****for delete****

    app.delete('/carts',async(req,res)=>{
      const id=req.query.id;
      console.log(id)

      const query= {_id: new ObjectId (id)}
      const result= await cartCollection.deleteOne(query);
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



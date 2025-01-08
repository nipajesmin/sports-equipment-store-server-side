const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kgk5l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

//console.log(uri);
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
    // Connect the client to the server	(optional starting in v4.7)
   // await client.connect();

    const equipmentCollection = client.db('SportsEquipment').collection('addEquipments');
    // Send a ping to confirm a successful connection
    const userCollection = client.db('SportsEquipment').collection('user');
    const myAllEquipments = client.db('SportsEquipment').collection('myEquipments');

    app.get('/addEquipments', async (req, res) => {
      const cursor = equipmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/addEquipments', async (req, res) => {
      const newEquipment = req.body;
      console.log(newEquipment);
      const result = await equipmentCollection.insertOne(newEquipment);
      res.send(result);
    })

    //users related apis
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log('added new user', newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);

    })

    app.get('/users', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    // for disply equipment by mail(user)
    app.get('/myEquipments/:email', async (req, res) => {
      const userEmail = req.params.email; // Get the email from the request parameters
      try {
        const result = await equipmentCollection.find({ userEmail }).toArray(); // Query MongoDB for equipment added by this email
        res.send(result); // Send the result back to the client
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while fetching equipments." });
      }
    });


    //delete item from my equipment list
    app.delete('/myEquipments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await equipmentCollection.deleteOne(query);
      res.send(result);
    });

    //update item

    app.get('/myEquipment/:id', async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await equipmentCollection.findOne(query);
      res.send(result);
    })
    app.put('/myEquipment/:id', async (req, res) => {
      const id = req.params.id;
      // const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateEquip = req.body;
      const Equip = {
        $set: {
          name: updateEquip.name,
          categoryname: updateEquip.categoryname,
          image: updateEquip.image,
          description: updateEquip.description,
          price: updateEquip.price,
          rating: updateEquip.rating,
          customization: updateEquip.customization,
          processingTime: updateEquip.processingTime,
          stockStatus: updateEquip.stockStatus,
          
        }
      };
      
      const result = await equipmentCollection.updateOne(filter, Equip , options);
      res.send(result);
    });




   // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("sports equipment is coming");
})

app.listen(port, () => {
  console.log(`sports equipment is coming on port ${port}`);

})
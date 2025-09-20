require('dotenv').config()
const express = require('express');
var cors = require('cors')
const app=express()
app.use(cors())
app.use(express.json({ limit: "10mb" }))
const port=process.env.PORT||3000;
const db_username=process.env.DB_USER
const db_password=process.env.DB_PASS
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${db_username}:${db_password}@cluster5070.oxrvsh3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster5070`;

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
    //await client.connect();
    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const marketplace=client.db('wholesale_platfrom').collection('marketplace')
    app.get('/products',async(req,res)=>{
         const allproducts=req.body
         const products=await marketplace.find().toArray()  
         res.send(products)  
    })
    app.get('/products/:catagoryid/:productid',async(req,res)=>{
      const  catagoryid=req.params.catagoryid
      const  productid=req.params.productid
      const catagory={'_id':new ObjectId(catagoryid)}
      const findcatagory=await marketplace.findOne(catagory)
      const findproduct=findcatagory.items.find(p=>p._id==productid)
      res.send(findproduct)
    })
    app.get('/products/:catagoryid',async(req,res)=>{
      const  catagoryid=req.params.catagoryid
      const catagory={'_id':new ObjectId(catagoryid)}
      const findcatagory=await marketplace.findOne(catagory)
      res.send(findcatagory);
    })

    app.patch('/products/:catagoryid/:productid',async(req,res)=>{
      const  catagoryid=req.params.catagoryid
      const  productid=req.params.productid
       const filter={_id:new ObjectId(catagoryid),'items._id':productid}
       const data=req.body
       const updatedoc={
        $set:{
       "items.$.image": data.image,
        "items.$.name": data.name,
        "items.$.brand_name": data.brand,
        "items.$.main_quantity": data.stock,
        "items.$.minimum_selling_quantity": data.sell,
        "items.$.rating": data.rating,
        "items.$.short_description": data.description
        }
      }; 
       const result=await marketplace.updateOne(filter,updatedoc)
       res.send(result)
    })

    app.post('/products',async(req,res)=>{
               const category=req.body.category
               const specificcatagory=await marketplace.findOne({category})
               const newid=specificcatagory.items.length+50
               const newitem={...req.body,_id: String(newid) }
               const result=await marketplace.updateOne(
               {'category':category},
                {$push:{items:newitem}}
               )
              res.send(result) 
            })


    app.patch('/products/:catagoryid/:productid/stock',async(req,res)=>{
      const main_quantity=req.body.main_quantity
      const quantity=req.body.quantity
      const catagoryid=req.params.catagoryid
      const productid=req.params.productid
      const selectedproduct={_id:new ObjectId(catagoryid),'items._id':productid}
      const updatedoc={
                $set: {
      'items.$.main_quantity': main_quantity - quantity
    }
      }
      const result=await marketplace.updateOne(selectedproduct,updatedoc)
      res.send(result)
    })

    const cartproduct=client.db('wholesale_platfrom').collection('cartproduct')
    app.post('/cart',async(req,res)=>{
      //const categoryid=req.params.categoryid
      //const productid=req.params.productid
      //const selectedproduct={_id:new ObjectId(categoryid),'items._id':productid}
      const product=req.body
      const result=await cartproduct.insertOne(product)
      res.send(result)
    })

    app.get('/cart',async(req,res)=>{
      const product=req.body
      const result=await cartproduct.find().toArray()
      res.send(result)
    })

    app.delete('/cart/:_id',async(req,res)=>{
      const id=req.params._id
      const result=await cartproduct.deleteOne({_id:id})
      res.send(result)
    })

    /*app.patch('/cart/:catagoryid/:productid',async(req,res)=>{
      const main_quantity=req.body.main_quantity
      const quantity=req.body.quantity
      const catagoryid=req.params.catagoryid
      const productid=req.params.productid
      const selectedproduct={'_id':productid,'catagoryid':catagoryid}
      const updatedoc={
                $set: {
      'items.$.main_quantity': main_quantity + quantity
    }
      }
      const result=await marketplace.updateOne(selectedproduct,updatedoc)
      res.send(result)
    })*/
   
}
  finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    console.log('arnim')
     res.send('arnim')
})
app.listen(port,()=>{
    console.log(`the server is running at ${port}`)
})
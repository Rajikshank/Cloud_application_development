const express=require('express');
const router=express.Router();
const {check,validationResult}=require('express-validator');
const auth=require('../../middleware/auth');
const { json } = require('express');
const User=require('../../models/Users')
const Profile=require("../../models/Profile");
const Hospitals =require('../../models/Hospitals');
const Post = require('../../models/Post');

//@route  POST api/post/
//@desc   add posts 
//@access  private

router.post('/',[auth ,check('text','Text is not found').not().isEmpty()],
async (req,res)=>{

   
const errors=validationResult(req);

if(!errors.isEmpty()){ // checking for the errors 
   return res.status(400).json({errors:errors.array()});
}


try {
    const user=await User.findById(req.user.id).select('-password');

const newPost=new Post({
    user:req.user.id,
    text:req.body.text,
    name:user.name,
    avatar:user.avatar,
});

 await newPost.save();
res.json(newPost);

} catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
    
}


});




//@route  PUT api/post/all/approve/:id
//@desc   approve a post
//@access  private

router.put('/all/approve/:id',auth, async(req,res)=>{
    

    try {
        const post =await Post.findById(req.params.id);// getting the post 
        const user = await User.findById(req.user.id); // getting the user for check its a hospital account or not 

        if(user.Hospital){
            post.Aprovel= req.body.Approvel;
            await post.save();
            return res.json({msg:'Post '+ (req.body.Approvel===true ? 'Approved' : 'Not Approved')})
        }

        
       res.json({msg:'Access denied'});
    } catch (err) {
        console.error(err.message)
    if(err.kind==='ObjectId'){
        return res.status(404).json({msg:'Post not found '})
    }
    res.status(500).send("Server Error")
        
    }
})




//@route  GET api/post/
//@desc   Get all posts
//@access  private

router.get('/all',auth,async (req,res)=>{
    try {
        const posts=await Post.find().sort({date:-1});
        res.json(posts);
    } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
    }
})



//@route  GET api/post/
//@desc   Get only the approved posts
//@access  private

router.get('/',auth,async (req,res)=>{
    try {
        const posts=await Post.find().sort({date:-1});
        const acc_post=posts.filter(post=>post.Aprovel===true);
       // console.log(acc_post);


        res.json(acc_post);
    } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
    }
})





//@route  GET api/post/:id
//@desc   Get post by id 
//@access  private

router.get('/:id',auth,async (req,res)=>{
    try {
        const post=await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg:'Post not found '})
        }

        res.json(post);
    } catch (err) {
    console.error(err.message)
    if(err.kind==='ObjectId'){
        return res.status(404).json({msg:'Post not found '})
    }
    res.status(500).send("Server Error")
    }
});



//@route  DELETE api/post/:id
//@desc   Delete the post
//@access  private

router.delete('/:id',auth,async (req,res)=>{
    try {
        const post=await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg:'Post not found '})
        }


        if(post.user.toString() !==req.user.id){
            return res.status(401).json({msg:'user not authorized'});
        }
        
        await post.remove();
        res.json({msg:'Post removedd'})
    } catch (err) {
    console.error(err.message)
    if(err.kind==='ObjectId'){
        return res.status(404).json({msg:'Post not found '})
    }
    res.status(500).send("Server Error") 
    }
})

//@route  PUT api/post/participants/:id
//@desc   add participants for  the post
//@access  private

router.put('/participants/:id',auth,async(req,res)=>{

    try {
        
        const post=await Post.findById(req.params.id);

        if(post.participants.filter(part=>part.user.toString()=== req.user.id).length>0){
            return res.status(400).json({msg:'Already joined as a participant'});
        }
        
        const user= await User.findById(req.user.id);
        const user_object={user:req.user.id, avatar:user.avatar};
       // console.log(user)
        post.participants.unshift(user_object);

        await post.save();

        res.json(post.participants);

    } catch (err) {
        
    console.error(err.message)
     res.status(500).send("Server Error")
    }

})





//@route  PUT api/post/rm-participants/:id
//@desc   remove participants for  the post
//@access  private

router.put('/rm-participants/:id',auth,async(req,res)=>{

    try {
        
        const post=await Post.findById(req.params.id);

        if(post.participants.filter(part=>part.user.toString()=== req.user.id).length===0){
            return res.status(400).json({msg:'not a participant for this post'});
        }

       const rmvidx=post.participants.map(part=>part.user.toString()).indexOf(req.user.id);

        post.participants.splice(rmvidx,1);
        await post.save();

        res.json(post.participants);

    } catch (err) {
        
    console.error(err.message)
     res.status(500).send("Server Error")
    }

})




module.exports=router
 
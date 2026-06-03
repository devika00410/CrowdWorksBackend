import BlogDetail from "../Models/BlogDetail.js";
import BlogCard from "../Models/Blog.js";


// Create blog details

export const createBlogDetail = async (req,res)=>{
    try{
        const {title,excerpt,coverImage,category,publishedAt,content,author,tags,seoTitle,
            seoDescription} = req.body;

            // Create blog details 

            const blogDetail = await BlogDetail.create({
                content,author,tags,seoTitle,seoDescription
            })
            // Create blog card and link to details

            const blogCard = await BlogCard.create({
                title,excerpt,coverImage,category,publishedAt, detailid:blogDetail._id
            })

            // Link blog card to details

            blogDetail.blogCardId = blogCard._id;
            await blogDetail.save();
            res.status(201).json({
                success:true,
                message:"Blog created successfully",
                data:{blogCard,blogDetail}
            })
        } catch(error){
            res.status(500).json({
                success:false,
                message:"Failed to create blog",
                error:error.message
            })
        }
    }

    // Get all blog details

    export const getAllBlogDetails = async (req,res)=>{
        try{
            const {page = 1, limit =10} = req.query;
            const skip = (Number(page) -1 ) * Number(limit);

            const [blogDetails, total] = await Promise.all([
                BlogDetail.find()
                .populate("blogCardId")
                .sort({createdAt: -1})
                .skip(skip)
                .limit(Number(limit)),
                BlogDetail.countDocuments()
            ]);
            res.status(200).json({
                success:true,
                message: "Blog details fetched successfully",
                data:blogDetails,
                pagination:{
                    total,
                    page:Number(page),
                    limit:Number(limit),
                    totalPages:Maths.ceil(total/Number(limit))
                }
            })
        } catch(error){
            res.status(500).json({
                success:false,
                message: "Failed to fetch blog details",
                error:error.message
            })
        }
    }

    // Get blog details by ID

    export const getBlogDetailById = async (req,res)=>{
        try{
            const{id} = req.params;
            const blogDetail = await BlogDetail.findByIdAndUpdate(id,
                {$inc: {views:1}},
                {new:true}
            ) .populate("blogCardId")

            if(!blogDetail){
                return res.status(404).json({
                    success:false,
                    message: "Blog detail not found"
                })
            }

            res.status(200).json({
                success:true,
                data:blogDetail,
                message:"Blog detail fetched successfully"
            })
        } catch(error){
            res.status(500).json({
                success:false,
                message:"Failed to fetch blog detail",
                error: error.message
            })
        }
    }

    // Update blog details

    export const updateBlogDetail = async (req,res)=>{
        try{
            const {id} = req.params;
            const {title,excerpt,coverImage,category,publishedAt,content,author,
                tags,seoTitle,seoDescription} = req.body;

                // Update Blogdetail

                const blogDetail = await BlogDetail.findByIdAndUpdate(
                    id,
                    {content,author,tags,seoTitle,seoDescription},
                    {new:true, runValidators:true}
                )

                if(!blogDetail){
                    return res.status(404).json({
                        success:false,
                        message:"Blog detail not found"
                    })
                }
                // Sync card fields if provided

                if(blogDetail.blogCardId){
                    await BlogCard.findByIdAndUpdate(
                        blogDetail.blogCardId,
                        {title,excerpt,coverImage,category,publishedAt},
                        {new:true, runValidators:true}
                    )
                }
                res.status(200).json({
                    success:true,
                    data:blogDetail,
                    message:"Blog detail updated successfully"
                })  
        } catch(error){ 
            res.status(500).json({
                success:false,
                message:"Failed to update blog detail", 
                error:error.message
            })
        }
    }

// Delete blog details

export const deleteBlogDetail = async (req,res)=>{
    try{
        const {id} = req.params;
        const blogDetail = await BlogDetail.findByIdAndDelete(id);
        if(!blogDetail){
            return res.status(404).json({
                success:false,
                message:"Blog detail not found"
            })
        }
        // Also delete the linked BlogCard
        if(blogDetail.blogCardId){
            await BlogCard.findByIdAndDelete(blogDetail.blogCardId)
        }
        res.status(200).json({
            success:true,
            data:null,
            message:"Blog detail and its card deleted successfully"
        })
    } catch(error){
        res.status(500).json({
            success:false,  
            message:"Failed to delete blog detail",
            error:error.message
        })
    }
}
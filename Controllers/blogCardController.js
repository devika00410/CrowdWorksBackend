import BlogCard from '../Models/Blog.js';
import BlogDetail from '../Models/BlogDetails.js';



// Get all blog cards

export const getAllBlogCards = async (req,res) =>{
    try{
        const {category, page =1, limit = 10} = req.query;

        const filter ={}

        if(category) filter.category = category;
         const skip =(Number(page) -1) * Number(limit)

         const [blogCards, total] = await Promise.all([
            BlogCard.find(filter)
            .sort({publishedAt: -1})
            .skip(skip)
            .limit(Number(limit)),
            BlogCard.countDocuments(filter)
         ]);

         res.status(200).json({
            success:true,
            message: "Blog cards fetched successfully",
            data:blogCards,
            pagination:{
                total,
                page:Number(page),
                limit:Number(limit),
                totalPages: Math.ceil(total/Number(limit))
            }
         })

    } catch(error){
        res.status(500).json({
            success:false,
            message:"Failed to fetch blog cards",
            error:error.message
        })
    }
}


// Get Blog Card By ID

export const getBlogCardById = async (req,res)=>{
    try{
        const {id} = req.params;
        const blogCard = await BlogCard.findById(id).populate('detailId')

        if(!blogCard){
            return res.status(404).json({
                success:false,
                message:"Blog card not found"
            })
        }
        res.status(200).json({
            success:true,
            data:blogCard,
            message:"Blog cards fetched successfully"
        })
    } catch(error){
        res.staus(500).json({
            success:false,
            message:"Failed to fetch blog card",
            error:error.message
        })
    }
}

export const createBlogCard = async (req, res) => {
  try {
    const { title, excerpt, coverImage, category, publishedAt } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Title and category are required",
      });
    }

    const blogCard = await BlogCard.create({
      title,
      excerpt,
      coverImage,
      category,
      publishedAt: publishedAt || Date.now(),
    });

    res.status(201).json({
      success: true,
      data: blogCard,
      message: "Blog card created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create blog card",
      error: error.message,
    });
  }
};

export const updateBlogCard = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedBlogCard = await BlogCard.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBlogCard) {
      return res.status(404).json({
        success: false,
        message: "Blog card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedBlogCard,
      message: "Blog card updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update blog card",
      error: error.message,
    });
  }
};

// Delete Blog Card

export const deleteBlogCard = async (req,res)=>{
    try{
        const {id} = req.params;

        const blogCard = await BlogCard.findByIdAndDelete(id);

        if(!blogCard){
            return res.status(404).json({
                success:false,
                message:"Blog card not found"
            })
        }
        // Also delete the linked BlogDetail
        if(blogCard.detailId){
            await BlogDetail.findByIdAndDelete(blogCard.detailId)
        }

        res.status(200).json({
            success:true,
            data:null,
            message:"Blog card and its details deleted successfully"
        })
    } catch(error){
        res.status(500).json({
            success:false,
            message:"Failed to delete blog card",
            error:error.message
        })
    }
}
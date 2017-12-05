const express=require('express');
const router=express.Router();

const checkLogin=require('../middlewares/check').checkLogin
const CommentModel=require('../models/comments')

//post/comment 创造一条留言
router.post('/',checkLogin,function(req,res,next)
{
	const author=req.session.user._id
	const postId=req.fields.postId
	const content=req.fields.content

	//参数校验
	try{
		if(!content.length)
		{
			throw new Error('请填写留言')
		}
	}
	catch(e)
		{
			req.flash('error',e.message)
			return res.redirect('back')
		}

		const comment={
			author:author,
			postId:postId,
			content:content
		}

		CommentModel.create(comment)
		.then(function(){
			req.flash('success','留言成功')
			//跳转
			res.redirect('back')
		})
		.catch(next)
})

//get/comments/:commentsId/remove 删除一条留言
router.get('/:commentId/remove',checkLogin,function(req,res,next)
{
	const commentId=req.params.commentId
	const author=req.session.user._id

	CommentModel.getCommentById(commentId)
	.then(function(comment)
	{
		if(!comment)
		{
			throw new Error('留言不存在')
		}
		if(comment.author.toString()!==author.toString())
		{
			throw new Error('没有权限删除留言')
		}
		CommentModel.delCommentById(commentId)
		.then(function(){
			req.flash('success','删除留言成功')
			//删除成功后跳转到上一页
			res.redirect('back')
		})
		.catch(next)
	})
})

module.exports=router;
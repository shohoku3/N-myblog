const express=require('express')
const router=express.Router()

const PostModel=require('../models/posts')
const CommentModel=require('../models/comments')
const checkLogin=require('../middlewares/check').checkLogin

//GET/POST 所有用户或者特定用户的文章页
//eg GET/post?author=XX
router.get('/',function(req,res,next){
	const author=req.query.author

	PostModel.getPosts(author)
	.then(function(posts){
		res.render('posts',{
			posts:posts
		})
	})
	.catch(next)
})


//POST/post/creat 发表一篇aarticle
router.post('/create',checkLogin,function(req,res,next){
	const author=req.session.user._id
	const title=req.fields.title
	const content=req.fields.content

	//参数校验
	try{
		if(!title.length)
		{
			throw new Error('请填写标题')
		}
		if(!content.length)
		{
			throw new Error('请填写内容')
		}
	}
	catch(e)
		{
			req.flash('error',e.message)
			return res.redirect('back')
		}

		let post={
			author:author,
			title:title,
			content:content,
			pv:0
		}

		PostModel.create(post)
		.then(function(result)
		{
			//此post是插入mongodb的后的值，包含_id
			post=result.ops[0];
			//写入flash
			req.flash('success','发表成功')
			//发表成功后跳转到文章页
			res.redirect('/posts')
		})
		.catch(next)
})

//GET /posts/create
router.get('/create',checkLogin,function(req,res,next){
	res.render('create');
})

//GET /posts/setting
router.get('/setting',checkLogin,function(req,res,next)
{
	res.render('info')
})
//GET/posts/:postId 单一文章界面
router.get('/:postId',function(req,res,next)
{
	const postId=req.params.postId

	Promise.all([
		PostModel.getPostById(postId),// 获取文章信息
		CommentModel.getComments(postId),
		PostModel.incPv(postId)])//pv+1
	.then(function(result)
	{
		const post=result[0]
		const comments=result[1]
		if(!post)
		{
			throw new Error('该文章不存在')
		}

		res.render('post',{
			post:post,
			comments:comments
		})
	})
	.catch(next)
})

//GET/posts/:postId/edit get更新文章页
router.get('/:postId/edit',checkLogin,function(req,res,next){
	const postId=req.params.postId
	const author=req.session.user._id

	PostModel.getRawPostById(postId)
	.then(function(post)
	{
		if(!post)
		{
			throw new Error('该文章不存在')
		}
		if(author.toString()!==post.author._id.toString())
		{
			throw new Error('权限不足')
		}
		res.render('edit',{
			post:post
		})
	})
	.catch(next)
})

//POST/posts/:postId/edit更新一篇文章
router.post('/:postId/edit',checkLogin,function(req,res,next){
	const postId=req.params.postId
	const author=req.session.user._id
	const title=req.fields.title
	const content=req.fields.content
	//参数校验
	try{
		if(!title.length)
		{
			throw new Error('标题不能为空')
		}
		if(!content.length)
		{
			throw new Error('内容不能为空')
		}
	}catch(e)
	{
		req.flash('error',e.message)
		return res.redirect('back')
	}

	PostModel.getRawPostById(postId)
	.then(function(post)
	{
		if(!post)
		{
			throw new Error('文章不存在')
		}
		if(post.author._id.toString()!==author.toString())
		{
			throw new Error('权限受限')
		}
		PostModel.updatePostById(postId,{title:title,content:content})
		.then(function()
		{
			req.flash('success','编辑文章成功')
			//编辑成功后跳转到上一页
			res.redirect('/posts')
		})
		.catch(next)
	})
})

//POST/posts/：postId/remove
router.get('/:postId/remove',checkLogin,function(req,res,next)
{
	const postId=req.params.postId
	const author=req.session.user._id

	PostModel.getRawPostById(postId)
	.then(function(post)
	{
		if(!post)
		{
			throw new Error('文章不存在')
		}
		if(post.author._id.toString()!==author.toString())
		{
			throw new Error('没有权限')
		}
		PostModel.delPostById(postId)
		.then(function(){
			req.flash('success','删除文章成功')
			//删除后跳转主页
			res.redirect('/posts')
		})
		.catch(next)
	})
})

//get layout test
router.get('/:postId/test',checkLogin,function(req,res,next){
	const title=req.fields.title
	const content=req.fields.content
	const postId=req.params.postId

	PostModel.getRawPostById(postId)
	.then(function(post){
		res.render('test',{post:post})
	})	
})

module.exports=router;
const marked=require('marked');
const Comment=require('../lib/mongo').Comment

//讲comment的content从markdown 转换成html
Comment.plugin('contentToHtml',{
	afterFind:function(Comments){
		return Comments.map(function(comment)
		{
			comment.content=marked(comment.content)
			return comment
		})
	}
})

module.exports={
	//创建一个留言
	create:function create(comment)
	{
		return Comment.create(comment).exec()
	},

	//通过留言ID获取一个留言
	getCommentById:function getCommentById(commentId)
	{
		return Comment.findOne({_id:commentId}).exec()
	},
	//通过留言id删除一个留言
	delCommentById:function delCommentById(commentId)
	{
		return Comment.remove({_id:commentId}).exec()
	},
	//通过文章id删除该文章下所有留言
	delCommentByPostId:function delCommentByPostId(postId)
	{
		return comment.remove({postId:postId}).exec()
	},
	//通过文章Id获取该文章下所有留言,按照创建时间升序
	getComments:function getComments (postId)
	{
		return Comment
		.find({postId:postId})
		.populate({path:'author',model:'User'})
		.sort({_id:1})
		.addCreatedAt()
		.contentToHtml()
		.exec()
	},
	//通过id获取蚊帐下留言数
	getCommentsCount:function getCommentsCount(postId)
	{
		return Comment.count({postId:postId}).exec()
	}
}
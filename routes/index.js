module.exports=function(app){
	app.get('/',function(req,res){
		res.redirect('/posts')
	})
	app.use('/signup',require('./signup'))
	app.use('/signin',require('./signin'))
	app.use('/signout',require('./signout'))
	app.use('/posts',require('./posts'))
	app.use('/comments',require('./comment'))
	//404 page
	app.use(function(rea,res){
		if(!res.headerSent){
			res.status(404).render('404')
		}
	})
}
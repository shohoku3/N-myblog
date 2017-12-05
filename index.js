const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const config = require('config-lite')(__dirname);
const routes = require('./routes');
const pkg = require('./package');
const winston = require('winston');
const expressWinston = require('express-winston');

const app = express();

//设置模板目录
app.set('views', path.join(__dirname, 'views'));
//join()将多个参数聚合将js执行地址(__dirname)和views聚合

//设置模板引擎为 ejs
app.set('view engine', 'ejs');

//设置静态文件路径
app.use(express.static(path.join(__dirname, 'public')));

//session middleware
app.use(session({
  name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false, // 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge // 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({ // 将 session 存储到 mongodb
    url: config.mongodb // mongodb 地址
  })
}))

//flash 中间件
app.use(flash());

//处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'), //上传文件目录
  keepExtensions: true //保留后缀
}))

//设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description,
}

//添加模板必须的三个变量
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
  })
  //正常请求日志
app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: 'logs/success.log'
      })
    ]
  }))
  //路由
routes(app);
//错误请求日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))

//错误检测
app.use(function(err, req, res, next) {
  console.error(err)
  req.flash('error', err.message)
  res.redirect('/posts')
})
if (module.parent) {
  //被require,则导出app
  module.exports = app
} else {
  //监听端口,启动程序
  app.listen(config.port, function() {
    console.log('${pkg.name} listening on port ${config.port} ')
  })
}
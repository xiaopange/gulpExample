var gulp = require("gulp");
//var shelljs=require('shelljs'); //引入shelljs

var browserify = require("browserify"); //引入browserify
var fs = require("fs"); //引入fs，fs是node的核心模块之一，不需要在npm install下载

var sequence = require("run-sequence"); //可以在一个task 中调用其它的 task。

var watchify = require("watchify"); //引入watchify插件来自动化构建

var uglify=require('gulp-uglify'); //引入gulp-uglify
var source =require('vinyl-source-stream');
var buffer = require("vinyl-buffer");

gulp.task("default", function() {
  //定义任务用 task；default是gulp默认的任务
  //console.log('this is default task!')
  //shelljs.exec('browserify js/index.js -o js/main.js') //(1)通过shelljs来调用browserify，browserify可以作为可执行文件直接再shelljs中调用
  /*
		下面：  （2）通过node来调用browserify
			browserify() 是初始化 ， add('js/index.js')是将此js作为输入文件输入到browserify中;
			bundle() 步骤后生成的只是文字内容的stream，还要调用fs模块的createWriteStream()方法将其生成文件，fs.createWriteStream('js/main.js') 里的参数是要生成文件的路劲。

			//browserify().add('js/index.js').bundle().pipe(fs.createWriteStream('js/main.js'))                      
	*/
  //(1)sequence('mainjs','watch') //利用sequence调用 mainjs任务，这可以传多个任务名做参数
  //(2)sequence("mainjs"); //使用了watchify插件后不需要调用 watch 任务了
  //(3)sequence('vendorjs','mainjs') //先执行vendorjs任务生成vendor.js文件，再执行mainjs任务
  sequence("mainjs"); //使用了browserify-shim 来构建第三方类库后不需要调用 vendorjs 任务了
});
/* 2
  * 因为 default 是 gulp默认的task,比较特殊，再加上可能经常修改default执行的内容，所以这里不要将js的构建直接写到default中；新建mainjs 的task用来 执行browserify 构建 js.
  *** 这样就意味着要在一个task(default)中调用另外一个task(mainjs)，这需要用到node 的 run-sequence 模块。这个模块的作用在于可以以 任务名称 作为
      参数 来调用不同的任务。
  * 然后就可以在 default 中利用sequence('mainjs') 来调用mainjs 任务。
    gulp.task('mainjs',function(){
        browserify()
          .add("assets/js/index.js")
          .bundle()
          .pipe(fs.createWriteStream("js/main.js"));  
    });
    gulp.task('watch',function(){
      gulp.watch('assets/js/*.js',function(){ //监听assets/js 下所有的js文件若发生改动则调用mainjs 任务
        sequence('mainjs')
      });
    });
*/
/* 3
	gulp.task('mainjs',function(){
		var b=browserify({ //把browserify初始化的结果赋值给变量b
			entries:['assets/js/index.js'],  //所要编译的文件的入口。index.js中虽然依赖与很多文件但其是入口文件
			cache:{},
			packageCache:{},
			plugin:[watchify]   
		});
		b.on('update',function(){ //当browserify 初始化后会有各update事件，每当监听文件发生变化时都会触发update事件
			bundle()
		});
		bundle()
		function bundle(){
			b.bundle().pipe(fs.createWriteStream("js/main.js"));  
		};
	});
*/
/* 4
	gulp.task("mainjs", function() {
		var b = browserify({
			//把browserify初始化的结果赋值给变量b
			entries: ["assets/js/index.js"], //所要编译的文件的入口。index.js中虽然依赖与很多文件但其是入口文件
			cache: {},
			packageCache: {},
			plugin: [watchify]
		}).external('angular').external('lodash');  //使用了external() 方法后引入vendorjs生成的文件内容，这样main.js就可以使用这两个模块了。
		b.on("update", function() {
			//当browserify 初始化后会有各update事件，每当监听文件发生变化时都会触发update事件
			bundle();
		});
		bundle();
		function bundle() {
			b.bundle().pipe(fs.createWriteStream("js/main.js"));
		}
	});
	gulp.task("vendorjs", function() {
		//borwserify 初始化并将结果复制给变量bb。然后对angular和lodash调用browserify的require方法，
		//同时用expose属性暴露出两者的名称来（相当于为angular 和 lodash 取个别名）。
		//这样做使得生成的vendor.js文件内容能在main.js文件中被使用。
		//最后调用bundel()方法 将结果输出到一个文件中(vendor.js)。
		var bb = browserify()
			.require("./bower_components/angular/angular.js", { expose: "angular" })
			.require("./bower_components/lodash/dist/lodash.js", { expose: "lodash" })
			.bundle()
			.pipe(fs.createWriteStream("./js/vendor.js"));
	}); 
*/
/* 5
gulp.task("mainjs", function() {
  var b = browserify({
    //把browserify初始化的结果赋值给变量b
    entries: ["assets/js/index.js"], //所要编译的文件的入口。index.js中虽然依赖与很多文件但其是入口文件
    cache: {},
    packageCache: {},
    plugin: [watchify]
  })
  var bundle=function bundle() {
    b.bundle().pipe(fs.createWriteStream("js/main.js"));
  };
	bundle();
	b.on('update',bundle);
}); 
*/
gulp.task("mainjs", function() {
  var b = browserify({//把browserify初始化的结果赋值给变量b
    entries: ["assets/js/index.js"], //所要编译的文件的入口。index.js中虽然依赖与很多文件但其是入口文件
    cache: {},
    packageCache: {},
    plugin: [watchify]
  });
  var bundle = function bundle() {
		b
      .bundle()
      .pipe(source("main2.js"))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest("./js/main2.js"));
  };
  bundle();
  b.on("update", bundle);
}); 

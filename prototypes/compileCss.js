/** Part of ThotWeb 2.0
 * @author Erwan Brottier - erwan.brottier@amo-it.com - https://amo-it.com/
 * @version 1.0
 * @date 01/05/2020
 * @category ThotWeb component
 * @copyright (c) 2011-2020 Erwan Brottier */

var less = require('less'),
    CleanCSS = require('clean-css'),
    async = require('async'),
    fs = require('fs'),
    path = require('path');

/* > generated by Thot */
var data = [
    {
        file : 'media/css/fonts.googleapis.montserrat.css',
        compress : true,
    },
    {
        file : 'media/css/bootstrap.min.css',
        compress : false,
    },
    {
        file : 'media/css/font-awesome.min.css',
        compress : false,
    },
    {
        file : 'media/css/elegant-icons.css',
        compress : true,
    },
    {
        file : 'media/css/flaticon.css',
        compress : true,
    },
    {
        file : 'media/css/owl.carousel.min.css',
        compress : false,
    },
    {
        file : 'media/css/slicknav.min.css',
        compress : false,
    },
    {
        file : 'media/css/style.css',
        compress : true,
    },
    {
        file : 'media/css/custom-style.css',
        compress : true,
    }	
]
/* < generated by Thot */

data.forEach(function (item) {
    var file = item.file;
	var res = fs.readFileSync(file, 'utf8');	
	if (item.resolveMediaUrl)
	    res = res.replace(/{{ MEDIA_URL }}/g, "/media_site/");
	if (item.compress)
		res = new CleanCSS().minify(res);
	item.css = res
});

var globalCss = "";
data.forEach(function (item) {
	globalCss = globalCss + '\n' + item.css
});
fs.writeFile('media/css/global.min.css', globalCss, function(e) {
	console.log("DONE");
});